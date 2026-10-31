// Renders Mermaid diagrams in the browser and colours them. Only the styling changes: the
// diagram sources, and so their structure, labels and solid vs dashed lines, stay as written.

interface Swatch { fill: string; stroke: string }

const PALETTE: Record<'light' | 'dark', Swatch[]> = {
  light: [
    { fill: '#d5f2ed', stroke: '#0d7a6f' },
    { fill: '#e0e6ff', stroke: '#3653c9' },
    { fill: '#fde2e4', stroke: '#c0364f' },
    { fill: '#ece4ff', stroke: '#7c3aed' },
    { fill: '#d9f0fb', stroke: '#0f7ab8' },
  ],
  dark: [
    { fill: '#123530', stroke: '#3cc6b5' },
    { fill: '#1c2550', stroke: '#8ea6ff' },
    { fill: '#3c1a24', stroke: '#f27a93' },
    { fill: '#2a1f4d', stroke: '#b794ff' },
    { fill: '#11303f', stroke: '#5cc0ee' },
  ],
};
// Decisions always use amber, so they stand out from the layer colours above.
const DECISION: Record<'light' | 'dark', Swatch> = {
  light: { fill: '#fdeccf', stroke: '#b45309' },
  dark: { fill: '#3a2a10', stroke: '#f2a541' },
};

const themeVariables = (mode: 'light' | 'dark') => {
  const dark = mode === 'dark';
  const [teal, indigo, rose, violet, sky] = PALETTE[mode];
  const text = dark ? '#e8e4da' : '#1c1e24';
  const line = dark ? '#a3a7b2' : '#5d6170';
  const surface = dark ? '#171a20' : '#fffdf8';
  return {
    darkMode: dark,
    background: surface,
    fontFamily: 'Inter Variable, system-ui, sans-serif',
    primaryColor: teal.fill,
    primaryBorderColor: teal.stroke,
    primaryTextColor: text,
    secondaryColor: indigo.fill,
    secondaryBorderColor: indigo.stroke,
    secondaryTextColor: text,
    tertiaryColor: violet.fill,
    tertiaryBorderColor: violet.stroke,
    tertiaryTextColor: text,
    textColor: text,
    lineColor: line,
    edgeLabelBackground: surface,
    clusterBkg: surface,
    clusterBorder: line,
    titleColor: text,
    noteBkgColor: DECISION[mode].fill,
    noteBorderColor: DECISION[mode].stroke,
    noteTextColor: text,
    actorBkg: teal.fill,
    actorBorder: teal.stroke,
    actorTextColor: text,
    actorLineColor: line,
    signalColor: text,
    signalTextColor: text,
    labelBoxBkgColor: sky.fill,
    labelBoxBorderColor: sky.stroke,
    labelTextColor: text,
    loopTextColor: text,
    activationBkgColor: violet.fill,
    activationBorderColor: violet.stroke,
    sectionBkgColor: teal.fill,
    altSectionBkgColor: surface,
    sectionBkgColor2: indigo.fill,
    taskBkgColor: indigo.stroke,
    taskBorderColor: indigo.stroke,
    taskTextColor: dark ? '#101216' : '#ffffff',
    taskTextOutsideColor: text,
    taskTextDarkColor: text,
    activeTaskBkgColor: teal.stroke,
    activeTaskBorderColor: teal.stroke,
    doneTaskBkgColor: violet.stroke,
    doneTaskBorderColor: violet.stroke,
    critBkgColor: rose.stroke,
    critBorderColor: rose.stroke,
    gridColor: line,
    todayLineColor: rose.stroke,
    pie1: teal.stroke,
    pie2: indigo.stroke,
    pie3: rose.stroke,
    pie4: violet.stroke,
    pie5: sky.stroke,
  };
};

const paint = (shape: SVGElement, { fill, stroke }: Swatch) => {
  shape.style.setProperty('fill', fill, 'important');
  shape.style.setProperty('stroke', stroke, 'important');
};

// Mermaid classes that say nothing about colour. Any other class is the author's own classDef.
const PLAIN_CLASSES = /^(node|default|flowchart-label|statediagram-state|statediagram-singular-state|label-container|clickable)$/;
const authorStyled = (node: Element) =>
  Array.from(node.classList).some((c) => !PLAIN_CLASSES.test(c)) ||
  Array.from(node.querySelectorAll('rect, polygon, circle, ellipse, path')).some((s) => /fill\s*:/.test(s.getAttribute('style') ?? ''));

// Boxes in the same layer of the diagram share a colour, which makes the layers easy to follow.
function colourNodes(svg: SVGSVGElement, source: string, mode: 'light' | 'dark') {
  const horizontal = /^\s*(?:flowchart|graph)\s+(?:LR|RL)\b/m.test(source) || /direction\s+(?:LR|RL)\b/.test(source);
  const nodes = Array.from(svg.querySelectorAll<SVGGElement>('g.node'))
    .filter((n) => !authorStyled(n))
    .map((node) => {
      const box = node.getBoundingClientRect();
      return { node, at: horizontal ? box.left + box.width / 2 : box.top + box.height / 2 };
    })
    .sort((a, b) => a.at - b.at);

  let layer = -1;
  let last = -Infinity;
  for (const { node, at } of nodes) {
    if (at - last > 24) layer++;
    last = at;
    const shapes = node.querySelectorAll<SVGElement>('rect, polygon, circle, ellipse, path');
    const swatch = node.querySelector('polygon') ? DECISION[mode] : PALETTE[mode][layer % PALETTE[mode].length];
    shapes.forEach((s) => paint(s, swatch));
  }

  svg.querySelectorAll<SVGElement>('.cluster rect').forEach((rect, i) => {
    const { stroke } = PALETTE[mode][(i + 1) % PALETTE[mode].length];
    rect.style.setProperty('stroke', stroke, 'important');
    rect.style.setProperty('fill', `color-mix(in srgb, ${stroke} 7%, transparent)`, 'important');
  });
}

// Each participant keeps one colour, at the top and bottom of its lifeline.
function colourActors(svg: SVGSVGElement, mode: 'light' | 'dark') {
  const order = new Map<string, number>();
  svg.querySelectorAll<SVGElement>('rect.actor, line.actor-line').forEach((el) => {
    const name = el.getAttribute('name') ?? '';
    if (!order.has(name)) order.set(name, order.size);
    const swatch = PALETTE[mode][order.get(name)! % PALETTE[mode].length];
    if (el.tagName.toLowerCase() === 'line') el.style.setProperty('stroke', swatch.stroke, 'important');
    else paint(el, swatch);
  });
}

function colour(host: HTMLElement, mode: 'light' | 'dark') {
  const svg = host.querySelector<SVGSVGElement>('svg');
  if (!svg) return;
  const kind = svg.getAttribute('aria-roledescription') ?? '';
  if (kind === 'sequence') colourActors(svg, mode);
  else if (/flowchart|state|class/.test(kind)) colourNodes(svg, host.dataset.source ?? '', mode);
}

export function initDiagrams() {
  const root = document.documentElement;
  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('pre.mermaid'));
  if (!diagrams.length) return;
  diagrams.forEach((d) => (d.dataset.source = d.textContent ?? ''));

  import('mermaid').then(async ({ default: mermaid }) => {
    const render = async () => {
      const mode = root.dataset.theme === 'dark' ? 'dark' : 'light';
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        themeVariables: themeVariables(mode),
        flowchart: { curve: 'basis', nodeSpacing: 48, rankSpacing: 56, padding: 14 },
        fontFamily: 'Inter Variable, system-ui, sans-serif',
      });
      diagrams.forEach((d) => {
        d.removeAttribute('data-processed');
        d.textContent = d.dataset.source ?? '';
      });
      try {
        await mermaid.run({ nodes: diagrams, suppressErrors: true });
      } catch (err) {
        console.warn('Mermaid render error', err);
      }
      diagrams.forEach((d) => colour(d, mode));
    };
    await render();
    window.addEventListener('lwr:theme', render);
  });
}
