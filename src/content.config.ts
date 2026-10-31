import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/README.md', '!dsa/widgets/**'],
    base: './src/data/handbooks',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      difficulty: z.string().optional(),
      prerequisites: z.array(z.string()).nullish(),
      technologies: z.array(z.string()).nullish(),
      tags: z.array(z.string()).nullish(),
      date_updated: z.coerce.date().optional(),
    })
    .passthrough(),
});

export const collections = { lessons };
