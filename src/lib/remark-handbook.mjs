// Remark plugin that adapts the handbook Markdown for this site:
//  - drops the leading H1 (the lesson layout renders the title)
//  - rewrites relative links to lessons, code samples, images and files
//  - turns ```mermaid fences into <pre class="mermaid"> for client rendering
//  - turns GitHub-style "> [!WARNING]" blockquotes into styled callouts

import { visit, SKIP } from 'unist-util-visit';
import path from 'node:path';
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

    visit(tree, (node, index, parent) => {
      // 2. Links and images.
      if (node.type === 'link' || node.type === 'definition') {
        node.url = rewriteUrl(node.url, relDir);
        if (/^https?:/.test(node.url)) {
          node.data = node.data || {};
          node.data.hProperties = { ...(node.data.hProperties || {}), target: '_blank', rel: 'noopener' };
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
