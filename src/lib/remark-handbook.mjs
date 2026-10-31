// Remark plugin that adapts the handbook Markdown for this site:
//  - drops the leading H1 (the lesson layout renders the title)
//  - rewrites relative links to lessons, code samples, images and files
//  - turns ```mermaid fences into <pre class="mermaid"> for client rendering
//  - turns GitHub-style "> [!WARNING]" blockquotes into styled callouts
//  - swaps illustrations for their Mermaid versions (see image-diagrams.mjs)
//  - shows a solution's Python, Java, C++ and Go as language tabs

import { visit, SKIP } from 'unist-util-visit';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { IMAGE_DIAGRAMS, TEXT_DIAGRAMS } from './image-diagrams.mjs';
import { CONTENT_ROOT, SOURCE_REPO, CODE_EXTS, lessonUrl, folderUrl, codeUrl, fileUrl } from './paths.mjs';

const CALLOUTS = {
  NOTE: 'Note',
  TIP: 'Tip',
  IMPORTANT: 'Important',
  WARNING: 'Warning',
  CAUTION: 'Caution',
};

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

const mermaidNode = (source, description = '') => ({
  type: 'html',
  value: `<div class="diagram"${description ? ` role="img" aria-label="${escapeAttr(description)}"` : ''}><pre class="mermaid">${escapeHtml(source)}</pre></div>`,
});

const TAB_LANGS = { Python: 'python', Java: 'java', 'C++': 'cpp', Go: 'go' };

// "**Solution** in Python ([Java](...) · [C++](...) · [Go](...))" followed by the Python code.
function solutionTabs(tree, relDir) {
  if (relDir === null) return;
  const root = path.resolve(CONTENT_ROOT);
  for (let i = tree.children.length - 2; i >= 0; i--) {
    const intro = tree.children[i];
    const code = tree.children[i + 1];
    if (intro.type !== 'paragraph' || code.type !== 'code' || code.lang !== 'python') continue;
    const first = intro.children[0];
    if (first?.type !== 'strong' || first.children[0]?.value !== 'Solution') continue;

    const others = intro.children
      .filter((n) => n.type === 'link' && TAB_LANGS[n.children[0]?.value])
      .map((n) => ({ label: n.children[0].value, file: path.join(root, relDir, decodeURI(n.url)) }))
      .filter((o) => existsSync(o.file));
    if (!others.length) continue;

    const panels = [
      { label: 'Python', lang: 'python', value: code.value },
      ...others.map((o) => ({
        label: o.label,
        lang: TAB_LANGS[o.label],
        value: readFileSync(o.file, 'utf8').trimEnd(),
      })),
    ];
    const buttons = panels
      .map((p, n) => `<button type="button" role="tab" data-lang="${p.lang}" aria-selected="${n === 0}"${n ? ' tabindex="-1"' : ''}>${escapeHtml(p.label)}</button>`)
      .join('');
    const nodes = [{ type: 'html', value: `<div class="code-tabs" data-code-tabs><div class="code-tabs-bar"><span class="code-tabs-title">Solution</span><div class="code-tablist" role="tablist" aria-label="Solution language">${buttons}</div></div>` }];
    panels.forEach((p, n) => {
      nodes.push(
        { type: 'html', value: `<div class="code-panel${n ? '' : ' active'}" role="tabpanel" data-lang="${p.lang}">` },
        { type: 'code', lang: p.lang, value: p.value },
        { type: 'html', value: '</div>' },
      );
    });
    nodes.push({ type: 'html', value: '</div>' });
    tree.children.splice(i, 2, ...nodes);
  }
}

function contentRelDir(file) {
  const abs = file.path || file.history?.[0];
  if (!abs) return null;
  const root = path.resolve(CONTENT_ROOT);
  const rel = path.relative(root, path.dirname(abs));
  return rel.startsWith('..') ? null : rel;
}

function rewriteUrl(url, relDir) {
  if (!url || relDir === null) return url;
  if (/^([a-z]+:|#|\/|mailto:)/i.test(url)) return url;
  const [rawPath, hash] = url.split('#');
  if (!rawPath) return url;
  const target = path.posix.normalize(path.posix.join(relDir, decodeURI(rawPath)));
  const anchor = hash ? '#' + hash : '';

  // Links that leave the content folder point back to the source repo.
  if (target.startsWith('..')) {
    const repoPath = path.posix.normalize(path.posix.join('content', target));
    return `${SOURCE_REPO}/blob/main/${repoPath}${anchor}`;
  }
  if (target.endsWith('.md')) {
    if (/(^|\/)README\.md$/.test(target)) return folderUrl(path.posix.dirname(target));
    return lessonUrl(target) + anchor;
  }
  const ext = target.split('.').pop()?.toLowerCase();
  if (!target.includes('.') || target.endsWith('/')) return folderUrl(target) ;
  if (CODE_EXTS.includes(ext)) return codeUrl(target);
  return fileUrl(target);
}

export default function remarkHandbook() {
  return (tree, file) => {
    const relDir = contentRelDir(file);

    // 1. Remove the first H1.
    const firstH1 = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 1);
    if (firstH1 !== -1 && firstH1 < 3) tree.children.splice(firstH1, 1);

    solutionTabs(tree, relDir);

    visit(tree, (node, index, parent) => {
      // 2. Links and images.
      if (node.type === 'link' || node.type === 'definition') {
        node.url = rewriteUrl(node.url, relDir);
        if (/^https?:/.test(node.url)) {
          node.data = node.data || {};
          node.data.hProperties = { ...(node.data.hProperties || {}), target: '_blank', rel: 'noopener' };
        }
      }
      if (node.type === 'image' && parent && index !== undefined && relDir !== null) {
        const [, part] = relDir.split(path.sep);
        const key = `${part}/${path.basename(decodeURI(node.url)).replace(/\.\w+$/, '')}`;
        if (IMAGE_DIAGRAMS[key]) {
          // An image alone in its paragraph replaces the paragraph, so the diagram isn't nested in a <p>.
          const replacement = mermaidNode(IMAGE_DIAGRAMS[key], node.alt ?? '');
          if (parent.type === 'paragraph' && parent.children.length === 1) {
            parent.type = 'html';
            parent.value = replacement.value;
            delete parent.children;
          } else {
            parent.children[index] = replacement;
          }
          return SKIP;
        }
      }
      if (node.type === 'code' && relDir !== null && !node.lang?.includes('mermaid')) {
        const lesson = path.basename(file.path || file.history?.[0] || '', '.md');
        const source = TEXT_DIAGRAMS[`${relDir.split(path.sep).join('/')}/${lesson}#${node.value.split(':')[0]}:`];
        if (source && parent && index !== undefined) {
          parent.children[index] = mermaidNode(source);
          return SKIP;
        }
      }
      if (node.type === 'image' && relDir !== null && !/^([a-z]+:|\/)/i.test(node.url)) {
        const target = path.posix.normalize(path.posix.join(relDir, decodeURI(node.url)));
        node.url = fileUrl(target);
      }

      // 3. Mermaid.
      if (node.type === 'code' && node.lang === 'mermaid' && parent && index !== undefined) {
        parent.children[index] = {
          type: 'html',
          value: `<div class="diagram"><pre class="mermaid">${escapeHtml(node.value)}</pre></div>`,
        };
        return SKIP;
      }

      // 4. Callouts.
      if (node.type === 'blockquote') {
        const first = node.children[0];
        const text = first?.type === 'paragraph' ? first.children[0] : null;
        if (text?.type === 'text') {
          const m = text.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);
          if (m) {
            const kind = m[1];
            text.value = text.value.slice(m[0].length);
            if (!text.value) first.children.shift();
            if (first.children[0]?.type === 'break') first.children.shift();
            if (first.children.length === 0) node.children.shift();
            node.data = {
              hName: 'aside',
              hProperties: { className: ['callout', `callout-${kind.toLowerCase()}`] },
            };
            node.children.unshift({
              type: 'paragraph',
              data: { hProperties: { className: ['callout-title'] } },
              children: [{ type: 'text', value: CALLOUTS[kind] }],
            });
          }
        }
      }
    });
  };
}
