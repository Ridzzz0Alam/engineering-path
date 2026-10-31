// Reading progress and notes are kept in this browser only (localStorage).

const DONE_KEY = 'lwr:done';
const NOTE_PREFIX = 'lwr:note:';
const LAST_KEY = 'lwr:last:';

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const getDone = () => new Set(read<string[]>(DONE_KEY, []));

export function setDone(id: string, done: boolean) {
  const s = getDone();
  done ? s.add(id) : s.delete(id);
  write(DONE_KEY, [...s]);
  refreshProgress();
}

export const getNote = (id: string) => read<string>(NOTE_PREFIX + id, '');
export function setNote(id: string, text: string) {
  try {
    if (text.trim()) localStorage.setItem(NOTE_PREFIX + id, JSON.stringify(text));
    else localStorage.removeItem(NOTE_PREFIX + id);
  } catch {}
}

export function allNotes(): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(NOTE_PREFIX)) out.push({ id: k.slice(NOTE_PREFIX.length), text: read(k, '') });
    }
  } catch {}
  return out.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

export const setLast = (course: string, url: string) => write(LAST_KEY + course, url);
export const getLast = (course: string) => read<string | null>(LAST_KEY + course, null);

/** Updates every element marked with data-lesson-id, data-progress or data-count. */
export function refreshProgress() {
  const done = getDone();
  document.querySelectorAll<HTMLElement>('[data-lesson-id]').forEach((el) => {
    el.classList.toggle('done', done.has(el.dataset.lessonId!));
  });
  document.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => {
    const ids = (el.dataset.progress ?? '').split(',').filter(Boolean);
    const n = ids.filter((id) => done.has(id)).length;
    const pct = ids.length ? Math.round((n / ids.length) * 100) : 0;
    const bar = el.querySelector<HTMLElement>('.progress > span');
    if (bar) bar.style.width = pct + '%';
    const label = el.querySelector<HTMLElement>('[data-progress-label]');
    if (label) label.textContent = n ? `${n} of ${ids.length} done · ${pct}%` : `${ids.length} lessons · not started`;
  });
}
