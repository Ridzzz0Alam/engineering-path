import { getCollection, type CollectionEntry } from 'astro:content';
import { HANDBOOKS, getHandbook, prettyFolder, partNumber, type HandbookConfig } from './handbooks';
import { lessonUrl, slugSegment } from './paths.mjs';

export interface Lesson {
  id: string; // content path, e.g. hld/part-1-core-fundamentals/00-scalability
  url: string;
  handbook: string;
  folder: string;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  minutes: number;
  diagrams: number;
  updated?: Date;
  indexInPart: number; // 1-based
  globalIndex: number; // 1-based within handbook
  entry: CollectionEntry<'lessons'>;
}

export interface Part {
  folder: string;
  slug: string;
  title: string;
  number: number | null;
  label: string; // "Part 3" or "Extra"
  summary: string;
  lessons: Lesson[];
  minutes: number;
}

export interface Course {
  config: HandbookConfig;
  parts: Part[];
  lessons: Lesson[];
  minutes: number;
  diagrams: number;
}

const DIFFICULTY: Record<string, Lesson['difficulty']> = {
  beginner: 'beginner',
  easy: 'beginner',
  intermediate: 'intermediate',
  medium: 'intermediate',
  advanced: 'advanced',
  hard: 'advanced',
};

const WORDS_PER_MIN = 220;

function countWords(body = ''): number {
  return body
    .replace(/```mermaid[\s\S]*?```/g, ' ')
    .replace(/<details>[\s\S]*?<\/details>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

let cache: Map<string, Course> | null = null;

export async function getCourses(): Promise<Map<string, Course>> {
  if (cache) return cache;
  const entries = await getCollection('lessons');
  const courses = new Map<string, Course>();

  for (const config of HANDBOOKS) {
    const mine = entries.filter((e) => e.id.startsWith(config.id + '/'));
    const byFolder = new Map<string, CollectionEntry<'lessons'>[]>();
    for (const e of mine) {
      const folder = e.id.split('/')[1];
      if (config.hidden?.includes(folder)) continue;
      if (!byFolder.has(folder)) byFolder.set(folder, []);
      byFolder.get(folder)!.push(e);
    }

    const order = config.stages.flatMap((s) => s.parts);
    const missing = [...byFolder.keys()].filter((f) => !order.includes(f));
    if (missing.length) throw new Error(`[${config.id}] folders not placed in a stage: ${missing.join(', ')}`);

    const parts: Part[] = [];
    let globalIndex = 0;
    for (const folder of order) {
      const list = (byFolder.get(folder) ?? []).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
      if (!list.length) continue;
      const num = partNumber(folder);
      const lessons: Lesson[] = list.map((entry, i) => {
        const body = entry.body ?? '';
        return {
          id: entry.id,
          url: lessonUrl(entry.id),
          handbook: config.id,
          folder,
          title: entry.data.title,
          description: entry.data.description,
          difficulty: DIFFICULTY[(entry.data.difficulty ?? '').toLowerCase()] ?? 'intermediate',
          minutes: Math.max(3, Math.round(countWords(body) / WORDS_PER_MIN)),
          diagrams: (body.match(/```mermaid/g) ?? []).length + (body.match(/!\[[^\]]*\]\(/g) ?? []).length,
          updated: entry.data.date_updated,
          indexInPart: i + 1,
          globalIndex: ++globalIndex,
          entry,
        };
      });
      parts.push({
        folder,
        slug: slugSegment(folder),
        title: prettyFolder(folder, config),
        number: num,
        label: num !== null ? `Part ${num}` : 'Extra',
        summary: config.partSummaries[folder] ?? '',
        lessons,
        minutes: lessons.reduce((s, l) => s + l.minutes, 0),
      });
    }

    const lessons = parts.flatMap((p) => p.lessons);
    courses.set(config.id, {
      config,
      parts,
      lessons,
      minutes: lessons.reduce((s, l) => s + l.minutes, 0),
      diagrams: lessons.reduce((s, l) => s + l.diagrams, 0),
    });
  }
  cache = courses;
  return courses;
}

export async function getCourse(id: string): Promise<Course> {
  return (await getCourses()).get(id)!;
}

/** Resolve the handbooks' various prerequisite formats to lessons. */
export function resolvePrerequisites(course: Course, lesson: Lesson): Lesson[] {
  const raw = lesson.entry.data.prerequisites ?? [];
  const out: Lesson[] = [];
  for (const p of raw) {
    const clean = String(p).replace(/\.md$/, '');
    const bare = slugSegment(clean.replace(/^\d+\.\d+-/, '').split('/').pop()!);
    const found =
      course.lessons.find((l) => l.id === `${course.config.id}/${clean}`) ??
      course.lessons.find((l) => l.id.endsWith('/' + clean)) ??
      course.lessons.find((l) => slugSegment(l.id.split('/').pop()!) === bare);
    if (found && found.id !== lesson.id && !out.includes(found)) out.push(found);
  }
  return out;
}

export const formatMinutes = (m: number) => {
  if (m < 60) return `${m} min`;
  const h = m / 60;
  return h < 10 ? `${h.toFixed(1).replace(/\.0$/, '')} hrs` : `${Math.round(h)} hrs`;
};

export { getHandbook };

const dependents = new WeakMap<Course, Map<string, Lesson[]>>();

/** Lessons to suggest after this one: those that build on it, then the rest of its part. Skips the very next lesson, which the pager already links. */
export function relatedLessons(course: Course, lesson: Lesson, limit = 3): Lesson[] {
  let byPrereq = dependents.get(course);
  if (!byPrereq) {
    byPrereq = new Map();
    for (const l of course.lessons) {
      for (const p of resolvePrerequisites(course, l)) {
        byPrereq.set(p.id, [...(byPrereq.get(p.id) ?? []), l]);
      }
    }
    dependents.set(course, byPrereq);
  }
  const next = course.lessons[course.lessons.indexOf(lesson) + 1];
  const samePart = course.lessons.filter((l) => l.folder === lesson.folder && l.globalIndex > lesson.globalIndex);
  return [...new Set([...(byPrereq.get(lesson.id) ?? []), ...samePart])].filter((l) => l !== next).slice(0, limit);
}
