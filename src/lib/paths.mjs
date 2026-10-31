// Path helpers shared by the Markdown plugins (build time) and the pages.
// A "content path" is relative to src/data/handbooks, without extension,
// e.g. "hld/part-1-core-fundamentals/00-scalability".

export const CONTENT_ROOT = 'src/data/handbooks';
export const SOURCE_REPO = 'https://github.com/handbook-academy/engineering-handbook';

/** "part-1-core-fundamentals" -> "core-fundamentals", "00-scalability" -> "scalability" */
export function slugSegment(seg) {
  return seg
    .replace(/^part-\d+-/, '')
    .replace(/^\d+-/, '')
    .toLowerCase();
}

/** Content path -> site URL ("/hld/core-fundamentals/scalability/"). */
export function lessonUrl(contentPath) {
  const parts = contentPath.replace(/\.md$/, '').split('/');
  const [hb, ...rest] = parts;
  return '/' + [hb, ...rest.map(slugSegment)].join('/') + '/';
}

/** Folder path ("hld/part-9-ai-ml-system-design") -> anchor on the course page. */
export function folderUrl(folderPath) {
  const [hb, folder] = folderPath.replace(/\/$/, '').split('/');
  return folder ? `/${hb}/#${slugSegment(folder)}` : `/${hb}/`;
}

export const CODE_EXTS = ['py', 'java', 'cpp', 'go', 'yml', 'yaml', 'js', 'ts'];

/** Code sample path ("dsa/.../lc-23/sol.py") -> viewer page URL. */
export function codeUrl(filePath) {
  return '/code/' + filePath + '/';
}

/** Images and other static files are served from /files/. */
export function fileUrl(filePath) {
  return '/files/' + filePath;
}
