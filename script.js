// Brush ensō around the photo, AKL/TYO clock, light/dark, EN/JA blur switch, fade-ins.

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// ---------- Ensō ----------
// Same brush drawing as Shoji's renderer/enso.js: a ring swept by a "brush" whose
// width follows a pressure curve, with a slight wobble so it never looks machine-made.
const START = -104, SWEEP = 338;
const pt = (r, deg, cx, cy) => { const a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const xy = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;

function brushRing({ cx = 50, cy = 50, r, width, seed = 1, steps = 90 }) {
  const outer = [], inner = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pressure = t < 0.08 ? 0.55 + 0.45 * (t / 0.08) : 1 - 0.68 * ((t - 0.08) / 0.92) ** 1.35;
    const wobble = 1 + 0.07 * Math.sin(t * 13 + seed) + 0.04 * Math.sin(t * 31 + seed * 2.3);
    const half = (width * pressure * wobble) / 2;
    const rr = r * (1 + 0.014 * Math.sin(t * 6 + seed * 1.7));
    const deg = START + SWEEP * t;
    outer.push(pt(rr + half, deg, cx, cy));
    inner.push(pt(rr - half, deg, cx, cy));
  }
  const capEnd = width * 0.21, capStart = width * 0.3;
  return `M ${xy(outer[0])} ${outer.slice(1).map((p) => `L ${xy(p)}`).join(' ')}`
    + ` A ${capEnd.toFixed(2)} ${capEnd.toFixed(2)} 0 0 1 ${xy(inner.at(-1))}`
    + ` ${inner.slice(0, -1).reverse().map((p) => `L ${xy(p)}`).join(' ')}`
    + ` A ${capStart.toFixed(2)} ${capStart.toFixed(2)} 0 0 1 ${xy(outer[0])} Z`;
}

// Soft wet stroke with a faint bleed, for sitting on the photo edge
document.querySelectorAll('[data-enso]').forEach((el, i) => {
  const id = `ink${i}`;
  el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="b"/>
      <feComponentTransfer in="b" result="bleed"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
      <feMerge><feMergeNode in="bleed"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <path d="${brushRing({ r: 40, width: Number(el.dataset.enso) || 9, seed: i + 2 })}" fill="currentColor" filter="url(#${id})"/>
  </svg>`;
});

// ---------- Clock ----------
const fmt = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const zones = { akl: fmt('Pacific/Auckland'), tyo: fmt('Asia/Tokyo') };
function tick() {
  const now = new Date();
  document.querySelectorAll('[data-clock]').forEach((el) => {
    const t = zones[el.dataset.clock].format(now);
    el.setAttribute('aria-label', t);
    el.innerHTML = [...t].map((c) => `<span class="${c === ':' ? 'sep' : 'dg'}" aria-hidden="true">${c}</span>`).join('');
  });
}
tick();
setInterval(tick, 15000);

// ---------- Light / dark ----------
// Follows the system setting until the visitor picks one.
const themeBtn = document.querySelector('[data-theme-toggle]');
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  const next = t === 'dark' ? 'light' : 'dark';
  themeBtn.textContent = next;
  themeBtn.setAttribute('aria-label', `Switch to ${next} theme`);
}
setTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
themeBtn.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

// ---------- EN / JA, blur-dissolve ----------
// Text blurs out, swaps at the peak (~200ms), then sharpens back in.
let lang = 'en';
const langBtn = document.querySelector('[data-lang-toggle]');
function swap(el, apply) {
  if (reduce.matches) return apply(el);
  el.classList.add('blur-out');
  setTimeout(() => { apply(el); void el.offsetHeight; el.classList.remove('blur-out'); }, 200);
}
langBtn.addEventListener('click', () => {
  lang = lang === 'en' ? 'ja' : 'en';
  document.querySelectorAll('[data-en]').forEach((el) => swap(el, (n) => { n.textContent = n.dataset[lang]; }));
  document.querySelectorAll('[data-en-html]').forEach((el) => swap(el, (n) => { n.innerHTML = n.getAttribute(`data-${lang}-html`); }));
  document.documentElement.lang = lang;
  langBtn.setAttribute('aria-label', lang === 'ja' ? 'Switch page to English' : 'Switch page to Japanese');
});

// ---------- Copy email ----------
// mailto opens nothing for people on webmail, so offer the address on the clipboard too.
// The status line is a role="status" region, so screen readers announce the result.
const copyBtn = document.querySelector('[data-copy]');
const copied = document.querySelector('[data-copied]');
let copiedTimer;
copyBtn.addEventListener('click', async () => {
  let ok = true;
  try { await navigator.clipboard.writeText(copyBtn.dataset.copy); } catch { ok = false; }
  copied.textContent = ok
    ? (lang === 'ja' ? 'コピーしました' : 'copied')
    : (lang === 'ja' ? 'コピーできませんでした' : "couldn't copy, sorry");
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => { copied.textContent = ''; }, 2500);
});

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// ---------- Fade-ins ----------
// Sections fade in once as they scroll into view (skipped for reduced motion)
if (!reduce.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('fx');
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
