// Renders Mermaid diagrams in the browser and themes them. Only the styling changes: the
// diagram sources, and so their structure, labels and solid vs dashed lines, stay as written.

interface Swatch { fill: string; stroke: string }

const NODE = '#34d399';
const NODE_BORDER = '#1f2937';
const NODE_TEXT = '#111827';
const NOTE = '#fdab4e';

const themeVariables = (mode: 'light' | 'dark') => {
  const dark = mode === 'dark';
  const text = dark ? '#e8e4da' : '#1f2937';
  const line = dark ? '#4ade80' : '#16a34a';
  const surface = dark ? '#171a20' : '#fffdf8';
  const cluster = dark ? '#1f232b' : '#eef2f7';
  const rail = dark ? '#2d2d2d' : '#cbd5e1';
  return {
    darkMode: dark,
    background: surface,
    fontFamily: 'Inter Variable, system-ui, sans-serif',
    fontSize: '13px',
    primaryColor: NODE,
    primaryBorderColor: NODE_BORDER,
    primaryTextColor: NODE_TEXT,
    secondaryColor: NODE,
    secondaryBorderColor: NODE_BORDER,
    secondaryTextColor: NODE_TEXT,
    tertiaryColor: surface,
    tertiaryBorderColor: surface,
    tertiaryTextColor: text,
    textColor: text,
    nodeTextColor: NODE_TEXT,
    lineColor: line,
    edgeLabelBackground: surface,
    clusterBkg: surface,
    clusterBorder: surface,
    titleColor: text,
    noteBkgColor: NOTE,
    noteBorderColor: NODE_BORDER,
    noteTextColor: NODE_TEXT,
    actorBkg: NODE,
    actorBorder: NODE_BORDER,
    actorTextColor: NODE_TEXT,
    actorLineColor: rail,
    signalColor: line,
    signalTextColor: text,
    labelBoxBkgColor: NODE,
    labelBoxBorderColor: NODE_BORDER,
    labelTextColor: NODE_TEXT,
    loopTextColor: text,
    sectionBkgColor: cluster,
    altSectionBkgColor: surface,
    sectionBkgColor2: cluster,
    taskBkgColor: NODE,
    taskBorderColor: NODE_BORDER,
    taskTextColor: NODE_TEXT,
    taskTextOutsideColor: text,
    taskTextDarkColor: NODE_TEXT,
    activeTaskBkgColor: NOTE,
    activeTaskBorderColor: NODE_BORDER,
    doneTaskBkgColor: line,
    doneTaskBorderColor: NODE_BORDER,
    critBkgColor: '#f27a93',
    critBorderColor: NODE_BORDER,
    gridColor: rail,
    todayLineColor: NOTE,
    xyChart: {
      backgroundColor: 'transparent',
      plotColorPalette: [NODE, NOTE].join(','),
      titleColor: text,
      xAxisLabelColor: text,
      xAxisTitleColor: text,
      xAxisLineColor: text,
      xAxisTickColor: text,
      yAxisLabelColor: text,
      yAxisTitleColor: text,
      yAxisLineColor: text,
      yAxisTickColor: text,
    },
    quadrant1Fill: cluster,
    quadrant2Fill: cluster,
    quadrant3Fill: cluster,
    quadrant4Fill: cluster,
    quadrant1TextFill: text,
    quadrant2TextFill: text,
    quadrant3TextFill: text,
    quadrant4TextFill: text,
    quadrantPointFill: NODE,
    quadrantPointTextFill: text,
    quadrantTitleFill: text,
    quadrantXAxisTextFill: text,
    quadrantYAxisTextFill: text,
    quadrantInternalBorderStrokeFill: rail,
    quadrantExternalBorderStrokeFill: rail,
  };
};

// ER diagrams colour edge labels like node text, which disappears on the dark panel, and hard-code
// white into their optional markers. Class diagrams colour box text like page text, which is too pale
// on the green boxes. This CSS stays inside the SVG, so the zoom dialog gets it too.
const CLASS_TEXT = ['.label-group', '.members-group', '.methods-group'].flatMap((g) => [`${g} p`, `${g} span`, `${g} text`]).join(', ');
const themeCSS = (mode: 'light' | 'dark') => {
  const { textColor, background } = themeVariables(mode);
  return `.edgeLabel p, .edgeLabel span { color: ${textColor}; }
    marker[id*="_er-"] circle { fill: ${background} !important; }
    ${CLASS_TEXT} { color: ${NODE_TEXT}; fill: ${NODE_TEXT}; }`;
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

const hueOf = (css: string) => {
  const m = css.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/);
  if (!m || m[4] === '0') return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((n) => Number(n) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta < 0.02) return { hue: 0, grey: true };
  const hue = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { hue: hue * 60, grey: false };
};

// An author's colour can carry meaning ("the front (orange)"), so it keeps its hue. Its shade
// is redrawn to suit the theme, because a pale fill written for white pages glares on dark ones.
function themedColour(css: string, mode: 'light' | 'dark'): Swatch | null {
  const colour = hueOf(css);
  if (!colour) return null;
  const sat = colour.grey ? 0 : 1;
  return mode === 'dark'
    ? { fill: `hsl(${colour.hue} ${48 * sat}% 21%)`, stroke: `hsl(${colour.hue} ${72 * sat}% 66%)` }
    : { fill: `hsl(${colour.hue} ${78 * sat}% 91%)`, stroke: `hsl(${colour.hue} ${72 * sat}% 34%)` };
}

function restyleAuthorNode(node: SVGGElement, mode: 'light' | 'dark') {
  node.querySelectorAll<SVGElement>('rect, polygon, circle, ellipse, path').forEach((shape) => {
    const swatch = themedColour(getComputedStyle(shape).fill, mode);
    if (swatch) paint(shape, swatch);
  });
  const text = mode === 'dark' ? '#e8e4da' : '#1c1e24';
  node.querySelectorAll<HTMLElement>('.nodeLabel, .nodeLabel *, span, p').forEach((label) => label.style.setProperty('color', text, 'important'));
  node.querySelectorAll<SVGElement>('text, tspan').forEach((label) => label.style.setProperty('fill', text, 'important'));
}

function colour(host: HTMLElement, mode: 'light' | 'dark') {
  const svg = host.querySelector<SVGSVGElement>('svg');
  if (!svg) return;
  // Small diagrams stay readable on phones: the panel scrolls rather than shrinking them further.
  const natural = svg.viewBox.baseVal.width;
  if (natural) svg.style.setProperty('--floor', `${Math.round(natural * 0.6)}px`);
  const kind = svg.getAttribute('aria-roledescription') ?? '';
  if (kind === 'sequence') {
    // "rect rgb(...)" bands behind messages.
    svg.querySelectorAll<SVGElement>('rect.rect').forEach((band) => {
      const swatch = themedColour(getComputedStyle(band).fill, mode);
      if (swatch) band.style.setProperty('fill', swatch.fill, 'important');
    });
  } else if (/flowchart|state|class/.test(kind)) {
    svg.querySelectorAll<SVGGElement>('g.node').forEach((n) => {
      if (authorStyled(n)) restyleAuthorNode(n, mode);
    });
  }
}

const icon = (paths: string, size = 17) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const LENS = '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8.5 11h5';

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

// A dialog that shows one diagram large, with zoom buttons and drag to pan.
function createViewer() {
  const dialog = document.createElement('dialog');
  dialog.className = 'diagram-viewer';
  dialog.setAttribute('aria-label', 'Diagram');
  dialog.innerHTML = `
    <div class="diagram-viewer__bar">
      <div class="diagram-viewer__zoom" role="group" aria-label="Zoom">
        <button type="button" data-zoom="out" aria-label="Zoom out" title="Zoom out (-)">${icon(`${LENS}"/>`)}</button>
        <output class="diagram-viewer__level" aria-live="polite">100%</output>
        <button type="button" data-zoom="in" aria-label="Zoom in" title="Zoom in (+)">${icon(`${LENS}M11 8.5v5"/>`)}</button>
        <span class="diagram-viewer__divider"></span>
        <button type="button" data-zoom="reset" aria-label="Reset zoom" title="Reset zoom (0)">${icon('<path d="M5 12a7 7 0 1 0 2.2-5.1L5 9M5 5v4h4"/>')}</button>
      </div>
      <button type="button" class="diagram-viewer__close" aria-label="Close diagram" title="Close (Esc)">${icon('<path d="M6 6l12 12M18 6L6 18"/>', 18)}</button>
    </div>
    <div class="diagram-viewer__body"><div class="diagram-viewer__canvas"></div></div>`;
  document.body.append(dialog);

  const body = dialog.querySelector<HTMLElement>('.diagram-viewer__body')!;
  const canvas = dialog.querySelector<HTMLElement>('.diagram-viewer__canvas')!;
  const level = dialog.querySelector('output')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('[data-zoom="out"]')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('[data-zoom="in"]')!;
  let zoom = 1;
  let drag: { x: number; y: number; left: number; top: number } | null = null;

  const setZoom = (next: number) => {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    canvas.style.width = canvas.style.height = `${zoom * 100}%`;
    level.textContent = `${Math.round(zoom * 100)}%`;
    body.classList.toggle('is-pannable', zoom > 1);
    zoomOut.disabled = zoom === ZOOM_MIN;
    zoomIn.disabled = zoom === ZOOM_MAX;
  };

  zoomOut.addEventListener('click', () => setZoom(zoom - ZOOM_STEP));
  zoomIn.addEventListener('click', () => setZoom(zoom + ZOOM_STEP));
  dialog.querySelector('[data-zoom="reset"]')!.addEventListener('click', () => setZoom(1));
  dialog.querySelector('.diagram-viewer__close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => canvas.replaceChildren());
  dialog.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') setZoom(zoom + ZOOM_STEP);
    else if (e.key === '-') setZoom(zoom - ZOOM_STEP);
    else if (e.key === '0') setZoom(1);
  });
  body.addEventListener('pointerdown', (e) => {
    if (zoom <= 1) return;
    drag = { x: e.clientX, y: e.clientY, left: body.scrollLeft, top: body.scrollTop };
    body.setPointerCapture(e.pointerId);
  });
  body.addEventListener('pointermove', (e) => {
    if (!drag) return;
    body.scrollLeft = drag.left - (e.clientX - drag.x);
    body.scrollTop = drag.top - (e.clientY - drag.y);
  });
  const endDrag = () => (drag = null);
  body.addEventListener('pointerup', endDrag);
  body.addEventListener('pointercancel', endDrag);

  return (svg: SVGSVGElement) => {
    canvas.replaceChildren(svg.cloneNode(true));
    setZoom(1);
    dialog.showModal();
  };
}

function addExpandButtons(diagrams: HTMLElement[]) {
  const open = createViewer();
  diagrams.forEach((d) => {
    const panel = d.closest('.viz');
    if (!panel) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'viz-expand';
    button.setAttribute('aria-label', 'Expand diagram');
    button.title = 'Expand diagram';
    button.innerHTML = icon('<path d="M14.5 5.5h4v4M18.5 5.5l-5 5M9.5 18.5h-4v-4M5.5 18.5l5-5"/>', 15);
    button.addEventListener('click', () => {
      const svg = d.querySelector<SVGSVGElement>('svg');
      if (svg) open(svg);
    });
    panel.append(button);
  });
}

// The scroll hint only shows on panels that actually overflow.
function watchOverflow(diagrams: HTMLElement[]) {
  const update = () =>
    diagrams.forEach((d) => {
      const panel = d.closest('.viz');
      panel?.classList.toggle('is-scrollable', panel.scrollWidth > panel.clientWidth + 1);
    });
  update();
  window.addEventListener('resize', update);
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
        // Mermaid 12 defaults to ELK and can add shadows; dagre and classic give curved edges and flat nodes.
        layout: 'dagre',
        look: 'classic',
        themeVariables: themeVariables(mode),
        themeCSS: themeCSS(mode),
        flowchart: { curve: 'basis', wrappingWidth: 200, minNodeWidth: 0 },
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
    addExpandButtons(diagrams);
    watchOverflow(diagrams);
    window.addEventListener('lwr:theme', render);
  });
}
