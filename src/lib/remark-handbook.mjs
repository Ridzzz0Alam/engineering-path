// Remark plugin that adapts the handbook Markdown for this site:
//  - drops the leading H1 (the lesson layout renders the title)
//  - rewrites relative links to lessons, code samples, images and files
//  - turns ```mermaid fences into captioned <pre class="mermaid"> panels for client rendering
//  - turns the Q and A pairs under "## Flashcards" into collapsible cards
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

const VIZ_CAP = '<div class="viz-cap">Diagram</div>';

const mermaidNode = (source, description = '') => ({
  type: 'html',
  viz: { source, description },
  value: `<div class="viz"${description ? ` role="img" aria-label="${escapeAttr(description)}"` : ''}>${VIZ_CAP}<pre class="mermaid">${escapeHtml(source)}</pre></div>`,
});

// The italic line under a diagram is its caption, so it moves into the panel as the title.
function captionDiagrams(parent) {
  for (let i = parent.children.length - 2; i >= 0; i--) {
    const { viz } = parent.children[i];
    const next = parent.children[i + 1];
    if (!viz || next.type !== 'paragraph' || next.children.length !== 1 || next.children[0].type !== 'emphasis') continue;
    const label = viz.description ? ` role="img" aria-label="${escapeAttr(viz.description)}"` : '';
    parent.children.splice(
      i,
      2,
      { type: 'html', value: `<div class="viz"${label}>${VIZ_CAP}` },
      { type: 'paragraph', data: { hName: 'div', hProperties: { className: ['viz-title'] } }, children: next.children[0].children },
      { type: 'html', value: `<pre class="mermaid">${escapeHtml(viz.source)}</pre></div>` },
    );
  }
}

const isLabel = (node, label) => node?.type === 'strong' && node.children[0]?.value === label;
const startsWithLabel = (node, label) => node.type === 'paragraph' && isLabel(node.children[0], label);

// Removes the line break or spaces left around a Q or A once its label is gone.
function trimInline(children) {
  const nodes = children.filter((n, i) => !(n.type === 'break' && (i === 0 || i === children.length - 1)));
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (first?.type === 'text') first.value = first.value.trimStart();
  if (last?.type === 'text') last.value = last.value.trimEnd();
  return nodes.filter((n) => n.type !== 'text' || n.value);
}

function markdownCards(nodes) {
  const out = [];
  let card = null;
  for (const node of nodes) {
    if (startsWithLabel(node, 'Q:')) {
      const split = node.children.findIndex((n) => isLabel(n, 'A:'));
      const question = split === -1 ? node.children.slice(1) : node.children.slice(1, split);
      card = {
        type: 'flashcard',
        data: { hName: 'details', hProperties: { className: ['flashcard'] } },
        children: [{ type: 'paragraph', data: { hName: 'summary' }, children: trimInline(question) }],
      };
      if (split !== -1) card.children.push({ type: 'paragraph', children: trimInline(node.children.slice(split + 1)) });
      out.push(card);
    } else if (card && startsWithLabel(node, 'A:')) {
      card.children.push({ type: 'paragraph', children: trimInline(node.children.slice(1)) });
    } else if (card) {
      card.children.push(node);
    } else {
      out.push(node);
    }
  }
  return out;
}

const inlineCode = (s) => s.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);

// Some lessons already wrap each card in <details>; those only need their labels removed.
function htmlCards(nodes) {
  nodes.forEach((node, i) => {
    if (node.type !== 'html') return;
    const m = node.value.match(/^<details>\s*<summary>(?:<strong>)?(?:Q:\s*)?([\s\S]*?)(?:<\/strong>)?<\/summary>\s*$/);
    if (!m) return;
    node.value = `<details class="flashcard"><summary>${inlineCode(m[1])}</summary>`;
    const first = nodes[i + 1]?.type === 'paragraph' ? nodes[i + 1].children[0] : null;
    if (first?.type === 'text') first.value = first.value.replace(/^A:\s*/, '');
  });
  return nodes;
}

function flashcards(tree) {
  const start = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 2 && n.children[0]?.value === 'Flashcards');
  if (start === -1) return;
  let end = start + 1;
  while (end < tree.children.length && !(tree.children[end].type === 'heading' && tree.children[end].depth <= 2)) end++;
  const section = tree.children.slice(start + 1, end);
  tree.children.splice(start + 1, section.length, ...markdownCards(htmlCards(section)));
}

// Headings start with a capital, unless they start with a name or code that is spelled in lowercase.
const LOWERCASE_NAMES = /^(eBay|mTLS|gRPC|vLLM|etcd|pgvector|turbopuffer|getNewsFeed|postTweet)\b/;

function capitaliseHeading(node) {
  const first = node.children[0];
  if (first?.type !== 'text' || LOWERCASE_NAMES.test(first.value)) return;
  first.value = first.value.charAt(0).toUpperCase() + first.value.slice(1);
}

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
    flashcards(tree);

    visit(tree, 'heading', capitaliseHeading);

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
            parent.viz = replacement.viz;
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
        parent.children[index] = mermaidNode(node.value);
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

    visit(tree, (node) => {
      if (node.children) captionDiagrams(node);
    });
  };
}
