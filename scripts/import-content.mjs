// Copies the CC BY-SA 4.0 handbook content into this site.
//
// Usage:
//   git clone --depth 1 https://github.com/handbook-academy/engineering-handbook.git ../engineering-handbook
//   npm run import-content -- ../engineering-handbook
//
// Markdown, images and code samples go to src/data/handbooks/<handbook>/...
// The source commit is recorded in src/data/source.json for attribution.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, relative, sep } from 'node:path';
import { removeEmDashes } from './remove-em-dashes.mjs';
import { IMAGE_DIAGRAMS } from '../src/lib/image-diagrams.mjs';

const HANDBOOKS = ['hld', 'dsa', 'ai-eng'];
const SKIP_FILES = new Set(['README.md']);

const src = resolve(process.argv[2] ?? '../engineering-handbook');
const dest = resolve('src/data/handbooks');

if (!existsSync(join(src, 'content'))) {
  console.error(`No content/ folder found in ${src}. Pass the path to a clone of the handbook repo.`);
  process.exit(1);
}

// Only the handbook's own courses are replaced: the Machine Learning course has its own import.
for (const hb of HANDBOOKS) rmSync(join(dest, hb), { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

let count = 0;
for (const hb of HANDBOOKS) {
  cpSync(join(src, 'content', hb), join(dest, hb), {
    recursive: true,
    filter: (path) => {
      const name = path.split('/').pop();
      if (SKIP_FILES.has(name)) return false;
      if (name.startsWith('.')) return false;
      if (!statSync(path).isDirectory()) count++;
      return true;
    },
  });
}

for (const hb of HANDBOOKS) removeEmDashes(join(dest, hb));

// Lessons rewritten for this site replace their handbook originals, so a re-import doesn't lose them.
const rewrites = resolve('src/data/rewrites');
if (existsSync(rewrites)) {
  cpSync(rewrites, dest, { recursive: true });
  console.log(`Applied rewritten lessons from ${relative(process.cwd(), rewrites)}`);
}

// Images and other static assets are also served from public/files/.
const publicFiles = resolve('public/files');
for (const hb of HANDBOOKS) rmSync(join(publicFiles, hb), { recursive: true, force: true });
const STATIC_EXTS = /\.(png|jpe?g|gif|svg|webp|pdf)$/i;
function copyStatic(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) copyStatic(p);
    else if (STATIC_EXTS.test(name)) {
      // Illustrations redrawn as Mermaid aren't displayed, so don't keep them.
      const [, part] = relative(dest, p).split(sep);
      if (IMAGE_DIAGRAMS[`${part}/${name.replace(/\.\w+$/, '')}`]) {
        rmSync(p);
        continue;
      }
      const out = join(publicFiles, relative(dest, p));
      mkdirSync(join(out, '..'), { recursive: true });
      cpSync(p, out);
    }
  }
}
for (const hb of HANDBOOKS) copyStatic(join(dest, hb));

let commit = 'unknown';
try {
  commit = execSync('git rev-parse HEAD', { cwd: src }).toString().trim();
} catch {}

writeFileSync(
  resolve('src/data/source.json'),
  JSON.stringify(
    {
      repo: 'https://github.com/handbook-academy/engineering-handbook',
      commit,
      importedAt: new Date().toISOString().slice(0, 10),
      license: 'CC BY-SA 4.0',
    },
    null,
    2,
  ) + '\n',
);

console.log(`Imported ${count} files from ${relative(process.cwd(), src) || src} @ ${commit.slice(0, 7)}`);
