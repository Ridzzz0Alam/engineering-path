// Copies Microsoft's MIT-licensed "ML For Beginners" lessons into the Machine Learning course.
//
// Usage:
//   git clone --depth 1 https://github.com/microsoft/ML-For-Beginners.git ../ML-For-Beginners
//   npm run import-ml -- ../ML-For-Beginners
//
// Lessons go to src/data/handbooks/ml/ and their images to public/files/ml/. Links to notebooks and
// assignments point at the source repo, pinned to the imported commit, which is recorded in
// src/data/ml-source.json for attribution.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { basename, dirname, join, normalize, relative, resolve } from 'node:path';
import { removeEmDashes } from './remove-em-dashes.mjs';
import { lessonUrl } from '../src/lib/paths.mjs';

const REPO = 'https://github.com/microsoft/ML-For-Beginners';

const PARTS = [
  ['1-Introduction', 'part-1-introduction'],
  ['2-Regression', 'part-2-regression'],
  ['3-Web-App', 'part-3-web-app'],
  ['4-Classification', 'part-4-classification'],
  ['5-Clustering', 'part-5-clustering'],
  ['6-NLP', 'part-6-nlp'],
  ['7-TimeSeries', 'part-7-time-series'],
  ['8-Reinforcement', 'part-8-reinforcement-learning'],
  ['9-Real-World', 'part-9-real-world'],
];

// Source folder, lesson file name, difficulty, and a description written for this site.
const LESSONS = [
  ['1-Introduction/1-intro-to-ML', '01-intro-to-ml', 'beginner', 'What machine learning is, how it relates to AI, and how to set up your tools to study it.'],
  ['1-Introduction/2-history-of-ML', '02-history-of-ml', 'beginner', 'The milestones behind modern machine learning, from early statistics to today.'],
  ['1-Introduction/3-fairness', '03-responsible-ai', 'beginner', 'The principles of responsible AI, and how bias and unfairness get into models.'],
  ['1-Introduction/4-techniques-of-ML', '04-techniques-of-ml', 'beginner', 'The ML workflow: asking a question, preparing data, training, evaluating and tuning.'],
  ['2-Regression/1-Tools', '01-tools', 'beginner', 'Set up Python, notebooks and Scikit-learn, then fit your first regression model.'],
  ['2-Regression/2-Data', '02-prepare-data', 'beginner', 'Clean a pumpkin pricing dataset and explore it with charts before modelling.'],
  ['2-Regression/3-Linear', '03-linear-polynomial', 'intermediate', 'Build linear and polynomial regression models and compare how well they predict.'],
  ['2-Regression/4-Logistic', '04-logistic', 'intermediate', 'Use logistic regression to predict categories, and read a confusion matrix and ROC curve.'],
  ['3-Web-App/1-Web-App', '01-web-app', 'intermediate', 'Train a model, save it with Pickle and serve its predictions from a Flask app.'],
  ['4-Classification/1-Introduction', '01-introduction', 'intermediate', 'Prepare and balance a cuisines dataset for classification.'],
  ['4-Classification/2-Classifiers-1', '02-classifiers-1', 'intermediate', 'Choose a classifier with the Scikit-learn cheat sheet and train a logistic regression model.'],
  ['4-Classification/3-Classifiers-2', '03-classifiers-2', 'intermediate', 'Compare SVC, KNN, ensemble and other classifiers on the same data.'],
  ['4-Classification/4-Applied', '04-applied', 'intermediate', 'Export a classifier to ONNX and use it in a cuisine recommender web app.'],
  ['5-Clustering/1-Visualize', '01-visualize', 'intermediate', 'What clustering is, and how to explore Nigerian music data before grouping it.'],
  ['5-Clustering/2-K-Means', '02-k-means', 'intermediate', 'Group data with K-Means, pick a cluster count with the elbow method, and check the variance.'],
  ['6-NLP/1-Introduction-to-NLP', '01-introduction', 'intermediate', 'What natural language processing is, why language is hard, and how to build a simple bot.'],
  ['6-NLP/2-Tasks', '02-tasks', 'intermediate', 'Common NLP tasks such as tokenization, parsing, n-grams and part-of-speech tagging.'],
  ['6-NLP/3-Translation-Sentiment', '03-translation-sentiment', 'intermediate', 'How translation and sentiment analysis work, using classic literature as the data.'],
  ['6-NLP/4-Hotel-Reviews-1', '04-hotel-reviews-1', 'intermediate', 'Explore and clean a large hotel reviews dataset with Pandas.'],
  ['6-NLP/5-Hotel-Reviews-2', '05-hotel-reviews-2', 'intermediate', 'Filter review tags, remove stop words and run sentiment analysis on the hotel data.'],
  ['7-TimeSeries/1-Introduction', '01-introduction', 'intermediate', 'The concepts behind time series forecasting, with electricity usage as the example.'],
  ['7-TimeSeries/2-ARIMA', '02-arima', 'intermediate', 'Forecast future electricity usage with an ARIMA model.'],
  ['7-TimeSeries/3-SVR', '03-svr', 'intermediate', 'Forecast the same data with a Support Vector Regressor and compare the results.'],
  ['8-Reinforcement/1-QLearning', '01-q-learning', 'intermediate', 'Teach an agent to navigate an environment using rewards and a Q-table.'],
  ['8-Reinforcement/2-Gym', '02-cartpole', 'intermediate', 'Apply Q-learning to a continuous problem by balancing a pole in OpenAI Gym.'],
  ['9-Real-World/1-Applications', '01-applications', 'beginner', 'How machine learning is used in finance, healthcare, conservation and other fields.'],
  ['9-Real-World/2-Debugging-ML-Models', '02-debugging-models', 'intermediate', 'Find errors and unfairness in a model using the Responsible AI dashboard.'],
];

const src = resolve(process.argv[2] ?? '../ML-For-Beginners');
const dest = resolve('src/data/handbooks/ml');
const publicDest = resolve('public/files/ml');

if (!existsSync(join(src, '1-Introduction/1-intro-to-ML/README.md'))) {
  console.error(`No lessons found in ${src}. Pass the path to a clone of ML-For-Beginners.`);
  process.exit(1);
}

const commit = execSync('git rev-parse HEAD', { cwd: src }).toString().trim();
const partFolder = Object.fromEntries(PARTS);
const contentId = ([folder, file]) => `ml/${partFolder[folder.split('/')[0]]}/${file}`;
const lessonByFolder = new Map(LESSONS.map((l) => [l[0], contentId(l)]));

rmSync(dest, { recursive: true, force: true });
rmSync(publicDest, { recursive: true, force: true });

const isExternal = (url) => /^([a-z]+:|#|\/)/i.test(url);
const github = (path) => `${REPO}/blob/${commit}/${encodeURI(path)}`;

/** A lesson's image is copied next to its part, and the Markdown points at the served copy. */
function copyImage(url, from, part, file) {
  const source = normalize(join(from, decodeURI(url.split('#')[0])));
  const name = `${file.replace(/^\d+-/, '')}-${basename(source)}`;
  const out = join(publicDest, part, 'images', name);
  mkdirSync(dirname(out), { recursive: true });
  cpSync(join(src, source), out);
  return `/files/ml/${part}/images/${name}`;
}

/** Other lessons become site links; notebooks, assignments and the like go to the source repo. */
function rewriteLink(url, from) {
  const [path, hash] = url.split('#');
  const target = normalize(join(from, decodeURI(path)));
  if (basename(target).toLowerCase() === 'readme.md') {
    const folder = dirname(target);
    const lesson = lessonByFolder.get(folder);
    if (lesson) return lessonUrl(lesson) + (hash ? `#${hash}` : '');
    if (partFolder[folder]) return `/ml/#${partFolder[folder].replace(/^part-\d+-/, '')}`;
  }
  return github(target) + (hash ? `#${hash}` : '');
}

function convert(markdown, from, part, file, title) {
  let fenced = false;
  let droppedTitle = false;
  const out = [];
  for (const raw of markdown.replace(/^﻿/, '').split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(raw)) {
      fenced = !fenced;
      out.push(raw);
      continue;
    }
    if (fenced) {
      out.push(raw);
      continue;
    }
    // The source uses these rules as slide breaks.
    if (/^\s*---+\s*$/.test(raw)) continue;
    if (!droppedTitle && /^#\s/.test(raw)) {
      droppedTitle = true;
      continue;
    }

    // Only the Python lessons are included.
    if (/available in R\b/i.test(raw)) continue;

    // A heading in the middle of a lesson is shown as a section, and the page shows the title itself.
    let line = raw.replace(/^#\s/, '## ');
    const quiz = line.match(/^#+\s*(\[(?:Pre|Post)-lecture quiz\]\(.*\))\s*$/i);
    if (quiz) line = `\n**Quiz:** ${quiz[1]}\n`;
    if (/^#+\s/.test(line)) line = line.replace(/[\p{Extended_Pictographic}️]/gu, '').replace(/^(#+)\s+/, '$1 ').trimEnd();

    line = line.replace(/!\[([^\]]*)\]\(([^)\s]+)/g, (all, alt, url) => (isExternal(url) ? all : `![${alt}](${copyImage(url, from, part, file)}`));
    line = line.replace(/<img\b[^>]*>/g, (tag) => {
      const url = tag.match(/src="([^"]+)"/)?.[1];
      if (!url || isExternal(url)) return tag;
      const withSrc = tag.replace(url, copyImage(url, from, part, file));
      return /\balt=/.test(withSrc) ? withSrc : withSrc.replace('<img', `<img alt="${basename(url).replace(/\.\w+$/, '').replace(/-/g, ' ')}"`);
    });
    line = line.replace(/\]\(([^)\s]+)/g, (all, url) => (isExternal(url) ? all : `](${rewriteLink(url, from)}`));
    out.push(line);
  }

  const hasFiles = ['notebook.ipynb', 'solution', 'working'].some((name) => existsSync(join(src, from, name)));
  const note = hasFiles ? `> [!NOTE]\n> The notebooks and data for this lesson are in the [source repository](${REPO}/tree/${commit}/${encodeURI(from)}).\n\n` : '';
  const frontmatter = ['---', `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(LESSONS.find((l) => l[0] === from)[3])}`, `difficulty: ${LESSONS.find((l) => l[0] === from)[2]}`, `source_path: ${JSON.stringify(`${from}/README.md`)}`, '---', '', ''].join('\n');
  return frontmatter + note + out.join('\n').replace(/\n{3,}/g, '\n\n').trimStart();
}

for (const lesson of LESSONS) {
  const [from, file] = lesson;
  const part = partFolder[from.split('/')[0]];
  const markdown = readFileSync(join(src, from, 'README.md'), 'utf8');
  const title = markdown.match(/^#\s+(.*)$/m)[1].replace(/\s+$/, '');
  mkdirSync(join(dest, part), { recursive: true });
  writeFileSync(join(dest, part, `${file}.md`), convert(markdown, from, part, file, title));
}

removeEmDashes(dest);

writeFileSync(
  resolve('src/data/ml-source.json'),
  JSON.stringify({ repo: REPO, commit, importedAt: new Date().toISOString().slice(0, 10), license: 'MIT' }, null, 2) + '\n',
);
cpSync(join(src, 'LICENSE'), resolve('LICENSE-ML-FOR-BEGINNERS.txt'));

console.log(`Imported ${LESSONS.length} lessons from ${relative(process.cwd(), src) || src} @ ${commit.slice(0, 7)}`);
