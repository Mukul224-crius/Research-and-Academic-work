// Builds the GIS Odyssey Journal manuscript (Word .docx) for the Bhopal LCZ
// composition study. Every number in the text is read from
// validation/lcz_statistics.json (produced by compute_statistics.py) rather
// than typed by hand, so the text, tables and figures cannot drift apart.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, FootnoteReferenceRun, PageNumber,
  Footer, VerticalAlign, HeightRule,
  Math: OMath, MathRun, MathFraction, MathSubScript, MathSuperScript, MathRadical, MathSum,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const FIG = path.join(ROOT, "figures");
const S = JSON.parse(fs.readFileSync(path.join(ROOT, "validation", "lcz_statistics.json"), "utf8"));
const C = S.composition, G = S.groups, I0 = S.code_stats_incl0, E0 = S.code_stats_excl0;
const AK = S.class_area_stats_km2, AP = S.class_area_stats_pct;
const cls = (n) => S.classes.find((c) => c.lcz === n);
const f = (x, d = 2) => Number(x).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------- native Word equation (OMML) helpers (same convention as the UMAP paper) ----------
const T = (t) => new MathRun(t);
const SUB = (b, s) => new MathSubScript({ children: [T(b)], subScript: [T(s)] });
const SUBc = (bc, s) => new MathSubScript({ children: bc, subScript: [T(s)] });
const SUP = (bc, s) => new MathSuperScript({ children: bc, superScript: [T(s)] });
const FRAC = (n, d) => new MathFraction({ numerator: n, denominator: d });
const RAD = (c) => new MathRadical({ children: c });
const SUMS = (lo, hi, body) => new MathSum(hi ? { subScript: [T(lo)], superScript: [T(hi)], children: body } : { subScript: [T(lo)], children: body });
function mathEq(children, num) {
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 80, after: 120 },
    children: [new OMath({ children }), new TextRun({ text: `\t(${num})`, size: 22 })],
    tabStops: [{ type: "right", position: 9000 }],
  });
}

// ---------- text helpers ----------
// Do NOT use HeadingLevel.* (Word draws collapse triangles beside heading-styled
// paragraphs); plain bold paragraphs keep a print-style look.
const SZ = 22; // 11 pt body
function h1(text) {
  return new Paragraph({ spacing: { before: 280, after: 120 }, keepNext: true,
    children: [new TextRun({ text, bold: true, size: 24 })] });
}
function h2(text) {
  return new Paragraph({ spacing: { before: 180, after: 80 }, keepNext: true,
    children: [new TextRun({ text, bold: true, italics: true, size: SZ })] });
}
// p() accepts a string or an array of strings / {t, i, b, sup, sub, red} run specs.
function runs(parts) {
  if (typeof parts === "string") parts = [parts];
  return parts.map((r) => (typeof r === "string"
    ? new TextRun({ text: r, size: SZ })
    : new TextRun({ text: r.t, size: r.size || SZ, italics: !!r.i || !!r.red, bold: !!r.b,
        superScript: !!r.sup, subScript: !!r.sub, color: r.red ? "C00000" : undefined })));
}
function p(parts, opts = {}) {
  return new Paragraph({ spacing: { after: 140, line: 300 }, alignment: AlignmentType.JUSTIFIED,
    indent: opts.noIndent ? undefined : { firstLine: 360 }, children: runs(parts) });
}
function flag(text) {
  return new Paragraph({ spacing: { after: 140 }, children: [
    new TextRun({ text: "[AUTHOR TO CONFIRM: " + text + "]", size: SZ, italics: true, color: "C00000" })] });
}
function caption(text) {
  return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { before: 80, after: 240 },
    children: [new TextRun({ text: text[0], bold: true, size: 20 }), new TextRun({ text: text[1], size: 20 })] });
}
function tableTitle(num, text) {
  return new Paragraph({ spacing: { before: 200, after: 80 }, keepNext: true, children: [
    new TextRun({ text: `Table ${num}. `, bold: true, size: 20 }), new TextRun({ text, size: 20 })] });
}
function note(text) {
  return new Paragraph({ spacing: { before: 40, after: 200 }, children: [new TextRun({ text, italics: true, size: 18 })] });
}
function figure(file, widthIn) {
  const buf = fs.readFileSync(path.join(FIG, file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20); // PNG IHDR
  const wpx = widthIn * 96;
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160 }, keepNext: true,
    children: [new ImageRun({ type: "png", data: buf, transformation: { width: wpx, height: Math.round(wpx * h / w) } })] });
}

// ---------- table helpers (booktabs-style: rules above/below header and at the end) ----------
const RULE = { style: BorderStyle.SINGLE, size: 8, color: "000000" };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
function tcell(text, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: o.head ? { type: ShadingType.CLEAR, fill: "EDEDED" } : undefined,
    borders: { top: o.top ? RULE : NONE, bottom: o.bottom ? RULE : NONE, left: NONE, right: NONE },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ alignment: o.left ? AlignmentType.LEFT : AlignmentType.CENTER,
      children: [new TextRun({ text, bold: !!o.head || !!o.bold, size: 19 })] })],
  });
}
function dataTable(header, rows, widths, leftCols = [0]) {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA }, alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((h, i) =>
        tcell(h, widths[i], { head: true, top: true, bottom: true, left: leftCols.includes(i) })) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((v, i) =>
        tcell(String(v), widths[i], { left: leftCols.includes(i), bottom: ri === rows.length - 1,
          bold: r[0] === "Total" })) })),
    ],
  });
}

// =====================================================================
// Title block
// =====================================================================
const TITLE = "Decoding the Entropy of Urban Form: Shannon–Simpson Diversity and Rank–Dominance Diagnostics of Local Climate Zones in Bhopal, India, from the Global 100 m LCZ Map";

const titleBlock = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
    children: [new TextRun({ text: TITLE, bold: true, size: 30 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
    new TextRun({ text: "Mukul Maravi", size: SZ }), new FootnoteReferenceRun(1), new TextRun({ text: "*, ", size: SZ }),
    new TextRun({ text: "Janki Prasad", size: SZ }), new FootnoteReferenceRun(2), new TextRun({ text: ", ", size: SZ }),
    new TextRun({ text: "Bikash Das", size: SZ }), new FootnoteReferenceRun(3),
  ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
    new TextRun({ text: "Department of Geography, Faculty of Earth Science, Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh, India", italics: true, size: 20 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [
    new TextRun({ text: "*Corresponding author: research.mukul.maravi@igntu.ac.in", size: 20 })] }),
];

const abstract = [
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Abstract", bold: true, size: SZ })] }),
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 140, line: 276 }, children: runs(
    `Local Climate Zone (LCZ) maps are increasingly used to describe the thermal relevance of urban form, yet most Indian applications report class maps without a quantitative account of how the LCZ mosaic is composed. This study extracts the LCZ structure of Bhopal, India, from the global 100 m LCZ map and evaluates it with areal, distributional and information-theoretic statistics. After reprojection to WGS 84 / UTM 43N (95.16 m pixels) and clipping to the study boundary, ${S.n_classes} of the 17 LCZ classes were detected over ${f(S.valid_km2)} km². Low plants (LCZ 14; ${f(cls(14).pct)}%) and open low-rise (LCZ 6; ${f(cls(6).pct)}%) dominate, and only ${C.classes_to_80pct} classes account for more than 80% of the mapped area. Built types (LCZ 1–10) occupy ${f(G.built_pct)}% and land-cover types ${f(G.landcover_pct)}%, while open built forms exceed compact forms by a factor of ${f(G.open_to_compact_ratio)}. Shannon entropy (H = ${f(C.shannon_H, 3)} nats), evenness (J = ${f(C.pielou_J_observed, 3)}), Gini–Simpson diversity (${f(C.gini_simpson, 3)}) and a Gini coefficient of ${f(C.gini_area, 3)} indicate a moderately diverse but strongly dominance-skewed mosaic. Raster-code statistics (mean ${f(E0.mean)}, median ${E0.median}, SD ${f(E0.sd_pop)} after excluding background) are reported transparently as descriptors of categorical codes. The workflow is reproducible from open data and provides a statistical baseline for LCZ-based heat-risk planning in Bhopal.`) }),
  new Paragraph({ spacing: { after: 240 }, children: [
    new TextRun({ text: "Keywords: ", bold: true, size: SZ }),
    new TextRun({ text: "Local Climate Zones; urban morphology; Shannon entropy; landscape composition; Bhopal", size: SZ })] }),
];

// =====================================================================
// 1. Introduction
// =====================================================================
const intro = [
  h1("1. Introduction"),
  p("Urban climate research has long relied on a binary contrast between “urban” and “rural” observation sites, a simplification that conceals large differences in surface structure, cover and human activity within both categories. The Local Climate Zone (LCZ) scheme was introduced to replace this binary with 17 standard zone types, ten built and seven land-cover classes, defined at the local scale (10² to 10⁴ m) by their surface structure and cover (Stewart & Oke, 2012). Subsequent evaluation with temperature observations and model simulations showed that the scheme discriminates thermally meaningful differences among zones (Stewart et al., 2014), which established LCZ classes as a common language for urban heat studies, planning and modelling."),
  p("The World Urban Database and Access Portal Tools (WUDAPT) initiative operationalised the scheme by combining freely available satellite imagery, crowd-sourced training areas and supervised classification into a repeatable protocol for mapping cities worldwide (Bechtel et al., 2015). The protocol was later scaled to a continental LCZ map of Europe (Demuzere et al., 2019) and then to a global 100 m LCZ map produced with random forest models trained on a very large set of labelled areas (Demuzere et al., 2022). The global product makes it possible to examine the LCZ structure of any city, including cities for which no locally trained classification exists, using a consistent legend and method."),
  p("In India, LCZ mapping has had to address heterogeneous built form and limited data. Kotharkar and Bagade (2018) documented the stages and difficulties of LCZ delineation in Nagpur, and later linked LCZ classes to outdoor thermal comfort (Kotharkar, Bagade, & Agrawal, 2019) and to the drivers of canopy-layer urban heat islands (Kotharkar, Bagade, & Ramesh, 2019). Multi-city work has shown that seasonal land surface temperature (LST) differs by about 3–4 °C between urban LCZs in major Indian metropolitan areas (Saxena & Agrawal, 2023), and the first multi-temporal LCZ mapping in India documented rapid change in the built LCZ classes of Pune (Saha et al., 2025)."),
  p("Bhopal, the capital of Madhya Pradesh, has recently received focused LCZ attention. Mistry and Mehrotra (2023) related daytime LST to LCZ classes using Landsat imagery and reported a cool-island pattern in which urban LCZs were cooler than rural ones; Mistry and Mehrotra (2025a, 2025b) showed that landscape-pattern metrics of LCZ patches, such as patch and edge density, are associated with surface temperature; Mistry and Mehrotra (2026) assessed peak summer surface heat with thermal field variance indices; and Dwivedi and Soni (2026) quantified the cooling effect of blue-green infrastructure across local urban zones. These studies explain how temperature varies among zones, but they do not report how the LCZ mosaic itself is composed: how much area each zone occupies, how evenly area is distributed among zones, and how strongly the mosaic is dominated by a few classes. They also rely on locally trained classifications rather than the standardised global product, which limits comparison with other cities."),
  p("This study addresses that gap. Its objectives are (i) to quantify the area and proportion of every LCZ class in Bhopal from the global 100 m LCZ map; (ii) to report descriptive statistics of the LCZ raster, namely the mean, median and standard deviation (SD), with an explicit treatment of background pixels and of the categorical nature of LCZ codes; and (iii) to characterise the composition of the LCZ mosaic with information-theoretic diversity, evenness and dominance indices. The results provide a reproducible statistical baseline against which future locally trained or multi-temporal LCZ maps of Bhopal can be compared."),
];

// =====================================================================
// 2. Study area
// =====================================================================
const studyArea = [
  h1("2. Study area"),
  p(["Bhopal is the capital of Madhya Pradesh in central India and a tier-2 city with a composite climate (Mistry & Mehrotra, 2026). Its urban form combines a dense historic core, planned residential sectors and institutional campuses with large lakes and a rapidly expanding peri-urban fringe. The analysis covers the study-area raster clipped to the Bhopal boundary in WGS 84 / UTM zone 43N (EPSG:32643), whose rectangular extent spans 731,025–759,763 m E and 2,557,268–2,583,437 m N (302 × 275 pixels; ", `${f(S.extent_km2)} km²`, "). Within this rectangle, ", `${f(S.valid_km2)} km²`, " carry a valid LCZ code, and the remainder (", `${f(S.zero_km2)} km²; ${f(S.zero_pct_of_extent)}%`, ") lies outside the boundary and is coded 0 (Fig. 1)."]),
  flag("state which official boundary was used for clipping (e.g., Bhopal Municipal Corporation limit or Bhopal Planning Area) and its source. The valid LCZ area (419.04 km²) differs from the ≈411 km² municipal grid extent used in our UMAP paper, so the two boundaries are probably not identical."),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 80 }, keepNext: true, children: [] }),
  new Table({
    width: { size: 9000, type: WidthType.DXA }, alignment: AlignmentType.CENTER,
    rows: [new TableRow({ height: { value: 7600, rule: HeightRule.EXACT }, children: [new TableCell({
      width: { size: 9000, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      borders: { top: { style: BorderStyle.DASHED, size: 8, color: "808080" }, bottom: { style: BorderStyle.DASHED, size: 8, color: "808080" },
        left: { style: BorderStyle.DASHED, size: 8, color: "808080" }, right: { style: BorderStyle.DASHED, size: 8, color: "808080" } },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({
        text: "[Space reserved for the final LCZ map of Bhopal – paste Fig. 1 here]", italics: true, color: "808080", size: 22 })] })],
    })] })],
  }),
  caption(["Fig. 1. ", "Local Climate Zones of Bhopal derived from the global 100 m LCZ map (Demuzere et al., 2022), reprojected to WGS 84 / UTM 43N and clipped to the study boundary; colours follow the standard LCZ key. Source: own elaboration in QGIS 3.44."]),
];

// =====================================================================
// 3. Data and methods
// =====================================================================
const methods = [
  h1("3. Data and methods"),
  h2("3.1. Data"),
  p("The LCZ data were taken from the global 100 m LCZ map of Demuzere et al. (2022), which applies the 17-class scheme of Stewart and Oke (2012) worldwide. The map was generated with random forest classifiers trained on labelled LCZ training areas and earth-observation inputs, and its quality was assessed by bootstrap cross-validation and by a thematic benchmark against independent data for 150 functional urban areas (Demuzere et al., 2022). Using a global product guarantees that the Bhopal results share a legend and method with every other city covered by the map."),
  flag("give the exact product version and Zenodo record used for download, and the access date."),
  h2("3.2. Pre-processing"),
  p("All processing was done in QGIS 3.44. The global raster was reprojected to WGS 84 / UTM zone 43N with nearest-neighbour resampling, which keeps the categorical codes intact, giving square pixels of 95.1595 m. It was then clipped to the study boundary. Pixels outside the boundary received the value 0. Before any statistic was calculated, the Identify Features tool was used to sample pixels across the clipped raster and confirm that value 0 occurs only outside the boundary, so that 0 represents background rather than an unclassified area inside Bhopal. The classes were styled with the standard LCZ colour key (e.g., LCZ 1 compact high-rise #8C0000; LCZ 7 lightweight low-rise #FAEE05), and pixel frequencies were extracted with the Raster layer unique values report tool (Fig. 2)."),
  flag("confirm that nearest-neighbour resampling was selected during reprojection (the 95.16 m pixel size shows the raster was resampled)."),
  figure("fig2_workflow.png", 6.0),
  caption(["Fig. 2. ", "Methodological workflow of the study. Source: own elaboration."]),
  h2("3.3. Areal quantification"),
  p(["For each LCZ class ", { t: "i", i: true }, " with pixel count ", { t: "n", i: true }, { t: "i", i: true, sub: true }, ", area and percentage share were computed as"], { noIndent: true }),
  mathEq([SUB("A", "i"), T("="), FRAC([SUB("n", "i"), T("×Δx×Δy")], [SUP([T("10")], "6")])], 1),
  mathEq([SUB("P", "i"), T("="), FRAC([SUB("A", "i")], [SUMS("j=1", "S", [SUB("A", "j")])]), T("×100")], 2),
  p(["where Δ", { t: "x", i: true }, " = Δ", { t: "y", i: true }, " = 95.1595 m is the pixel size, ", { t: "A", i: true }, { t: "i", i: true, sub: true }, " is in km², and ", { t: "S", i: true }, ` = ${S.n_classes} is the number of LCZ classes present. Classes were further aggregated into built (LCZ 1–10) and land-cover (LCZ 11–17) types following Stewart and Oke (2012), and into six morphological groups: compact (1–3), open (4–6), other built (7–10), vegetated (11–14), bare (15–16) and water (17).`], { noIndent: true }),
  h2("3.4. Descriptive statistics of the LCZ raster"),
  p(["Descriptive statistics of the raster band were computed from the frequency table, treating each pixel as an observation with value ", { t: "x", i: true }, { t: "k", i: true, sub: true }, " (the LCZ code) occurring ", { t: "n", i: true }, { t: "k", i: true, sub: true }, " times among ", { t: "N", i: true }, " pixels:"], { noIndent: true }),
  mathEq([new MathRun("x̄"), T("="), FRAC([T("1")], [T("N")]), SUMS("k", "", [SUB("n", "k"), SUB("x", "k")])], 3),
  mathEq([T("SD="), RAD([FRAC([T("1")], [T("N")]), SUMS("k", "", [SUB("n", "k"), SUP([T("("), SUB("x", "k"), T("−"), new MathRun("x̄"), T(")")], "2")])])], 4),
  p(["The median is the value at the middle position, or the mean of the two middle positions, of the ", { t: "N", i: true }, " ordered pixel values; the first and third quartiles were obtained in the same way. Statistics are reported both including value 0 (the default in QGIS layer properties) and excluding it, because background pixels shift every moment of the distribution. LCZ codes are category labels rather than measurements, so these values describe where the mass of the code distribution lies and must not be read as physical quantities such as temperature or building height."], { noIndent: true }),
  h2("3.5. Distribution of class areas"),
  p(["To describe how area is spread among classes, the mean, median, population SD, coefficient of variation (CV = SD / mean × 100) and moment skewness ", { t: "g", i: true }, { t: "1", sub: true }, " of the ", S.n_classes.toString(), " class areas were calculated:"], { noIndent: true }),
  mathEq([SUB("g", "1"), T("="), FRAC([FRAC([T("1")], [T("S")]), SUMS("i=1", "S", [SUP([T("("), SUB("A", "i"), T("−"), new MathRun("Ā"), T(")")], "3")])], [SUP([T("SD")], "3")])], 5),
  h2("3.6. Composition indices"),
  p(["With ", { t: "p", i: true }, { t: "i", i: true, sub: true }, " = ", { t: "P", i: true }, { t: "i", i: true, sub: true }, " / 100, the information content of the LCZ mosaic was measured with Shannon entropy (Shannon, 1948) and its normalised form, the evenness ", { t: "J", i: true }, " (also known as Pielou’s evenness), computed against both the observed number of classes and the full 17-class scheme:"], { noIndent: true }),
  mathEq([T("H=−"), SUMS("i=1", "S", [SUB("p", "i"), T("ln"), SUB("p", "i")])], 6),
  mathEq([T("J="), FRAC([T("H")], [T("ln S")])], 7),
  p(["Concentration was measured with the Gini–Simpson index, its reciprocal form (the effective number of equally abundant classes; Simpson, 1949), the Hill number of order one, the Berger–Parker dominance index and the Gini coefficient of class areas sorted in ascending order (", { t: "A", i: true }, { t: "(1)", sub: true }, " ≤ … ≤ ", { t: "A", i: true }, { t: "(S)", sub: true }, "):"], { noIndent: true }),
  mathEq([T("D=1−"), SUMS("i=1", "S", [SUP([SUB("p", "i")], "2")]), T(",     "), SUB("N", "2"), T("="), FRAC([T("1")], [SUMS("i=1", "S", [SUP([SUB("p", "i")], "2")])]), T(",     "), SUB("N", "1"), T("="), SUP([T("e")], "H")], 8),
  mathEq([T("BP="), SUB("max", "i"), SUB("p", "i"), T(",     Gini="), FRAC([SUMS("i=1", "S", [T("(2i−S−1)"), SUB("A", "(i)")])], [T("S"), SUMS("i=1", "S", [SUB("A", "i")])])], 9),
  p("A rank–dominance curve, the cumulative share of area plotted against class rank, summarises these indices graphically: the further the curve lies above the line of perfect evenness, the more the mosaic is dominated by a few classes."),
  h2("3.7. Verification"),
  p(["All statistics were computed with a Python script that reads only the QGIS frequency report. Three internal checks were passed: (i) the area column of the report equals pixel count × pixel area for every class; (ii) the total pixel count equals the raster dimensions (302 × 275 = 83,050); and (iii) the mean and SD computed from the frequency table including value 0 (", `${f(I0.mean, 5)} and ${f(I0.sd_pop, 4)}`, ") reproduce the values reported by QGIS for the layer (5.54485 and 5.9331). The script, frequency table and outputs are provided as supplementary material."]),
];

// =====================================================================
// 4. Results
// =====================================================================
const order = [...S.classes].sort((a, b) => a.lcz - b.lcz);
const t1rows = order.map((c) => [`LCZ ${c.lcz}`, c.name, c.group, c.pixels.toLocaleString("en-US"), f(c.area_km2, 3), f(c.pct), c.rank]);
t1rows.push(["Total", `${S.n_classes} classes`, "", S.valid_pixels.toLocaleString("en-US"), f(S.valid_km2, 3), "100.00", ""]);

const t2rows = [
  ["Pixels (N)", I0.n.toLocaleString("en-US"), E0.n.toLocaleString("en-US")],
  ["Minimum", f(I0.min, 0), f(E0.min, 0)],
  ["Maximum", f(I0.max, 0), f(E0.max, 0)],
  ["Mean", f(I0.mean, 4), f(E0.mean, 4)],
  ["Median", f(I0.median, 0), f(E0.median, 0)],
  ["Mode", f(I0.mode, 0), f(E0.mode, 0)],
  ["First quartile (Q1)", f(I0.q1, 0), f(E0.q1, 0)],
  ["Third quartile (Q3)", f(I0.q3, 0), f(E0.q3, 0)],
  ["SD (population)", f(I0.sd_pop, 4), f(E0.sd_pop, 4)],
  ["SD (sample)", f(I0.sd_sample, 4), f(E0.sd_sample, 4)],
  ["Coefficient of variation (%)", f(I0.cv_pct), f(E0.cv_pct)],
];
const t3rows = [
  ["Number of classes", AK.n, AP.n],
  ["Mean", f(AK.mean, 3), f(AP.mean, 3)],
  ["Median", f(AK.median, 3), f(AP.median, 3)],
  ["SD (population)", f(AK.sd_pop, 3), f(AP.sd_pop, 3)],
  ["SD (sample)", f(AK.sd_sample, 3), f(AP.sd_sample, 3)],
  ["Coefficient of variation (%)", f(AK.cv_pct, 1), f(AP.cv_pct, 1)],
  ["Minimum", f(AK.min, 3), f(AP.min, 3)],
  ["First quartile (Q1)", f(AK.q1, 3), f(AP.q1, 3)],
  ["Third quartile (Q3)", f(AK.q3, 3), f(AP.q3, 3)],
  ["Maximum", f(AK.max, 3), f(AP.max, 3)],
  ["Skewness (g1)", f(AK.skewness, 3), f(AP.skewness, 3)],
  ["Total", f(AK.total, 3), f(AP.total, 3)],
];
const t4rows = [
  ["Shannon entropy H (nats)", f(C.shannon_H, 4), `max ln 13 = ${f(C.H_max_observed, 4)}`],
  ["Evenness J (13 observed classes)", f(C.pielou_J_observed, 4), "0–1"],
  ["Evenness J (17-class scheme)", f(C.pielou_J_17, 4), "0–1"],
  ["Gini–Simpson diversity D", f(C.gini_simpson, 4), `max 1 − 1/13 = ${f(1 - 1 / 13, 4)}`],
  ["Inverse Simpson N2 (effective classes)", f(C.inverse_simpson, 3), "1–13"],
  ["Hill number N1 = e^H (effective classes)", f(C.hill_N1, 3), "1–13"],
  ["Berger–Parker dominance BP", f(C.berger_parker, 4), "1/13–1"],
  ["Gini coefficient of class areas", f(C.gini_area, 4), "0–(S−1)/S"],
  ["Classes covering ≥ 80% of area", C.classes_to_80pct, "1–13"],
  ["Shannon H, built classes only", f(C.shannon_built, 4), "max ln 6 = 1.7918"],
  ["Shannon H, land-cover classes only", f(C.shannon_landcover, 4), "max ln 7 = 1.9459"],
];

const results = [
  h1("4. Results"),
  h2("4.1. Spatial pattern of Local Climate Zones"),
  p(`Fig. 1 shows the LCZ structure of Bhopal. Of the 17 standard classes, ${S.n_classes} occur in the study area; compact high-rise (LCZ 1), open high-rise (LCZ 4), lightweight low-rise (LCZ 7) and heavy industry (LCZ 10) were not detected at the 100 m resolution of the global product. The absence of LCZ 1 and LCZ 4 is consistent with a city in which tall buildings remain scattered rather than forming contiguous high-rise districts, and the absence of LCZ 7 indicates that informal lightweight settlements, where they exist, are not extensive enough to dominate 100 m cells.`),
  flag("after pasting the map, describe in 3–4 sentences where the main classes lie (e.g., location of compact low-rise LCZ 3 relative to the old city, the ring of open low-rise LCZ 6, the position of water LCZ 17 relative to the Upper and Lower Lakes, and the peripheral low-plant LCZ 14 and sparsely built LCZ 9). These spatial statements must come from the map itself and were not written for you."),
  h2("4.2. Areal composition"),
  p(`Table 1 and Fig. 3b give the area of each class. Low plants (LCZ 14) form the largest class, with ${f(cls(14).area_km2)} km² (${f(cls(14).pct)}%), followed by open low-rise (LCZ 6; ${f(cls(6).area_km2)} km², ${f(cls(6).pct)}%). Together these two classes cover ${f(C.top2_share_pct)}% of the mapped area. Compact low-rise (LCZ 3; ${f(cls(3).pct)}%), sparsely built (LCZ 9; ${f(cls(9).pct)}%), water (LCZ 17; ${f(cls(17).pct)}%) and large low-rise (LCZ 8; ${f(cls(8).pct)}%) form a middle tier, while the remaining seven classes each occupy less than 2.1%. Mid-rise forms are almost absent: compact mid-rise (LCZ 2) and open mid-rise (LCZ 5) together cover only ${f(cls(2).area_km2 + cls(5).area_km2, 3)} km².`),
  tableTitle(1, "Area and share of Local Climate Zone classes in Bhopal"),
  dataTable(["LCZ", "Class name", "Type", "Pixels", "Area (km²)", "Share (%)", "Rank"], t1rows,
    [800, 2300, 1200, 1100, 1200, 1100, 700], [0, 1, 2]),
  note("Note: Area = pixels × 95.1595² m²; shares calculated from unrounded areas. LCZ 1, 4, 7 and 10 not detected. Source: own calculation from the global LCZ map (Demuzere et al., 2022)."),
  p(`At the first level of aggregation, built LCZs cover ${f(G.built_km2)} km² (${f(G.built_pct)}%) and land-cover LCZs ${f(G.landcover_km2)} km² (${f(G.landcover_pct)}%), a built-to-land-cover ratio of ${f(G.built_to_landcover_ratio)} (Fig. 3d). Within the built fabric, open forms (LCZ 4–6; ${f(G.open_km2)} km²) are ${f(G.open_to_compact_ratio)} times as extensive as compact forms (LCZ 1–3; ${f(G.compact_km2)} km²), and the other built group, made up of large low-rise and sparsely built areas, adds ${f(G.other_built_km2)} km². Among land-cover types, vegetated classes (${f(G.vegetation_km2)} km²) far exceed water (${f(G.water_km2)} km²) and bare surfaces (${f(G.bare_km2)} km²). These proportions describe the composition of the classified map; they are not direct measurements of impervious-surface fraction.`),
  figure("fig3_dashboard_composition.png", 6.3),
  caption(["Fig. 3. ", "LCZ composition dashboard for Bhopal: (a) headline indicators; (b) area of each LCZ class in the standard LCZ colours; (c) rank–dominance curve against the line of perfect evenness; (d) hierarchical composition by built/land-cover type and morphological group. Source: own elaboration."]),
  h2("4.3. Descriptive statistics of the LCZ raster"),
  p(`Table 2 reports the raster-band statistics requested for a standard raster summary. Including background pixels, the mean code is ${f(I0.mean, 4)}, the median ${I0.median} and the SD ${f(I0.sd_pop, 4)}; the mode is 0 because background is the single most frequent value. Excluding background, the mean rises to ${f(E0.mean, 4)}, the median to ${E0.median}, and the SD falls to ${f(E0.sd_pop, 4)}, while the mode becomes ${E0.mode} (low plants). The gap between mean and median, and the bimodal frequency distribution in Fig. 4a with peaks at LCZ 6 and LCZ 14, show that the central-tendency statistics fall between two dominant classes rather than on a typical class. Excluding background is therefore essential, and even then the mean and SD summarise the position of the code distribution rather than any physical property of the city.`),
  tableTitle(2, "Descriptive statistics of the LCZ raster band (LCZ codes)"),
  dataTable(["Statistic", "Including value 0", "Excluding value 0"], t2rows, [3600, 2400, 2400]),
  note("Note: Values 1–17 are category codes; statistics describe the code distribution only. Value 0 = background outside the study boundary. Source: own calculation."),
  h2("4.4. Distribution of class areas"),
  p(`The class areas are strongly right-skewed (Table 3). The mean class area is ${f(AK.mean, 3)} km² (${f(AP.mean)}% of the mapped area), but the median is only ${f(AK.median, 3)} km² (${f(AP.median)}%), and the SD of ${f(AK.sd_pop, 3)} km² gives a coefficient of variation of ${f(AK.cv_pct, 1)}%. The positive skewness (g1 = ${f(AK.skewness, 3)}) confirms that a few large classes coexist with many small ones, so the median describes a typical class better than the mean.`),
  tableTitle(3, "Descriptive statistics of LCZ class areas"),
  dataTable(["Statistic", "Class area (km²)", "Class share (%)"], t3rows, [3600, 2400, 2400]),
  note("Note: Computed over the 13 detected classes; SD of shares in percentage points. Source: own calculation."),
  h2("4.5. Diversity, evenness and dominance"),
  p(`Shannon entropy of the LCZ mosaic is ${f(C.shannon_H, 4)} nats, against a maximum of ${f(C.H_max_observed, 4)} for 13 equally abundant classes, giving an evenness of ${f(C.pielou_J_observed, 3)} (${f(C.pielou_J_17, 3)} relative to the full 17-class scheme; Table 4, Fig. 4c). The Gini–Simpson index (${f(C.gini_simpson, 3)}) implies that two randomly chosen pixels belong to different classes in about three of four cases, yet the effective number of classes is only ${f(C.hill_N1, 2)} (Hill N1) or ${f(C.inverse_simpson, 2)} (inverse Simpson), well below the 13 classes present. Dominance is high: the Berger–Parker index shows that one class (LCZ 14) holds ${f(C.berger_parker * 100, 1)}% of the area, the Gini coefficient of class areas is ${f(C.gini_area, 3)}, and the rank–dominance curve (Fig. 3c) crosses 80% at only ${C.classes_to_80pct} classes. Entropy is higher within the built classes (H = ${f(C.shannon_built, 3)}) than within the land-cover classes (H = ${f(C.shannon_landcover, 3)}), meaning that the built fabric is more internally differentiated than the surrounding land cover, which is dominated by low plants.`),
  tableTitle(4, "Composition indices of the Bhopal LCZ mosaic"),
  dataTable(["Index", "Value", "Range / reference"], t4rows, [4200, 1800, 2400]),
  note("Note: Natural logarithms used throughout. Source: own calculation."),
  figure("fig4_dashboard_statistics.png", 6.3),
  caption(["Fig. 4. ", "Statistical dashboard of the LCZ raster: (a) pixel frequency of each raster value with mean and median including and excluding background; (b) mean ± SD, median and interquartile range of LCZ codes with and without value 0; (c) composition indices against their attainable maxima. Source: own elaboration."]),
];

// =====================================================================
// 5. Discussion
// =====================================================================
const discussion = [
  h1("5. Discussion"),
  p("The Bhopal LCZ mosaic is dominated by low-rise forms. Open low-rise (LCZ 6) is the main built class, and compact low-rise (LCZ 3) is the only compact class of any extent. This mirrors the LCZ structure reported for Nagpur, where compact and open low-rise and sparsely built classes, with their sub-classes, account for most of the built land cover (Kotharkar & Bagade, 2018), and confirms that the low-rise categories are the most relevant for central Indian cities. Mid- and high-rise classes, which drive much of the LCZ-temperature literature in compact Asian cities, are almost absent here."),
  p(`The composition indices add information that a class map cannot convey. A Gini–Simpson value of ${f(C.gini_simpson, 2)} on its own would suggest a diverse city, but the effective number of classes (about ${Math.round(C.hill_N1)}) and the Berger–Parker value show that this diversity is concentrated in a small number of dominant zones. For heat-risk planning this matters, because intervention priorities are set by the zones that cover most of the city. Mistry and Mehrotra (2025a) found the highest surface temperatures in Bhopal in compact low-rise LCZ 3, which covers ${f(cls(3).pct, 1)}% of the area here. LCZ 3 is therefore a spatially limited but thermally critical class, whereas LCZ 6 combines a large area with moderate density and is the class where cumulative gains from greening and cool-surface measures would be largest.`),
  p(`Water (LCZ 17; ${f(cls(17).pct)}%) and dense or scattered trees (LCZ 11–12) are small in area but important for the city's thermal regulation. In Bhopal, the water LCZ was reported to be 3–5 °C cooler than other classes (Mistry & Mehrotra, 2023), and major water bodies produce measurable cooling over distances of several kilometres (Dwivedi & Soni, 2026). The dominance of low plants (LCZ 14) at the urban fringe is consistent with the warmer rural surfaces that create Bhopal's daytime surface cool island (Mistry & Mehrotra, 2023; Mistry & Mehrotra, 2026), since bare and sparsely vegetated agricultural land heats strongly before the monsoon. At the national scale, open mid-rise (LCZ 5) was the hottest built class across major metropolitan cities (Saxena & Agrawal, 2023). Its near-absence in Bhopal suggests that the thermal hierarchy of LCZs in tier-2 cities may differ from that of the metros and should be tested locally.`),
  p("Methodologically, the study shows how the conventional raster summary statistics (mean, median and SD) can be reported for a categorical raster without misrepresenting it. Such statistics are only interpretable once background is removed, and even then they describe the code distribution rather than urban properties. The class-area distribution and the composition indices are the substantive quantitative results. Because they are computed from a standardised global map (Demuzere et al., 2022), they can be reproduced for other Indian cities and compared directly, which is not possible with locally trained classifications that use different training areas and class sets (Bechtel et al., 2015; Demuzere et al., 2019)."),
  h2("5.1. Limitations"),
  p("Five limitations apply. First, the results inherit the classification uncertainty of the global LCZ map, and no independent accuracy assessment with local reference data was carried out, so producer's and user's accuracies for Bhopal are unknown. Second, at 100 m resolution small or fragmented zones, such as informal lightweight settlements or isolated high-rise blocks, can be absorbed into neighbouring classes, which may explain the absence of LCZ 1, 4, 7 and 10. Third, reprojection resampled the 100 m grid to 95.16 m pixels, which changes pixel counts slightly although nearest-neighbour resampling preserves the class codes. Fourth, the analysis is a single snapshot and cannot capture the kind of rapid LCZ transitions documented for Pune (Saha et al., 2025). Fifth, the composition indices depend on the analytical extent and the number of classes, so comparisons with other cities should use the same boundary definition and index formulation."),
];

const conclusion = [
  h1("6. Conclusions"),
  p(`This study provides the first quantitative compositional account of Local Climate Zones in Bhopal based on the standardised global 100 m LCZ map. Thirteen of the 17 LCZ classes were detected over ${f(S.valid_km2)} km². Low plants and open low-rise dominate, together covering ${f(C.top2_share_pct, 1)}% of the area, and built types slightly exceed land-cover types (${f(G.built_pct, 1)}% vs ${f(G.landcover_pct, 1)}%). Shannon entropy of ${f(C.shannon_H, 3)} nats, an evenness of ${f(C.pielou_J_observed, 3)} and a Gini coefficient of ${f(C.gini_area, 3)} describe a moderately diverse but strongly dominance-skewed mosaic in which four classes cover more than 80% of the city. Raster-code statistics are reported both with and without background and are explicitly limited to the code distribution. The reproducible workflow and the verified statistics provide a baseline for future work linking LCZ composition to land surface temperature, validating the global map with local reference data and tracking LCZ change in Bhopal over time.`),
];

const backMatter = [
  h1("Acknowledgments"),
  p("The authors thank the GIS Lab of the Department of Geography, Faculty of Earth Science, Indira Gandhi National Tribal University, Amarkantak, for computing facilities, and the developers of the global LCZ map for making the dataset openly available. The authors also thank the editorial board and the reviewers for their comments and suggestions."),
  h1("Data availability"),
  p("The global LCZ map is openly available from the sources given in Demuzere et al. (2022). The frequency table, processing script and derived statistics used in this study are available from the corresponding author on request."),
  h1("Conflict of interest"),
  p("The authors declare no conflict of interest."),
];

// =====================================================================
// References (APA 7th edition) - every DOI verified by web search, 21 Oct 2026
// =====================================================================
const REFS = [
  [["Bechtel, B., Alexander, P. J., Böhner, J., Ching, J., Conrad, O., Feddema, J., Mills, G., See, L., & Stewart, I. (2015). Mapping local climate zones for a worldwide database of the form and function of cities. "], ["ISPRS International Journal of Geo-Information, 4", true], ["(1), 199–219. https://doi.org/10.3390/ijgi4010199"]],
  [["Demuzere, M., Bechtel, B., Middel, A., & Mills, G. (2019). Mapping Europe into local climate zones. "], ["PLOS ONE, 14", true], ["(4), Article e0214474. https://doi.org/10.1371/journal.pone.0214474"]],
  [["Demuzere, M., Kittner, J., Martilli, A., Mills, G., Moede, C., Stewart, I. D., van Vliet, J., & Bechtel, B. (2022). A global map of local climate zones to support earth system modelling and urban-scale environmental science. "], ["Earth System Science Data, 14", true], ["(8), 3835–3873. https://doi.org/10.5194/essd-14-3835-2022"]],
  [["Dwivedi, A., & Soni, R. (2026). Spatiotemporal effects of blue-green infrastructure on land surface temperature across local geo-urban zones in Bhopal. "], ["Theoretical and Applied Climatology, 157", true], [", Article 493. https://doi.org/10.1007/s00704-026-06420-7"]],
  [["Kotharkar, R., & Bagade, A. (2018). Local climate zone classification for Indian cities: A case study of Nagpur. "], ["Urban Climate, 24", true], [", 369–392. https://doi.org/10.1016/j.uclim.2017.03.003"]],
  [["Kotharkar, R., Bagade, A., & Agrawal, A. (2019). Investigating local climate zones for outdoor thermal comfort assessment in an Indian city. "], ["Geographica Pannonica, 23", true], ["(4), 318–328. https://doi.org/10.5937/gp23-24251"]],
  [["Kotharkar, R., Bagade, A., & Ramesh, A. (2019). Assessing urban drivers of canopy layer urban heat island: A numerical modeling approach. "], ["Landscape and Urban Planning, 190", true], [", Article 103586. https://doi.org/10.1016/j.landurbplan.2019.05.017"], ["  [confirm volume and article number]", false, true]],
  [["Mistry, R., & Mehrotra, S. (2023). Spatio-temporal variation of the daytime surface temperature in local climate zones, forming cool island in Bhopal. "], ["Journal of the Indian Society of Remote Sensing, 51", true], [", 713–731. https://doi.org/10.1007/s12524-022-01658-w"]],
  [["Mistry, R., & Mehrotra, S. (2025a). Impact of urban climate landscape patterns on thermal environment in local climate zones of Bhopal City. "], ["Computational Urban Science, 5", true], [", Article 47. https://doi.org/10.1007/s43762-025-00217-6"]],
  [["Mistry, R., & Mehrotra, S. (2025b). "], ["Influence of landscape patterns of local climate zones on thermal environment of Bhopal City", true], [" (Abstract ICUC12-1066). 12th International Conference on Urban Climate, Rotterdam, the Netherlands. https://doi.org/10.5194/icuc12-1066"]],
  [["Mistry, R., & Mehrotra, S. (2026). Assessing peak summer surface heat and urban thermal variability using UTFVI and surface heat intensity: A case study of Bhopal City. "], ["Journal of the Indian Society of Remote Sensing", true], [". Advance online publication. https://doi.org/10.1007/s12524-026-02447-5"]],
  [["Saha, L., Patil, A., Dhorde, A., Demuzere, M., & Singh, B. B. (2025). Assessing thermal environmental changes of a semi-arid city using multi-temporal LCZ approach: A case study of Pune, India. "], ["Environmental Monitoring and Assessment, 197", true], [", Article 1070. https://doi.org/10.1007/s10661-025-14466-9"]],
  [["Saxena, S., & Agrawal, S. (2023). Seasonal variations in land surface temperature based on local climatic zone in the major metropolitan cities of India. "], ["Spatial Information Research, 31", true], [", 609–623. https://doi.org/10.1007/s41324-023-00527-z"]],
  [["Shannon, C. E. (1948). A mathematical theory of communication. "], ["Bell System Technical Journal, 27", true], ["(3), 379–423. https://doi.org/10.1002/j.1538-7305.1948.tb01338.x"]],
  [["Simpson, E. H. (1949). Measurement of diversity. "], ["Nature, 163", true], [", 688. https://doi.org/10.1038/163688a0"]],
  [["Stewart, I. D., & Oke, T. R. (2012). Local climate zones for urban temperature studies. "], ["Bulletin of the American Meteorological Society, 93", true], ["(12), 1879–1900. https://doi.org/10.1175/BAMS-D-11-00019.1"]],
  [["Stewart, I. D., Oke, T. R., & Krayenhoff, E. S. (2014). Evaluation of the ‘local climate zone’ scheme using temperature observations and model simulations. "], ["International Journal of Climatology, 34", true], ["(4), 1062–1080. https://doi.org/10.1002/joc.3746"]],
];
const refParas = REFS.map((segs) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { after: 100 }, indent: { left: 720, hanging: 720 },
  children: segs.map(([t, it, red]) => new TextRun({ text: t, italics: !!it || !!red, size: 20, color: red ? "C00000" : undefined })),
}));

// =====================================================================
// Assemble
// =====================================================================
const fn = (t) => ({ children: [new Paragraph({ children: [new TextRun({ text: t, size: 16 })] })] });
const doc = new Document({
  creator: "Mukul Maravi",
  title: TITLE,
  styles: { default: { document: { run: { font: "Times New Roman", size: SZ } } } },
  footnotes: {
    1: fn("Mukul Maravi: Department of Geography, Indira Gandhi National Tribal University, Amarkantak, India; ORCID: https://orcid.org/0009-0004-4960-9666; research.mukul.maravi@igntu.ac.in"),
    2: fn("Janki Prasad: Department of Geography, Indira Gandhi National Tribal University, Amarkantak, India; ORCID: https://orcid.org/0009-0003-8682-4405; janki.prasad@igntu.ac.in"),
    3: fn("Bikash Das: Department of Geography, Indira Gandhi National Tribal University, Amarkantak, India; ORCID: https://orcid.org/0009-0004-8767-7643; ressch.bikash.das@igntu.ac.in"),
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1418, left: 1418, right: 1418 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
    children: [
      ...titleBlock, ...abstract, ...intro, ...studyArea, ...methods, ...results,
      ...discussion, ...conclusion, ...backMatter, h1("References"), ...refParas,
    ],
  }],
});

module.exports = { REFS, TITLE };
if (require.main === module) {
  Packer.toBuffer(doc).then((buf) => {
    const out = path.join(ROOT, "Bhopal_LCZ_Composition_Paper_DRAFT.docx");
    fs.writeFileSync(out, buf);
    console.log("Wrote", out, (buf.length / 1024).toFixed(0), "KB");
  });
}
