// Replaces em dashes in the lesson content with words or punctuation that fit the context.
// The import runs this, so freshly imported handbook content stays free of them too.
//
// Usage: node scripts/remove-em-dashes.mjs [folder]    (default: src/data/handbooks)

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT_FILE = /\.(md|yml|py|java|cpp|go)$/;
const DASH = /[ \t]*—[ \t]*/;

// These already read naturally after a comma.
const CONNECTOR = /^(?:but|and|or|so|yet|because|since|which|who|whose|where|when|while|unless|though|although|not|as|if|then|that is,|i\.e\.|e\.g\.|for example|for instance|including|especially|even|just|only|rather|plus|meaning|otherwise|thus|hence|instead|once|until|before|after|without|with|via|by|except|like|such as|whether|however|therefore)(?=[\s,]|$)/i;
// A new clause with its own subject, so it needs a joining word.
// The dash closed an aside, and the sentence's verb follows.
const VERB_FOLLOWS = /^(is|are|was|were|has|have|had|can|will|does|do)\b/i;
const NEW_CLAUSE = /^(it|it's|this|they|we|you|there|these|those|he|she)\b/i;

// Mermaid and unquoted YAML give a colon its own meaning, so those lines can't take one.
function joinDash(left, right, colonSafe) {
  if (!left.trim()) return right; // A dash that only introduced the line.
  if (!right.trim()) return left.trimEnd() + ','; // The sentence carries on on the next line.
  if (VERB_FOLLOWS.test(right)) return `${left}, ${right}`;
  if (CONNECTOR.test(right)) return `${left}, ${right}`;
  if (NEW_CLAUSE.test(right)) return `${left}, and ${right}`;
  if (!colonSafe) return `${left} - ${right}`;
  // Don't stack two colons in one sentence.
  return /:\s[^.!?]*$/.test(left) ? `${left}, ${right}` : `${left}: ${right}`;
}

export function cleanLine(line, { colonSafe = true, quotedYaml = false } = {}) {
  if (!line.includes('—')) return line;
  let out = line
    .replace(/\b(LC ?\d+[A-Za-z]?)[ \t]*—[ \t]*/g, colonSafe ? '$1: ' : '$1 - ')
    .replace(/^\*\*Solution\*\*[ \t]*—[ \t]*/, '**Solution** in ')
    .replace(/[ \t]*—[ \t]*(rendered on the website)/g, ', $1')
    .replace(/\|[ \t]*—[ \t]*(?=\|)/g, '| n/a ');

  // Two dashes around a short aside: "the cache — usually Redis — is".
  if (colonSafe || quotedYaml) {
    out = out.replace(/[ \t]+—[ \t]+([^—.;:|]{1,70}?)[ \t]+—[ \t]+/g, (m, aside, at, all) =>
      /^[-#*>\s]*$/.test(all.slice(0, at)) ? m : ` (${aside}) `,
    );
  }

  let match;
  while ((match = DASH.exec(out))) {
    const left = out.slice(0, match.index);
    // Inside a double-quoted YAML string a colon is just text.
    const quoted = quotedYaml && (left.split('"').length - 1) % 2 === 1;
    out = joinDash(left, out.slice(match.index + match[0].length), colonSafe || quoted);
  }
  return out;
}

// "--" used as a dash in lesson prose. Inline code, URLs and link targets keep theirs.
const KEEP_AS_TYPED = /(`[^`]*`|https?:\/\/\S+|\]\([^)]*\))/;
function prosePunctuation(line) {
  return line
    .split(KEEP_AS_TYPED)
    .map((part, i) =>
      i % 2 ? part : part.replace(/(^|\s)--(?=\s|$)/g, '$1\u2014').replace(/([A-Za-z,)])--(?=[A-Za-z])/g, '$1\u2014'),
    )
    .join('');
}

export function cleanText(text, file) {
  const yaml = file.endsWith('.yml');
  let inMermaid = false;
  let inFrontmatter = false;
  let inFence = false;
  let blockIndent = -1; // Indent of the YAML key that opened a "|" or ">" text block.
  return text
    .split('\n')
    .map((line, i) => {
      if (!yaml && file.endsWith('.md')) {
        if (i === 0 && line === '---') inFrontmatter = true;
        else if (inFrontmatter && line === '---') inFrontmatter = false;
        if (/^\s*```mermaid/.test(line)) inMermaid = true;
        else if (inMermaid && /^\s*```/.test(line)) inMermaid = false;
        if (/^\s*```/.test(line)) inFence = !inFence;
        else if (!inFence && !inFrontmatter) line = prosePunctuation(line);
      }
      const indent = line.search(/\S/);
      if (yaml && blockIndent >= 0 && indent >= 0 && indent <= blockIndent) blockIndent = -1;
      const inBlock = blockIndent >= 0;
      if (yaml && !inBlock && /:\s*[|>][-+]?\s*(#.*)?$/.test(line)) blockIndent = indent;
      const yamlText = yaml && (inBlock || /^\s*#/.test(line));
      const colonSafe = !inMermaid && !inFrontmatter && (!yaml || yamlText);
      return cleanLine(line, { colonSafe, quotedYaml: yaml || inFrontmatter });
    })
    .join('\n');
}

export function removeEmDashes(dir) {
  let changed = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) changed += removeEmDashes(p);
    else if (TEXT_FILE.test(name)) {
      const before = readFileSync(p, 'utf8');
      const after = cleanText(before, p);
      if (after !== before) {
        writeFileSync(p, after);
        changed++;
      }
    }
  }
  return changed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2] ?? 'src/data/handbooks');
  console.log(`Removed em dashes from ${removeEmDashes(dir)} files in ${dir}`);
}
