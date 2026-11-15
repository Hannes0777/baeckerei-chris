// Baut die Website aus den HTML-Seiten + den Inhalten in content/*.json.
// Die Inhalte werden über das CMS unter /admin gepflegt.
// Bereiche, die das CMS füllt, stehen in den HTML-Dateien zwischen
// <!--cms:NAME ...--> und <!--/cms-->. Ergebnis landet in _site/.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const OUT = path.join(ROOT, '_site');
const SKIP = new Set(['.git', '.github', 'content', '_site', 'node_modules', 'Bilder', 'Video', '_build.js', 'README.md', '.gitignore']);

const J = n => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', n + '.json'), 'utf8'));
const ST = J('start'), SO = J('sortiment'), OZ = J('oeffnungszeiten');

const esc = x => String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = x => String(x).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const anker = k => k.anker ? slug(k.anker) : slug(k.kurzname || k.titel);
const img = p => esc(String(p || '').replace(/^\//, ''));

/* ---------- Öffnungszeiten ---------- */
const ort = name => OZ[name] || { oeffnungszeiten: [], hinweis: '' };
const rows = z => z.map(r => `<tr><td>${esc(r.tage)}</td><td>${esc(r.zeit)}</td></tr>`).join('\n            ');

function zeiten(name, variante) {
  const o = ort(name), z = o.oeffnungszeiten || [], h = o.hinweis;
  if (variante === 'index') {
    return (z.length ? `<table class="hours-table">\n            ${rows(z)}\n          </table>` : '') +
      (h ? `${z.length ? '\n          ' : ''}<p class="note-inline">${esc(h)}</p>` : '');
  }
  if (variante === 'hell') {
    return (z.length ? `<table class="hours-table on-light" style="margin-top:28px; max-width:360px;">\n          ${rows(z)}\n        </table>` : '') +
      (h ? `${z.length ? '\n        ' : ''}<p class="note-inline on-light">${esc(h)}</p>` : '');
  }
  // dunkel
  return (z.length ? `<table class="hours-table" style="margin-top:28px; max-width:360px;">\n          ${rows(z)}\n        </table>` : '') +
    (h ? `${z.length ? '\n        ' : ''}<p class="note-inline"${z.length ? '' : ' style="margin-top:28px;"'}>${esc(h)}</p>` : '');
}

function kurz(name, variante) {
  const o = ort(name), z = o.oeffnungszeiten || [];
  const farbe = variante === 'dunkel' ? 'var(--text-on-dark-light)' : 'var(--text-light)';
  const zeile = z.length ? z.map(r => `${esc(r.tage)} ${esc(r.zeit)}`).join('<br>') : (name === 'cafe' ? 'Frühstück · Brunch · Mittagessen' : '');
  const hinweis = o.hinweis ? `<br><span style="font-size:0.8rem; color:${farbe};">${esc(o.hinweis)}</span>` : '';
  return `<div>${zeile}${hinweis}</div>`;
}

/* ---------- Startseite ---------- */
const hero = () => `<h1>${esc(ST.titel_oben)}<br><em>${esc(ST.titel_betont)}</em></h1>
        <p class="lede">${esc(ST.text)}</p>`;

function woche() {
  const w = ST.woche || {};
  if (!w.anzeigen) return '';
  return `<section style="padding:64px 0 0;">
    <div class="container">
      <div class="weekly-spotlight reveal">
        <div class="weekly-spotlight__bg"><img src="${img(w.bild || 'assets/images/stock/spezial.webp')}" alt="" width="900" height="600"></div>
        <div class="weekly-spotlight__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M12 6C10 6 8.5 4.5 8.5 2.5M12 6c2 0 3.5-1.5 3.5-3.5M12 11c-2 0-3.5-1.5-3.5-3.5M12 11c2 0 3.5-1.5 3.5-3.5M12 16c-2 0-3.5-1.5-3.5-3.5M12 16c2 0 3.5-1.5 3.5-3.5"/></svg>
        </div>
        <div class="weekly-spotlight__body">
          <span class="weekly-spotlight__pulse">${esc(w.etikett || 'Neu diese Woche')}</span>
          <h3>${esc(w.titel)}</h3>
          <p>${esc(w.text)}</p>
        </div>
        <a class="btn btn-primary" href="https://www.instagram.com/baeckerchris/" target="_blank" rel="noopener">Aktuelles auf Instagram</a>
      </div>
    </div>
  </section>`;
}

/* ---------- Sortiment ---------- */
const menuRow = p => `<div class="menu-row"><span class="menu-row__name">${esc(p.name)}${p.hinweis ? `<span class="menu-row__tag">${esc(p.hinweis)}</span>` : ''}</span><span class="menu-row__rule"></span><span class="menu-row__desc">${esc(p.beschreibung)}</span></div>`;

const cafeKopf = () => `<h2 class="grad-text--on-dark" style="font-size:clamp(1.9rem, 3.6vw, 2.7rem); margin-bottom:8px;">${esc(SO.cafe_titel)}</h2>
        <p style="color:var(--text-on-dark-light); max-width:60ch; margin-bottom:32px;">${esc(SO.cafe_text)}</p>`;

const cafeMenue = () => `<div class="menu-list">
          ${(SO.cafe_menue || []).map(menuRow).join('\n          ')}
        </div>` + (SO.cafe_zusatz ? `\n        <p class="note-marginal">${esc(SO.cafe_zusatz)}</p>` : '');

const katNav = () => (SO.kategorien || []).map(k => `        <a href="#${anker(k)}">${esc(k.kurzname || k.titel)}</a>`).join('\n');

const kategorien = () => (SO.kategorien || []).map((k, i) => {
  const dunkel = i % 2 === 1;
  return `<section id="${anker(k)}"${dunkel ? ' class="on-dark" style="background:var(--green-dark); color:var(--text-on-dark); padding:80px 0;"' : ' style="padding:80px 0;"'}>
    <div class="container">
      <div class="zigzag-row reveal" style="padding:0; border-top:none;">
        <div class="zigzag-text">
          <h2 class="${dunkel ? 'grad-text--on-dark' : 'grad-text'}">${esc(k.titel)}</h2>
          ${k.text ? `<p style="color:${dunkel ? 'var(--text-on-dark-light)' : 'var(--text-light)'}; max-width:60ch; margin-bottom:8px;">${esc(k.text)}</p>` : ''}
          <div class="menu-list">
            ${(k.produkte || []).map(menuRow).join('\n            ')}
          </div>${k.zusatz ? `\n          <p class="note-marginal">${esc(k.zusatz)}</p>` : ''}
        </div>
        <div class="zigzag-media ${i % 2 === 1 ? 'arch-media--mirror' : 'arch-media'}">${k.bild ? `<img src="${img(k.bild)}" loading="lazy" alt="${esc(k.bild_alt || k.titel)}" width="900" height="1350">` : ''}</div>
      </div>
    </div>
  </section>`;
}).join('\n\n  ');

/* ---------- Zusammensetzen ---------- */
const BLOECKE = {
  hero, woche,
  zeiten: (a, b) => zeiten(a, b),
  kurz: (a, b) => kurz(a, b),
  'cafe-kopf': cafeKopf, 'cafe-menue': cafeMenue,
  'kategorie-nav': katNav, kategorien,
};

function render(html, datei) {
  return html.replace(/<!--cms:([\w-]+)((?: [\w-]+)*)-->[\s\S]*?<!--\/cms-->/g, (_, name, args) => {
    const fn = BLOECKE[name];
    if (!fn) throw new Error(`${datei}: unbekannter CMS-Bereich "${name}"`);
    return fn(...args.trim().split(/\s+/).filter(Boolean));
  });
}

function kopieren(von, nach) {
  for (const e of fs.readdirSync(von, { withFileTypes: true })) {
    if (von === ROOT && SKIP.has(e.name)) continue;
    const a = path.join(von, e.name), b = path.join(nach, e.name);
    if (e.isDirectory()) { fs.mkdirSync(b, { recursive: true }); kopieren(a, b); }
    else if (e.name.endsWith('.html')) fs.writeFileSync(b, render(fs.readFileSync(a, 'utf8'), e.name));
    else fs.copyFileSync(a, b);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
kopieren(ROOT, OUT);
console.log('Fertig: _site/ gebaut.');
