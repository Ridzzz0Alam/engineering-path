import source from '../data/source.json';

export const SITE = {
  name: 'Engineering Path',
  author: 'Ridwan',
  repo: 'https://github.com/Ridzzz0Alam/engineering-path',
  description:
    'Free, structured courses on system design, data structures & algorithms, and AI engineering.',
  // Fill these in when you have them; empty values are hidden.
  social: {
    github: '',
    linkedin: '',
    x: '',
  },
};

export const SOURCE = source as { repo: string; commit: string; importedAt: string; license: string };
export const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
