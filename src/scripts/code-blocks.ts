// Adds a title bar with a language label and copy button to code blocks, and makes the
// language tabs on solutions work. The chosen language is remembered across lessons.

const LABELS: Record<string, string> = {
  python: 'Python', java: 'Java', cpp: 'C++', go: 'Go', bash: 'Bash', sql: 'SQL', http: 'HTTP', yaml: 'YAML',
  json: 'JSON', nginx: 'nginx', lua: 'Lua', cypher: 'Cypher', typescript: 'TypeScript', js: 'JavaScript',
  protobuf: 'Protobuf', text: 'Text', plaintext: 'Text',
};
const LANG_KEY = 'lwr:lang';

const copyButton = (getCode: () => string) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = 'Copy';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => (button.textContent = 'Copy'), 1600);
  });
  return button;
};

function addTitleBars() {
  document.querySelectorAll<HTMLElement>('.prose pre.astro-code').forEach((pre) => {
    if (pre.closest('.code-tabs')) return;
    const lang = pre.dataset.language ?? 'text';
    const block = document.createElement('div');
    block.className = 'code-block';
    const bar = document.createElement('div');
    bar.className = 'code-bar';
    const label = document.createElement('span');
    label.className = 'code-lang';
    label.textContent = LABELS[lang] ?? lang;
    bar.append(label, copyButton(() => pre.textContent ?? ''));
    pre.replaceWith(block);
    block.append(bar, pre);
  });
}

function initTabs() {
  const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-code-tabs]'));
  if (!groups.length) return;

  const select = (group: HTMLElement, lang: string) => {
    const tabs = group.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!Array.from(tabs).some((t) => t.dataset.lang === lang)) return;
    tabs.forEach((tab) => {
      const on = tab.dataset.lang === lang;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    group.querySelectorAll<HTMLElement>('.code-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.lang === lang);
    });
  };

  const selectEverywhere = (lang: string, anchor?: HTMLElement) => {
    // Other blocks above the clicked one can change height, so keep it steady on screen.
    const top = anchor?.getBoundingClientRect().top;
    groups.forEach((g) => select(g, lang));
    if (anchor && top !== undefined) scrollBy({ top: anchor.getBoundingClientRect().top - top, behavior: 'instant' });
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
  };

  groups.forEach((group) => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectEverywhere(tab.dataset.lang!, group));
      tab.addEventListener('keydown', (e) => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        selectEverywhere(next.dataset.lang!, group);
        next.focus();
      });
    });
    group.querySelector('.code-tabs-bar')?.append(
      copyButton(() => group.querySelector('.code-panel.active pre')?.textContent ?? ''),
    );
  });

  let saved: string | null = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch {}
  if (saved) groups.forEach((g) => select(g, saved!));
}

export function initCodeBlocks() {
  addTitleBars();
  initTabs();
}
