// Site-level course configuration. Titles, summaries and stage groupings here
// are written for Engineering Path; lesson content comes from the imported handbooks.

export type HandbookId = 'hld' | 'dsa' | 'ai-eng' | 'ml';

export interface Stage {
  name: string;
  blurb: string;
  parts: string[]; // folder names
}

// Set on courses that don't come from The Engineering Handbook.
export interface CourseSource {
  name: string;
  authors: string;
  repo: string;
  license: string;
  licenseUrl: string;
}

export interface HandbookConfig {
  id: HandbookId;
  title: string;
  short: string;
  tagline: string;
  intro: string;
  accent: string; // CSS custom property name suffix
  icon: string;
  stages: Stage[];
  partSummaries: Record<string, string>;
  partTitles?: Record<string, string>;
  hidden?: string[]; // folders not shown as parts
  source?: CourseSource;
}

export const HANDBOOKS: HandbookConfig[] = [
  {
    id: 'hld',
    title: 'System Design',
    short: 'System Design',
    tagline: 'From one server to planet-scale systems.',
    intro:
      'A complete path through high-level design: the networking and database basics everything rests on, the building blocks you combine, the distributed-systems theory behind them, and 56 worked case studies that put it all together.',
    accent: 'hld',
    icon: 'M4 6h16M4 12h16M4 18h10',
    stages: [
      { name: 'Foundations', blurb: 'Vocabulary and the basics every later lesson assumes.', parts: ['part-0-prerequisites', 'part-1-core-fundamentals'] },
      { name: 'Building blocks', blurb: 'The components you assemble into real systems.', parts: ['part-2-building-blocks'] },
      { name: 'Theory and data', blurb: 'Why distributed systems behave the way they do, and where data lives.', parts: ['part-3-distributed-systems-theory', 'part-4-data-systems'] },
      { name: 'Architecture and operations', blurb: 'Shaping systems, then keeping them reliable and secure.', parts: ['part-5-architecture-patterns', 'part-6-reliability-and-operations', 'part-7-security-at-scale'] },
      { name: 'Applied design', blurb: 'End-to-end designs, AI systems, and interview practice.', parts: ['part-8-case-studies', 'part-9-ai-ml-system-design', 'part-10-emerging-patterns', 'part-11-interview-framework', 'trade-offs'] },
    ],
    partSummaries: {
      'part-0-prerequisites': 'Networking, operating systems, data structures, databases and APIs, in just enough depth.',
      'part-1-core-fundamentals': 'Scalability, latency, availability, consistency and quick estimation.',
      'part-2-building-blocks': 'Load balancers, caches, queues, CDNs, databases, sharding and more.',
      'part-3-distributed-systems-theory': 'Consensus, quorums, clocks, CRDTs and distributed transactions.',
      'part-4-data-systems': 'Storage engines, analytics, streaming, search and specialized databases.',
      'part-5-architecture-patterns': 'Monoliths, microservices, events, CQRS, multi-region and multi-tenant designs.',
      'part-6-reliability-and-operations': 'Observability, SLOs, resilience, deployments, incidents and cost.',
      'part-7-security-at-scale': 'Identity, tokens, service auth, secrets, compliance and supply chain.',
      'part-8-case-studies': '56 complete designs, from URL shorteners to AI search engines.',
      'part-9-ai-ml-system-design': 'Serving models, retrieval, vector search, agents and ML infrastructure.',
      'part-10-emerging-patterns': 'Forward-looking topics such as sustainable computing.',
      'part-11-interview-framework': 'How to run a system design interview from start to finish.',
      'trade-offs': 'Side-by-side decision guides for the most common "X vs Y" choices.',
    },
    partTitles: { 'trade-offs': 'Trade-offs Library', 'part-9-ai-ml-system-design': 'AI & ML System Design' },
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    short: 'DSA',
    tagline: 'Patterns first, then the problems they unlock.',
    intro:
      'A practice-driven route through data structures and algorithms. Each lesson teaches a structure or pattern, then works through classic problems with solutions in Python, Java, C++ and Go.',
    accent: 'dsa',
    icon: 'M6 4v16M12 8v12M18 12v8',
    stages: [
      { name: 'Foundations', blurb: 'Complexity, recursion and the core linear structures.', parts: ['part-0-foundations', 'part-1-linear-data-structures', 'part-2-search-sort'] },
      { name: 'Core patterns', blurb: 'The techniques that turn slow solutions into fast ones.', parts: ['part-3-pointers-window-prefix', 'part-4-stack-queue-patterns', 'part-5-linked-lists'] },
      { name: 'Trees, graphs and search', blurb: 'Hierarchies, networks and exhaustive search.', parts: ['part-6-trees-heaps', 'part-7-recursion-backtracking', 'part-8-graphs'] },
      { name: 'Advanced techniques', blurb: 'Optimization strategies and specialist toolkits.', parts: ['part-9-dynamic-programming', 'part-10-greedy', 'part-11-bit-manipulation', 'part-12-strings-pattern-matching', 'part-13-design-the-data-structure'] },
      { name: 'Interview ready', blurb: 'Putting it together under time pressure, plus pattern guides and deep dives.', parts: ['part-14-interview-framework', 'patterns', 'editorials'] },
    ],
    partSummaries: {
      'part-0-foundations': 'Big-O, recursion, bits, interview math and language idioms.',
      'part-1-linear-data-structures': 'Arrays, strings, hash maps, stacks, queues and matrices.',
      'part-2-search-sort': 'Binary search and its variants, sorting algorithms and selection.',
      'part-3-pointers-window-prefix': 'Two pointers, sliding windows and prefix sums.',
      'part-4-stack-queue-patterns': 'Monotonic stacks and deques, parsing and amortized tricks.',
      'part-5-linked-lists': 'Pointer manipulation, fast/slow pointers and in-place reversal.',
      'part-6-trees-heaps': 'Traversals, BSTs, heaps, tries and segment trees.',
      'part-7-recursion-backtracking': 'Subsets, permutations, combinations and pruning.',
      'part-8-graphs': 'BFS, DFS, shortest paths, topological sort and union-find.',
      'part-9-dynamic-programming': 'From memoization to interval, tree and bitmask DP.',
      'part-10-greedy': 'When the locally best choice is globally best.',
      'part-11-bit-manipulation': 'Bit tricks, masks and XOR patterns.',
      'part-12-strings-pattern-matching': 'KMP, Rabin-Karp, tries and suffix structures.',
      'part-13-design-the-data-structure': 'LRU caches, iterators and custom structures.',
      'part-14-interview-framework': 'How to approach, communicate and test in a coding round.',
      patterns: 'Decision guides comparing approaches that solve similar problems.',
      editorials: 'Long-form walkthroughs of classic problems with several approaches.',
    },
    partTitles: {
      patterns: 'Pattern Decision Guides',
      editorials: 'Editorials',
      'part-2-search-sort': 'Search & Sort',
      'part-3-pointers-window-prefix': 'Two Pointers, Sliding Window & Prefix Sums',
      'part-4-stack-queue-patterns': 'Stack & Queue Patterns',
      'part-6-trees-heaps': 'Trees & Heaps',
      'part-7-recursion-backtracking': 'Recursion & Backtracking',
      'part-12-strings-pattern-matching': 'Strings & Pattern Matching',
      'part-13-design-the-data-structure': 'Design the Data Structure',
    },
    hidden: ['widgets'],
  },
  {
    id: 'ai-eng',
    title: 'AI Engineering',
    short: 'AI Engineering',
    tagline: 'Building real products on top of foundation models.',
    intro:
      'How to build and run production AI features as a software engineer: how models behave, calling them reliably, prompts and context, retrieval, agents, evaluation, security, and keeping costs under control.',
    accent: 'ai',
    icon: 'M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z',
    stages: [
      { name: 'Mental model', blurb: 'What an AI engineer does and how models really behave.', parts: ['part-0-start-here', 'part-1-how-models-behave'] },
      { name: 'Talking to models', blurb: 'APIs, prompts, and measuring whether they work.', parts: ['part-2-working-with-model-apis', 'part-3-prompt-engineering', 'part-4-eval-fundamentals'] },
      { name: 'Building the system', blurb: 'Context, retrieval and agents.', parts: ['part-5-context-engineering', 'part-6-retrieval-augmented-generation', 'part-7-agent-engineering'] },
      { name: 'Running it in production', blurb: 'Observability, security, cost and product thinking.', parts: ['part-8-evaluation-and-observability', 'part-9-security-and-governance', 'part-10-deployment-and-cost', 'part-11-ai-product'] },
    ],
    partSummaries: {
      'part-0-start-here': 'The role, the escalation ladder, and how to read this course.',
      'part-1-how-models-behave': 'Tokens, sampling, context windows and failure modes.',
      'part-2-working-with-model-apis': 'Calling model APIs reliably: retries, streaming, structured output.',
      'part-3-prompt-engineering': 'Writing prompts that hold up in production.',
      'part-4-eval-fundamentals': 'Building eval sets before building anything else.',
      'part-5-context-engineering': 'Deciding what the model sees, and in what order.',
      'part-6-retrieval-augmented-generation': 'Chunking, embeddings, retrieval and reranking.',
      'part-7-agent-engineering': 'Tools, loops, memory and multi-step agents.',
      'part-8-evaluation-and-observability': 'Deeper evals, tracing and monitoring in production.',
      'part-9-security-and-governance': 'Prompt injection, data protection and guardrails.',
      'part-10-deployment-and-cost': 'Hosting choices, customization and cost control.',
      'part-11-ai-product': 'UX, instrumentation and growth for AI features.',
    },
    partTitles: { 'part-2-working-with-model-apis': 'Working with Model APIs', 'part-6-retrieval-augmented-generation': 'Retrieval-Augmented Generation' },
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    short: 'Machine Learning',
    tagline: 'From your first model to real-world ML.',
    intro:
      'A beginner-friendly route through classic machine learning with Python and Scikit-learn. Each part builds a working project using real data, covering regression, classification, clustering, language, time series and reinforcement learning.',
    accent: 'ml',
    icon: 'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6.5 15.5 10.5 13M13.5 11 17.5 8.5',
    stages: [
      { name: 'Foundations', blurb: 'What machine learning is, then your first models and how to serve them.', parts: ['part-1-introduction', 'part-2-regression', 'part-3-web-app'] },
      { name: 'Core techniques', blurb: 'Sorting data into known categories, and finding groups you did not know about.', parts: ['part-4-classification', 'part-5-clustering'] },
      { name: 'Specialized topics', blurb: 'Working with language, data over time, and agents that learn from rewards.', parts: ['part-6-nlp', 'part-7-time-series', 'part-8-reinforcement-learning'] },
      { name: 'In practice', blurb: 'How machine learning is used and debugged outside the classroom.', parts: ['part-9-real-world'] },
    ],
    partSummaries: {
      'part-1-introduction': 'Core concepts, the history of the field, responsible AI and the ML workflow.',
      'part-2-regression': 'Prepare data, then build linear, polynomial and logistic regression models.',
      'part-3-web-app': 'Save a trained model and serve its predictions from a small web app.',
      'part-4-classification': 'Clean a cuisines dataset, compare classifiers and build a recommender.',
      'part-5-clustering': 'Explore music data and group it with K-Means.',
      'part-6-nlp': 'Language tasks, translation and sentiment analysis, ending with hotel reviews.',
      'part-7-time-series': 'Forecast electricity usage with ARIMA and support vector regression.',
      'part-8-reinforcement-learning': 'Teach agents with Q-learning, then balance a pole in Gym.',
      'part-9-real-world': 'Real-world applications of ML, and how to debug models responsibly.',
    },
    partTitles: { 'part-6-nlp': 'Natural Language Processing', 'part-9-real-world': 'Machine Learning in the Real World' },
    source: {
      name: 'ML For Beginners',
      authors: 'Microsoft and contributors',
      repo: 'https://github.com/microsoft/ML-For-Beginners',
      license: 'MIT License',
      licenseUrl: 'https://github.com/microsoft/ML-For-Beginners/blob/main/LICENSE',
    },
  },
];

export const getHandbook = (id: string) => HANDBOOKS.find((h) => h.id === id)!;

const ACRONYMS: Record<string, string> = {
  ai: 'AI', ml: 'ML', hld: 'HLD', dsa: 'DSA', api: 'API', apis: 'APIs', os: 'OS', and: '&',
};

export function prettyFolder(folder: string, hb?: HandbookConfig): string {
  if (hb?.partTitles?.[folder]) return hb.partTitles[folder];
  return folder
    .replace(/^part-\d+-/, '')
    .split('-')
    .map((w, i) => ACRONYMS[w] ?? (i > 0 && ['of', 'the', 'to', 'for', 'at', 'in', 'vs'].includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

export const partNumber = (folder: string): number | null => {
  const m = folder.match(/^part-(\d+)-/);
  return m ? Number(m[1]) : null;
};
