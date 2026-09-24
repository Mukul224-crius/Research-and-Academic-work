const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, SectionType,
  Math: OMath, MathRun, MathFraction, MathSubScript, MathSuperScript, MathRadical, MathSum,
} = require("docx");

// ---------- native Word equation (OMML) helpers ----------
// Matches the senior co-author paper's convention of real embedded equation
// objects (proper stacked fractions/roots/sums) rather than unicode-text
// approximations of math.
function T(text) { return new MathRun(text); }
function SUB(baseText, subText) { return new MathSubScript({ children: [T(baseText)], subScript: [T(subText)] }); }
function SUBc(baseChildren, subText) { return new MathSubScript({ children: baseChildren, subScript: [T(subText)] }); }
function SUP(baseChildren, supText) { return new MathSuperScript({ children: baseChildren, superScript: [T(supText)] }); }
function FRAC(numChildren, denChildren) { return new MathFraction({ numerator: numChildren, denominator: denChildren }); }
function RAD(children) { return new MathRadical({ children }); }
function SUMSUB(subText, bodyChildren) { return new MathSum({ subScript: [T(subText)], children: bodyChildren }); }
function SUMSUBSUP(subText, supText, bodyChildren) { return new MathSum({ subScript: [T(subText)], superScript: [T(supText)], children: bodyChildren }); }
function mathEq(mathChildren, num) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 100 },
    children: [
      new OMath({ children: mathChildren }),
      ...(num ? [new TextRun({ text: `    (${num})`, size: 20 })] : []),
    ],
  });
}

const FIG = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/figures";
const PAGE_W = 12240, PAGE_H = 15840, MARGIN = 1080;
const COL_WIDTH_EMU = 3300000; // ~half-page column width at 2-col, in EMU-ish scale used below

// ---------- helpers ----------
// IMPORTANT (kept for future docx-js builds of this kind of paper): do NOT use
// docx-js HeadingLevel.* styles for section titles. Word renders every
// heading-styled paragraph with a clickable outline/collapse triangle in the
// left margin during editing -- this is normal Word behavior for heading
// styles, not a bug, but it looks wrong in a print-style IEEE draft. Using
// plain bold paragraphs (no outline level) avoids it entirely.
function h1(text) {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "0B0B0B", space: 2 } },
    children: [new TextRun({ text, bold: true, size: 21 })],
  });
}
function h2(text) {
  return new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text, bold: true, italics: true, size: 19 })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text, size: 20, ...opts })] });
}
function pRuns(runs, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED, ...opts, children: runs });
}
function flag(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: "[AUTHOR TO CONFIRM: " + text + "]", size: 20, italics: true, color: "C00000" })],
  });
}
function eq(text, num) {
  // Approximated inline "equation" formatting (centered, serif-ish, unicode math glyphs).
  // Recommend authors convert these to native Word/MathType equations before final submission.
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 100 },
    children: [
      new TextRun({ text, italics: true, size: 20, font: "Cambria Math" }),
      ...(num ? [new TextRun({ text: `    (${num})`, size: 20, italics: false })] : []),
    ],
  });
}
function caption(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 200 }, children: [new TextRun({ text, italics: true, size: 18 })] });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 1000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: "D9D9D9" } : undefined,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: !!opts.header, size: 16 })] })],
  });
}
function noBorderCell(children, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children,
  });
}

// full-bleed figure paragraph, used inside single-column sections
function figureFull(path, widthPx, heightPx, maxWidthEMU = 9500000) {
  const ratio = heightPx / widthPx;
  const wEMU = maxWidthEMU;
  const hEMU = Math.round(maxWidthEMU * ratio);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120 },
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path), transformation: { width: wEMU / 9525, height: hEMU / 9525 } })],
  });
}

function twoColSection(children) {
  return {
    properties: {
      type: SectionType.CONTINUOUS,
      page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 1440, bottom: 1440, left: MARGIN, right: MARGIN } },
      column: { count: 2, space: 360 },
    },
    children,
  };
}
function oneColSection(children) {
  return {
    properties: {
      type: SectionType.CONTINUOUS,
      page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 1440, bottom: 1440, left: MARGIN, right: MARGIN } },
      column: { count: 1 },
    },
    children,
  };
}

// ================= Cluster profile numbers (for text references only -- table itself is now an image) =================
const clusterRows = [
  ["0", "Low-Density Residential", "71.59", "0.02", "247.16", "1940.45", "348.67"],
  ["1", "Open Land / Water", "2.00", "0.00", "10.43", "17.00", "6.56"],
  ["2", "Urban Core / High-Intensity", "962.26", "0.32", "343.92", "5317.01", "482.23"],
  ["3", "Medium-Density Residential", "403.81", "0.08", "179.76", "2115.31", "231.87"],
  ["4", "Sparse Peri-Urban", "30.99", "0.01", "107.07", "381.57", "83.41"],
  ["5", "Compact Urban Fabric", "315.02", "0.12", "416.92", "6674.99", "735.70"],
];

// ================= Title / Authors / Abstract (UNCHANGED from prior draft) =================
const title = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({
    text: "Machine Learning-Based Urban Morphological Signature Mapping Using Open Building Footprints and UMAP Clustering: A Grid-Based Assessment of Bhopal City, India",
    bold: true, size: 48, // 24pt, matching the reference paper's title size (was 15pt -- too small)
  })],
});
function authorBlock(name, dept, email, orcid) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({ text: name, size: 20 }),
      new TextRun({ text: dept, size: 18, break: 1 }),
      new TextRun({ text: email, size: 18, break: 1 }),
      new TextRun({ text: orcid, size: 18, break: 1 }),
    ],
  });
}
const deptLine = "Department of Geography, Faculty of Earth Science, Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh, India";
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };
const authors = new Table({
  width: { size: 9600, type: WidthType.DXA },
  borders: noBorders,
  rows: [
    new TableRow({
      children: [
        noBorderCell([authorBlock("Mukul Maravi*", deptLine, "research.mukul.maravi@igntu.ac.in", "https://orcid.org/0009-0004-4960-9666")], 3200),
        noBorderCell([authorBlock("Dr. Janki Prasad", deptLine, "janki.prasad@igntu.ac.in", "https://orcid.org/0009-0003-8682-4405")], 3200),
        noBorderCell([authorBlock("Bikash Das (IEEE Member)", deptLine, "ressch.bikash.das@igntu.ac.in", "https://orcid.org/0009-0004-8767-7643")], 3200),
      ],
    }),
  ],
});

const abstractHeading = new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ text: "Abstract", bold: true, italics: true, size: 20 })] });
const abstractText = "Rapid and often unplanned urban expansion in developing-country cities has outpaced the capacity of conventional planning tools to monitor heterogeneous built-form change, motivating data-driven approaches that classify settlement patterns directly from building-level geometry [1]. In India, the urban population is projected to rise from 31.8% (2011) to 38.2% by 2036, with urban growth accounting for nearly three-fourths of total national population increase [10], intensifying pressure on peripheral and municipal land in Tier-II cities that remain understudied relative to major metros. Bhopal, the capital of Madhya Pradesh, exemplifies this transition, combining a dense historic core with rapidly expanding peri-urban fringes, yet lacks a quantitative, grid-based characterization of its morphological heterogeneity. This study develops a machine learning framework integrating Open Building Footprints (143,864 structures) and World Settlement Footprint data within a 1 km x 1 km analytical grid (495 cells; ~411 km2 municipal extent, UTM Zone 43N). Five morphological indicators were computed per cell, standardized, projected via UMAP, and partitioned using K-Means into six urban morphological signatures. Cluster validity was independently assessed using silhouette and Davies-Bouldin indices in both the UMAP embedding and the original indicator space, and spatial coherence was verified with global and local Moran's I under an explicitly defined contiguity structure. The Urban Core cluster (962.3 buildings/grid; density 0.32) overlapped 62.5% with the statistically significant Local Moran's I High-High cluster, corroborating a genuine, non-random concentric urban structure. The framework offers a replicable, transparently validated, low-cost method for morphology-based urban monitoring in data-scarce Indian cities.";
const keywordsPara = pRuns([
  new TextRun({ text: "Keywords—", bold: true, italics: true, size: 20 }),
  new TextRun({ text: "Urban Morphology; Open Building Footprints; UMAP; K-Means Clustering; Local Moran's I; Spatial Autocorrelation; Cluster Validation; Urban Morphological Index; Bhopal; GIS", italics: true, size: 20 }),
]);

// ================= References (12 total: original 8 + 4 new) =================
const refs = [
  "W. C. Jochem, D. R. Leasure, O. Pannell, H. R. Chamberlain, P. Jones, and A. J. Tatem, \"Classifying settlement types from multi-scale spatial patterns of building footprints,\" Environ. Plan. B: Urban Anal. City Sci., vol. 48, no. 5, pp. 1161-1179, 2021, doi: 10.1177/2399808320921208.",
  "L. McInnes, J. Healy, and J. Melville, \"UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction,\" arXiv:1802.03426, 2018, doi: 10.48550/arXiv.1802.03426.",
  "L. Anselin, \"Local Indicators of Spatial Association-LISA,\" Geogr. Anal., vol. 27, no. 2, pp. 93-115, 1995, doi: 10.1111/j.1538-4632.1995.tb00338.x.",
  "M. Marconcini et al., \"Outlining where humans live: the World Settlement Footprint 2015,\" Sci. Data, vol. 7, art. 242, 2020, doi: 10.1038/s41597-020-00580-5.",
  "J. MacQueen, \"Some methods for classification and analysis of multivariate observations,\" in Proc. 5th Berkeley Symp. Math. Stat. Probab., vol. 1, pp. 281-297, 1967. (No DOI -- pre-DOI-era conference proceedings.)",
  "S. Ghosh, \"A city growth and land-use/land-cover change: a case study of Bhopal, India,\" Model. Earth Syst. Environ., 2019. [AUTHOR TO CONFIRM volume/issue/page/DOI before submission]",
  "P. J. Rousseeuw, \"Silhouettes: A graphical aid to the interpretation and validation of cluster analysis,\" J. Comput. Appl. Math., vol. 20, pp. 53-65, 1987, doi: 10.1016/0377-0427(87)90125-7.",
  "D. L. Davies and D. W. Bouldin, \"A Cluster Separation Measure,\" IEEE Trans. Pattern Anal. Mach. Intell., vol. PAMI-1, no. 2, pp. 224-227, 1979, doi: 10.1109/TPAMI.1979.4766909.",
  "W. Sirko et al., \"Continental-Scale Building Detection from High Resolution Satellite Imagery,\" arXiv:2107.12283, 2021, doi: 10.48550/arXiv.2107.12283.",
  "National Commission on Population, Ministry of Health and Family Welfare, Government of India, \"Population Projections for India and States 2011-2036,\" Report of the Technical Group on Population Projections, 2020. (No DOI -- government report.)",
  "A. Getis and J. K. Ord, \"The Analysis of Spatial Association by Use of Distance Statistics,\" Geogr. Anal., vol. 24, no. 3, pp. 189-206, 1992, doi: 10.1111/j.1538-4632.1992.tb00261.x.",
  "P. A. P. Moran, \"Notes on Continuous Stochastic Phenomena,\" Biometrika, vol. 37, no. 1/2, pp. 17-23, 1950, doi: 10.1093/biomet/37.1-2.17.",
];
const refParas = refs.map((r, i) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 200, hanging: 200 },
  children: [new TextRun({ text: `[${i + 1}] ${r}`, size: 18 })],
}));

// ================= Body sections (two-column) =================
const introChildren = [
  title, authors, new Paragraph({ text: "" }), abstractHeading, p(abstractText), keywordsPara,

  h1("I. Introduction"),
  p("Rapid and often unplanned urban expansion in developing-country cities has outpaced the capacity of conventional planning instruments to monitor heterogeneous built-form change. Where land-use/land-cover (LULC) classification captures coarse functional categories, it does not, by itself, quantify the physical morphology of the built environment -- building density, footprint size, and their spatial variability -- that governs infrastructure loading, hazard exposure, and service delivery at the neighbourhood scale. This has motivated a shift toward data-driven approaches that classify settlement patterns directly from building-level geometry rather than from spectral land-cover classes alone [1]."),
  p("In India, the urban population is projected to rise from 31.8% in 2011 to 38.2% by 2036, with urban areas absorbing nearly three-fourths of the country's total population increase over this period [10]. This growth is concentrated disproportionately in peripheral and municipal land around Tier-II and Tier-III cities, which remain comparatively understudied relative to the country's major metropolitan regions. Bhopal, the capital of Madhya Pradesh, is representative of this transition: prior land-use/land-cover studies document substantial areal and morphological change in the city over recent decades [6], yet a quantitative, grid-based characterization of its internal morphological heterogeneity -- as distinct from a functional LULC classification -- has not been established."),
  p("This study addresses that gap with a machine-learning framework that (i) computes a set of building-level morphological indicators for Bhopal within a regular 1 km analytical grid using Open Building Footprints (OBF) and World Settlement Footprint (WSF) data, with every derived field-level formula traced directly against the project's own attribute tables rather than assumed; (ii) reduces and clusters this indicator space using UMAP and K-Means to derive interpretable urban morphological signatures; (iii) subjects the resulting clusters to independent statistical validation -- internal cluster-validity indices computed in more than one feature space, and spatial autocorrelation testing via global and local Moran's I with an explicit spatial-weights definition; and (iv) reports both the favourable and unfavourable outcomes of that validation transparently, including where the chosen cluster solution is not the statistically optimal one and where a source formula could not be independently confirmed."),

  h1("II. Study Area"),
  p("Bhopal, the capital of the central Indian state of Madhya Pradesh, is administered by the Bhopal Municipal Corporation and is characterized by a dense historic core interspersed with several large natural and artificial lakes, surrounded by rapidly expanding peri-urban development. A regular 1 km x 1 km analytical grid was constructed over the Bhopal Municipal Corporation boundary in the WGS 1984 UTM Zone 43N projected coordinate system (Fig. 1), yielding 495 grid cells covering approximately 411.0 km2. Of these, 423 cells (85.5%) contained sufficient building-footprint coverage for full indicator computation; the remaining 72 cells lie at the municipal boundary margin and are predominantly open land or water."),
];

const methodsChildren = [
  h1("III. Materials and Methods"),
  h2("A. Data Sources"),
  p("Building geometry was drawn from an Open Building Footprints (OBF) dataset comprising 143,864 structures within the study grid, of the general type described for continental-scale building detection from satellite imagery [9]."),
  flag("exact OBF data provider (e.g., Google Open Buildings / Microsoft Building Footprints), release version, imagery vintage/year, and access date -- required for the Data Availability statement"),
  p("The World Settlement Footprint (WSF) 2015 product [4] was used as a complementary settlement-extent mask. Both datasets were integrated with the 1 km analytical grid in QGIS 3.44 (Fig. 1)."),

  h2("B. Field-Level Definitions and Verified Formulas"),
  p("To keep every reported statistic traceable to the project's own attribute tables, each per-cell field used in this study is defined below and, where the underlying processing expression was not directly available, independently reverse-derived and numerically verified against the stored shapefile values rather than assumed."),
  p("1) Grid cell area: for a complete (non-boundary) cell,"),
  mathEq([SUB("A", "grid"), T(" = 1 km × 1 km = 1,000,000 "), SUP([T("m")], "2")], "1"),
  p("Boundary cells clipped by the municipal limit have smaller areas (field area_km2 ranges 0.001-0.999 km² in the grid attribute table)."),
  p("2) Building count per cell:"),
  mathEq([SUB("BC", "i"), T(" = "), SUB("N", "i")], "2"),
  p("where N_i is the number of OBF polygons within cell i; this is one of the five UMAP input variables."),
  p("3) Total and mean building footprint area:"),
  mathEq([SUB("BA", "i"), T(" = "), SUMSUB("j", [SUB("A", "ij")])], "3"),
  mathEq([SUB("Ā", "i"), T(" = "), FRAC([SUB("BA", "i")], [SUB("N", "i")])], "4"),
  p("where A_ij is the footprint area of building j in cell i (field area_m2_su holds the aggregated sum)."),
  p("4) Maximum footprint area:"),
  mathEq([SUBc([T("A"), T("max")], "i"), T(" = max("), SUB("A", "i1"), T(", "), SUB("A", "i2"), T(", …, "), SUB("A", "iN"), T(")")], "5"),
  p("5) Standard deviation of footprint area within a cell:"),
  mathEq([SUB("SD", "i"), T(" = "), RAD([FRAC([SUMSUB("j", [SUP([T("("), SUB("A", "ij"), T(" − "), SUB("Ā", "i"), T(")")], "2")])], [T("("), SUB("N", "i"), T(" − 1)")])])], "6"),
  p("6) Built-up density, the ratio of summed footprint area to cell area (×100 for percent):"),
  mathEq([SUB("D", "i"), T(" = "), FRAC([SUB("BA", "i")], [SUBc([T("A"), T("grid")], "i")])], "7"),
  p("7) OBF percentage and its normalized form. OBF% is read directly from the grid attribute field obf_pct; obf_n was verified, across all 495 grid cells, to be a max-normalization of obf_pct rather than a simple percent-to-fraction conversion (max abs. residual 0.0005 against max-normalization vs. 0.47 against the percent/100 form, ruling the latter out):"),
  mathEq([SUBc([T("OBF%")], "i"), T(" = "), FRAC([SUBc([T("A"), T("OBF")], "i")], [SUBc([T("A"), T("grid")], "i")]), T(" × 100")], "8"),
  mathEq([SUBc([T("OBF")], "n,i"), T(" = "), FRAC([SUBc([T("OBF%")], "i")], [T("max(OBF%)")])], "9"),
  p("with max(OBF%) = 53.151 (the dataset maximum, at grid cell id 671)."),
  p("8) Building-count normalization (bld_n), likewise verified as a max-normalization of the raw building count (fid_count) across all 423 populated cells (max abs. residual 0.0005):"),
  mathEq([SUBc([T("bld")], "n,i"), T(" = "), FRAC([SUBc([T("fid_count")], "i")], [T("max(fid_count)")]), T(" ,   max(fid_count) = 1771")], "10"),
  p("9) WSF normalization (wsf_n), verified as a max-normalization of the mean WSF settlement-likelihood value (DN_mean) per cell across all 495 cells (max abs. residual 0.0005):"),
  mathEq([SUBc([T("WSF")], "n,i"), T(" = "), FRAC([SUBc([T("DN_mean")], "i")], [T("max(DN_mean)")]), T(" ,   max(DN_mean) = 248.625")], "11"),
  p("The corresponding QGIS Field Calculator expressions, as recalled by the authors, are \"obf_pct\" / maximum(\"obf_pct\"), \"fid_count\" / maximum(\"fid_count\"), and \"DN_mean\" / maximum(\"DN_mean\") respectively -- consistent with the independently verified mathematical form above."),
  p("10) Urban Morphological Index (UMI): verified against every one of the 423 valid grid cells in the delivered attribute table (e.g., cell id 247: obf_n=0.009, bld_n=0.009, wsf_n=0.988 → UMI=0.335 exactly as stored),"),
  mathEq([SUB("UMI", "i"), T(" = "), FRAC([SUBc([T("OBF")], "n,i"), T(" + "), SUBc([T("bld")], "n,i"), T(" + "), SUBc([T("WSF")], "n,i")], [T("3")])], "12"),
  p("11) Weighted UMI (UMI_w): unlike UMI, this field is not a simple mean. We recovered its weighting by ordinary least-squares regression of UMI_w on (OBF_n, bld_n, WSF_n) with no intercept across all 423 valid cells, obtaining weights of 0.400, 0.400, and 0.200 respectively, with a maximum absolute residual of 0.00046 across every cell (consistent with field rounding rather than model error):"),
  mathEq([SUBc([T("UMI")], "w,i"), T(" = 0.4·"), SUBc([T("OBF")], "n,i"), T(" + 0.4·"), SUBc([T("bld")], "n,i"), T(" + 0.2·"), SUBc([T("WSF")], "n,i")], "13"),
  flag("Eq. (13) is an empirically recovered fit (n=423, max abs. residual 0.00046), not a value confirmed from the original processing script -- state this explicitly in the paper and, if possible, confirm against the source QGIS model before submission"),

  h2("C. Standardization and Dimensionality Reduction"),
  p("The five morphology indicators (building count, density, mean/maximum/standard-deviation of footprint area) were z-score standardized across all grid cells,"),
  mathEq([SUB("Z", "ij"), T(" = "), FRAC([T("("), SUB("X", "ij"), T(" − "), SUB("μ", "j"), T(")")], [SUB("σ", "j")])], "14"),
  p("and projected into a two-dimensional embedding using UMAP [2], which preserves local neighbourhood structure, with hyperparameters n_neighbors=15, min_dist=0.10, n_components=2, metric=Euclidean, and random_state=42:"),
  mathEq([T("X (n×5) → Z (n×5) → Y (n×2)")], "15"),

  h2("D. K-Means Clustering"),
  p("K-Means [5] with k=6 was applied to the UMAP embedding Y, minimizing the within-cluster sum of squares,"),
  mathEq([T("min "), SUMSUBSUP("k=1", "K", [SUMSUB("xᵢ∈Cₖ", [SUP([T("‖"), SUB("x", "i"), T(" − "), SUB("μ", "k"), T("‖")], "2")])]), T(" ,  K = 6")], "16"),

  h2("E. Cluster Validity Assessment"),
  p("The silhouette coefficient [7] and Davies-Bouldin index [8] were computed for the k=6 solution in two independent feature spaces -- the 2D UMAP embedding (n=495) and the original standardized five-indicator space (n=422 complete, non-singleton cells) -- to test whether cluster separation reflects genuine structure or is partly an artifact of the UMAP projection. A k-scan from k=2 to k=10 additionally refit K-Means on the same UMAP embedding at each k, recording the silhouette score."),

  h2("F. Spatial Autocorrelation Validation"),
  p("Two distinct Moran's I analyses are reported and are kept explicitly separate because they were not built with the same spatial-weights definition. First, a Local Moran's I (LISA) map was produced in the original GIS workflow (Fig. 3) using k-nearest-neighbor weights (k=5) and a 999-permutation significance test, classifying each cell into High-High, Low-High, Low-Low, or High-Low quadrants at p<0.05."),
  p("Second, and separately, as an independent validation check for this study, we computed a global Moran's I on the composite UMI surface using an explicitly defined rook (4-neighbor edge) contiguity matrix built directly from the regular grid's row and column indices, row-standardized, with significance likewise assessed via a 999-permutation test. Because the two analyses use different neighbourhood definitions (k=5 nearest-neighbor for the original LISA map vs. rook contiguity for this validation check), their results are complementary evidence rather than a single computation reported twice. The general form of Moran's I is [12], and of the local statistic [3], [11]:"),
  mathEq([
    T("I = "), FRAC([T("n")], [T("W")]), T(" · "),
    FRAC(
      [SUMSUB("i", [SUMSUB("j", [SUB("w", "ij"), T("("), SUB("x", "i"), T(" − x̄)("), SUB("x", "j"), T(" − x̄)")])])],
      [SUMSUB("i", [SUP([T("("), SUB("x", "i"), T(" − x̄)")], "2")])]
    ),
    T(" ,  W = "), SUMSUB("i", [SUMSUB("j", [SUB("w", "ij")])]),
  ], "17"),
  mathEq([
    SUB("I", "i"), T(" = "), SUB("z", "i"), T(" "), SUMSUB("j", [SUB("w", "ij"), T(" "), SUB("z", "j")]),
    T(" ,  "), SUB("z", "i"), T(" = "), FRAC([T("("), SUB("x", "i"), T(" − x̄)")], [T("s")]),
  ], "18"),
];

// ================= Full-width figure section 1 (data integration map) =================
const fig1Section = [
  figureFull(`${FIG}/fig1_data_integration_map.png`, 2000, 1259, 9500000),
  caption("Fig. 1. (a) 1 km analytical grid, (b) World Settlement Footprint (WSF) mask, and (c) Open Building Footprints (OBF), all clipped to the Bhopal Municipal Corporation boundary (UTM Zone 43N)."),
];

// ================= Results (two-column) =================
const resultsChildren = [
  h1("IV. Results and Discussion"),
  h2("A. Urban Morphological Cluster Profiles"),
  p("The K-Means solution delineated six morphological signatures (Fig. 2, Fig. 4): Open Land/Water (Cluster 1, n=73), Sparse Peri-Urban Development (Cluster 4, n=85), Low-Density Residential (Cluster 0, n=70), Medium-Density Residential (Cluster 3, n=62), Compact Urban Fabric (Cluster 5, n=133), and Urban Core/High-Intensity Built-Up (Cluster 2, n=72). Cluster 2 recorded the highest mean building count (962.26 per grid cell) and density (0.32), consistent with a central business district / high-intensity core. Cluster 5 recorded the largest mean (416.92 m²), maximum (6674.99 m²), and most variable (735.70 m² standard deviation) footprint sizes, consistent with large institutional, commercial, or mixed-use structures (Fig. 4)."),
];


const resultsChildren2 = [
  h2("B. Cluster Validity"),
  p("In the UMAP embedding, the k=6 solution achieved an overall silhouette score of 0.567 (Davies-Bouldin = 0.554), indicating reasonable but uneven separation: Cluster 1 (Open Land/Water) was extremely well separated (mean silhouette 0.983), while Cluster 5 (Compact Urban Fabric, the largest cluster) was the weakest-defined (mean silhouette 0.308) (Fig. 5a)."),
  p("When the same k=6 labels were evaluated in the original standardized five-indicator space (n=422 complete cells), the overall silhouette score fell to 0.229 (Davies-Bouldin = 1.090) -- markedly lower than in the UMAP embedding, consistent with the known tendency of UMAP to emphasize local neighbourhood structure over global distance preservation, which can numerically inflate apparent cluster separation. We report this openly as a limitation rather than presenting only the more favourable UMAP-space figure."),
  p("The k-scan (Fig. 5b) further shows that k=6 is not the silhouette-maximizing solution: k=9 (0.598) and k=10 (0.592) both exceed k=6 (0.567), while k=2 scores highest (0.844) but corresponds to a coarse urban/non-urban split of limited interpretive value. Accordingly, k=6 is justified on typological interpretability and correspondence with established urban morphology classes, not on statistical optimality -- a distinction stated explicitly rather than left implicit."),

  h2("C. Spatial Structure of the Morphological Signatures"),
  p("Global Moran's I on the UMI surface, independently computed for this validation with rook contiguity, was 0.4324 (Z=12.05, permutation-test p=0.001, n=999 permutations) (Fig. 5c) -- strong, highly significant positive spatial autocorrelation confirming that high- and low-intensity cells form contiguous spatial clusters rather than a random arrangement, the necessary precondition for interpreting the local LISA pattern in Fig. 3."),
  p("The original LISA analysis identified, among 423 tested cells, 71 cells forming a significant (p<0.05) High-High cluster (mean UMI=0.462) concentrated in the historic urban core, and 58 cells forming a significant Low-Low cluster (mean UMI=0.208) at the periphery, with 4 Low-High outliers (Fig. 3). Of 133 nominally significant cells, 61 remained significant after FDR correction, indicating the central High-High core is statistically robust while some peripheral significance reflects multiple testing."),
  p("As independent corroboration linking the two analyses, 45 of the 72 grid cells assigned to the K-Means Urban Core cluster (62.5%) also fell within the significant LISA High-High cluster. This spatial correspondence between an attribute-space clustering (UMAP/K-Means) and a geography-based clustering (LISA), from entirely different statistical procedures, supports the interpretation that the Urban Core signature reflects genuine, non-random concentration of built form."),

  h2("D. Limitations"),
  p("This analysis is cross-sectional and does not capture temporal morphological change. The 1 km grid risks an ecological-fallacy effect in which within-cell heterogeneity is averaged out. The k=6 solution was justified on interpretability rather than statistical optimality (Section IV-B). The UMI_w weighting (Eq. 13) remains an empirically recovered fit rather than a value confirmed from the original processing script, and the precise OBF data provenance (source, version, imagery vintage, access date; Section III-A) is still unconfirmed and required for the Data Availability statement. Cluster labels have not yet been validated against independent ground-truth imagery or socioeconomic data."),

  h1("V. Conclusion"),
  p("This study developed and independently validated a machine-learning framework for grid-based urban morphological signature mapping in Bhopal, India, using Open Building Footprints and World Settlement Footprint data, with every derived field-level formula traced against the project's own attribute tables. Six morphological signatures were derived via UMAP and K-Means, and their validity was assessed using cluster-internal indices in two feature spaces and spatial-autocorrelation testing via global and local Moran's I under an explicit contiguity definition. We report both favourable results (global Moran's I=0.43, p=0.001; 62.5% spatial overlap between the Urban Core cluster and the LISA High-High hotspot) and unfavourable ones (weaker raw-space silhouette; k=6 not silhouette-optimal) transparently. This validated-and-caveated approach offers a replicable, low-cost method for morphology-based urban monitoring applicable to other data-scarce Indian cities, provided the confirmations flagged in Section IV-D are resolved in subsequent work."),

  h1("Acknowledgment"),
  p("The authors would like to thank the Commissioner of the Bhopal Municipal Corporation (BMC) and the Planning and Development Department of the concerned Madhya Pradesh urban development authority for providing the study area datasets, and also thank the GIS Lab of the Department of Geography, Faculty of Earth Science, IGNTU, India. The authors also thank the USGS and the Survey of India (SOI) for their freely available satellite images and datasets. The authors would also like to express sincere gratitude to the entire editorial board and reviewers for their insightful comments and suggestions, which have significantly improved the manuscript."),
  flag("confirm the exact Bhopal-side institution names/titles above (e.g., the specific MP urban development authority you actually obtained data from) before submission"),

];

const referencesSection = [
  h1("References"),
  ...refParas,
];

// ================= All figures batched on one dedicated page =================
// Matches the senior co-author paper's convention: figures grouped together
// near the end of the body text rather than interspersed inline.
const allFiguresSection = [
  figureFull(`${FIG}/fig1_data_integration_map.png`, 2000, 1259, 6200000),
  caption("Fig. 1. (a) 1 km analytical grid, (b) World Settlement Footprint (WSF) mask, and (c) Open Building Footprints (OBF), all clipped to the Bhopal Municipal Corporation boundary (UTM Zone 43N)."),
  figureFull(`${FIG}/fig2_umap_projection.png`, 1402, 685, 6200000),
  caption("Fig. 2. UMAP projection of the six urban morphological signature clusters."),
  figureFull(`${FIG}/fig3_local_morans_i_map.png`, 2000, 1414, 6200000),
  caption("Fig. 3. Local Moran's I (LISA) cluster map of the Urban Morphological Index (spatial-weights definition per Section III-F)."),
  figureFull(`${FIG}/dashboard1_cluster_profile.png`, 2174, 1280, 6200000),
  caption("Fig. 4. Cluster profile dashboard: (a) mean building count, (b) mean built-up density, (c) grid cells per cluster, (d) mean footprint area, (e) maximum footprint area, (f) standard deviation of footprint area, by cluster."),
  figureFull(`${FIG}/dashboard2_validation.png`, 2374, 872, 6200000),
  caption("Fig. 5. Validation dashboard: (a) silhouette score by cluster in UMAP space, (b) silhouette score across k=2..10, (c) global Moran's I permutation test (observed vs. null distribution)."),
];

// ================= Assemble document =================
// Body text runs continuously in two columns (Intro through Acknowledgment),
// then all five figures are batched together on their own single-column
// page, then References resume in two columns -- matching the senior
// co-author paper's figure-batching convention.
const finalDoc = new Document({
  // IEEE papers (and the reference senior-author paper) use Times New Roman
  // throughout -- without this, Word falls back to its default theme font
  // (Calibri/Aptos), which is what made the title/body look mismatched.
  styles: { default: { document: { run: { font: "Times New Roman" } } } },
  sections: [
    twoColSection([
      ...introChildren,
      ...methodsChildren,
      ...resultsChildren,
      ...resultsChildren2,
    ]),
    oneColSection(allFiguresSection),
    twoColSection(referencesSection),
  ],
});

Packer.toBuffer(finalDoc).then((buf) => {
  fs.writeFileSync("/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Bhopal_Urban_Morphology_FullPaper_DRAFT.docx", buf);
  console.log("Wrote docx v2");
});
