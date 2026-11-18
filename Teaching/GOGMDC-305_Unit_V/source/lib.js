// Shared helpers for the two Unit V lecture decks
const pptxgen = require('pptxgenjs');
const SKILL = '/root/.claude/skills/synced/6fa76c2c-77b3-4f43-8365-b1b200434ad2_afc6c8bc-122b-44dd-a9e5-c9448de209bc/pptx';
const { applyTheme } = require(SKILL + '/scripts/apply_theme.js');

const THEME = {
  name: 'Unit V Environment',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1F2A1F', lt1: 'FFFFFF', dk2: '1F4D2B', lt2: 'EEF4E8',
    accent1: '2C6E3F', accent2: '9BC45F', accent3: '1C6E8C', accent4: 'D9822B',
    accent5: '5E7F64', accent6: 'B85042', hlink: '1C6E8C', folHlink: '5E7F64',
  },
};
const BORDER = 'C9D8BE';
const W = 13.333;
const X0 = 0.6, CW = 12.13, Y0 = 1.4;

function makeDeck(footer) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  pres.defineSlideMaster({
    title: 'TITLE', background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 1.7, w: 11.7, h: 2.0, fontSize: 44, bold: true, color: C.background1, valign: 'bottom', align: 'left' }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.95, w: 11.7, h: 1.8, fontSize: 20, color: C.accent2, valign: 'top' }, text: '' } },
    ],
  });
  pres.defineSlideMaster({
    title: 'SECTION', background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.3, w: 11.7, h: 1.4, fontSize: 40, bold: true, color: C.background1, valign: 'bottom', align: 'left' }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.85, w: 11.7, h: 1.2, fontSize: 20, color: C.accent2, valign: 'top' }, text: '' } },
    ],
  });
  pres.defineSlideMaster({
    title: 'CONTENT', background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: X0, y: 0.3, w: CW, h: 0.9, fontSize: 34, bold: true, color: C.text2, valign: 'middle' }, text: '' } },
      { text: { text: footer, options: { x: X0, y: 7.0, w: 9, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.53, h: 0.3, fontSize: 10, color: C.accent5, align: 'right' },
  });
  return { pres, C };
}

function helpers(pres, C) {
  const S = pres.shapes;
  let section = '';
  const H = {
    section(title, sub, notes) {
      section = title;
      pres.addSection({ title });
      const s = pres.addSlide({ masterName: 'SECTION', sectionTitle: section });
      s.addText(title, { placeholder: 'title' });
      if (sub) s.addText(sub, { placeholder: 'body' });
      if (notes) s.addNotes(notes);
      return s;
    },
    title(title, sub, notes) {
      section = 'Introduction';
      pres.addSection({ title: section });
      const s = pres.addSlide({ masterName: 'TITLE', sectionTitle: section });
      s.addText(title, { placeholder: 'title' });
      s.addText(sub, { placeholder: 'body' });
      if (notes) s.addNotes(notes);
      return s;
    },
    slide(title, notes) {
      const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
      s.addText(title, { placeholder: 'title' });
      if (notes) s.addNotes(notes);
      return s;
    },
    // Definition box: rounded tinted card
    def(s, term, text, o) {
      const { x = X0, y = Y0, w = CW, h = 1.2, fs = 17 } = o || {};
      s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.background2 }, line: { color: C.accent2, width: 1 }, rectRadius: 0.12 });
      s.addText([
        { text: 'Definition: ', options: { bold: true, color: C.accent3 } },
        { text: term + ' ', options: { bold: true, color: C.text2 } },
        { text, options: { color: C.text1 } },
      ], { x: x + 0.25, y: y + 0.08, w: w - 0.5, h: h - 0.16, fontSize: fs, valign: 'middle', isTextBox: true, margin: 0 });
    },
    // Bullets: item = string | [boldLead, rest]
    bullets(s, items, o) {
      const { x = X0, y = Y0, w = CW, h = 4, fs = 16, valign = 'top' } = o;
      const runs = [];
      items.forEach((it, i) => {
        const last = i === items.length - 1;
        const base = { bullet: { indent: 18 }, paraSpaceAfter: 6 };
        if (Array.isArray(it)) {
          runs.push({ text: it[0] + ' ', options: { ...base, bold: true, color: C.text2 } });
          runs.push({ text: it[1], options: { color: C.text1, breakLine: !last } });
        } else {
          runs.push({ text: it, options: { ...base, color: C.text1, breakLine: !last } });
        }
      });
      s.addText(runs, { x, y, w, h, fontSize: fs, valign, isTextBox: true, margin: 0 });
    },
    table(s, rows, o) {
      const { x = X0, y = Y0, w = CW, colW, fs = 15 } = o;
      const data = rows.map((r, ri) => r.map((c, ci) => ({
        text: c,
        options: ri === 0
          ? { bold: true, color: C.background1, fill: { color: C.text2 } }
          : { color: C.text1, bold: ci === 0, fill: { color: ri % 2 ? C.background1 : C.background2 } },
      })));
      s.addTable(data, { x, y, w, colW, fontSize: fs, border: { type: 'solid', pt: 0.75, color: BORDER }, valign: 'middle', margin: [0.1, 0.12, 0.1, 0.12] });
    },
    // horizontal process flow
    flow(s, steps, o) {
      const { x = X0, y = Y0, w = CW, h = 1.1, fs = 15, gap = 0.4, lastAccent = true } = o;
      const n = steps.length, bw = (w - gap * (n - 1)) / n;
      steps.forEach((t, i) => {
        const bx = x + i * (bw + gap);
        const fill = lastAccent && i === n - 1 ? C.accent3 : C.text2;
        s.addShape(S.ROUNDED_RECTANGLE, { x: bx, y, w: bw, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.1 });
        s.addText(t, { x: bx + 0.08, y, w: bw - 0.16, h, fontSize: fs, color: C.background1, bold: true, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
        if (i < n - 1) s.addShape(S.RIGHT_ARROW, { x: bx + bw + 0.07, y: y + h / 2 - 0.13, w: gap - 0.14, h: 0.26, fill: { color: C.accent2 }, line: { color: C.accent2 } });
      });
      return bw;
    },
    badge(s, label, x, y, d = 0.5, fill, color, fs = 16) {
      s.addShape(S.OVAL, { x, y, w: d, h: d, fill: { color: fill || C.accent2 }, line: { color: fill || C.accent2 } });
      s.addText(String(label), { x, y, w: d, h: d, fontSize: fs, bold: true, color: color || C.text2, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    },
    // numbered rows: [head, text]
    numbered(s, items, o) {
      const { x = X0, y = Y0, w = CW, rowH = 0.7, fs = 16 } = o;
      items.forEach(([hd, t], i) => {
        const yy = y + i * rowH;
        H.badge(s, i + 1, x, yy + (rowH - 0.48) / 2, 0.48);
        s.addText([
          { text: hd + (t ? ': ' : ''), options: { bold: true, color: C.text2 } },
          { text: t || '', options: { color: C.text1 } },
        ], { x: x + 0.7, y: yy, w: w - 0.7, h: rowH, fontSize: fs, valign: 'middle', isTextBox: true, margin: 0 });
      });
    },
    // grid of cards: {hd, t, b(badge)}
    cards(s, items, o) {
      const { x = X0, y = Y0, w = CW, h = 4, cols = 3, gap = 0.3, fs = 15, hfs = 17, fill } = o;
      const rows = Math.ceil(items.length / cols);
      const cw = (w - gap * (cols - 1)) / cols, ch = (h - gap * (rows - 1)) / rows;
      items.forEach((it, i) => {
        const cx = x + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + gap);
        s.addShape(S.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: ch, fill: { color: fill || C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
        let tx = cx + 0.2;
        if (it.b !== undefined) { H.badge(s, it.b, cx + 0.18, cy + 0.18, 0.5, C.accent3, C.background1, it.b.length > 2 ? 11 : 16); tx = cx + 0.82; }
        s.addText(it.hd, { x: tx, y: cy + 0.15, w: cx + cw - 0.2 - tx, h: 0.56, fontSize: hfs, bold: true, color: C.text2, valign: 'middle', isTextBox: true, margin: 0 });
        if (it.t) s.addText(it.t, { x: cx + 0.2, y: cy + 0.8, w: cw - 0.4, h: ch - 0.95, fontSize: fs, color: C.text1, valign: 'top', isTextBox: true, margin: 0 });
      });
    },
    quote(s, text, o) {
      const { x = X0, y = Y0, w = CW, h = 1.1, fs = 22, by } = o || {};
      s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.12 });
      const runs = [{ text: text, options: { italic: true, color: C.background1 } }];
      if (by) runs.push({ text: '\n' + by, options: { fontSize: 14, color: C.accent2 } });
      s.addText(runs, { x: x + 0.35, y, w: w - 0.7, h, fontSize: fs, valign: 'middle', align: 'center', isTextBox: true, margin: 0 });
    },
    note(s, text, o) {
      const { x = X0, y = 6.35, w = CW, h = 0.5, fs = 14 } = o || {};
      s.addText([{ text: 'Remember: ', options: { bold: true, color: C.accent4 } }, { text, options: { color: C.text1 } }],
        { x, y, w, h, fontSize: fs, valign: 'middle', isTextBox: true, margin: 0 });
    },
    stat(s, big, label, x, y, w, h) {
      s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.background2 }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.1 });
      s.addText(big, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: h * 0.45, fontSize: 48, bold: true, color: C.accent3, fontFace: THEME.headFontFace, valign: 'middle', isTextBox: true, margin: 0 });
      s.addText(label, { x: x + 0.2, y: y + 0.15 + h * 0.45, w: w - 0.4, h: h * 0.55 - 0.3, fontSize: 16, color: C.text1, valign: 'top', isTextBox: true, margin: 0 });
    },
  };
  return H;
}

async function save(pres, file) {
  await pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
}

module.exports = { makeDeck, helpers, save, THEME, X0, CW, Y0, W, BORDER };
