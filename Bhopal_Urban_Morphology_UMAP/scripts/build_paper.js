const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, Header, Footer, PageNumber, SectionType, LevelFormat,
} = require("docx");

const FIG_DIR = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/figures";

function sec(title, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: title, bold: true, size: 20 })] });
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
function caption(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 200 }, children: [new TextRun({ text, italics: true, size: 18 })] });
}
function figure(path, widthPx, heightPx, maxWidthEMU = 5486400) {
  // scale to fit column width (~4.3in at 96dpi ~ 5486400 EMU keeps aspect)
  const ratio = heightPx / widthPx;
  const wEMU = maxWidthEMU;
  const hEMU = Math.round(maxWidthEMU * ratio);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160 },
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path), transformation: { width: wEMU / 9525, height: hEMU / 9525 } })],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 1000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: "D9D9D9" } : undefined,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: !!opts.header, size: 16 })] })],
  });
}

// ---------- Cluster profile table ----------
const clusterHeaders = ["Cl.", "Signature", "Mean n", "Density", "Mean A (m2)", "Max A (m2)", "SD A (m2)"];
const clusterRows = [
  ["0", "Low-Density Residential", "71.59", "0.02", "247.16", "1940.45", "348.67"],
  ["1", "Open Land / Water", "2.00", "0.00", "10.43", "17.00", "6.56"],
  ["2", "Urban Core / High-Intensity", "962.26", "0.32", "343.92", "5317.01", "482.23"],
  ["3", "Medium-Density Residential", "403.81", "0.08", "179.76", "2115.31", "231.87"],
  ["4", "Sparse Peri-Urban", "30.99", "0.01", "107.07", "381.57", "83.41"],
  ["5", "Compact Urban Fabric", "315.02", "0.12", "416.92", "6674.99", "735.70"],
];
const colWidths = [500, 2200, 900, 800, 1100, 1100, 1000];
const clusterTable = new Table({
  width: { size: 7600, type: WidthType.DXA },
  columnWidths: colWidths,
  rows: [
    new TableRow({ children: clusterHeaders.map((h, i) => cell(h, { header: true, width: colWidths[i] })) }),
    ...clusterRows.map((r) => new TableRow({ children: r.map((v, i) => cell(v, { width: colWidths[i] })) })),
  ],
});

// ---------- Silhouette / k-scan table ----------
const kScan = [
  ["2", "0.844", "7215.72"], ["3", "0.588", "2614.51"], ["4", "0.552", "1497.84"],
  ["5", "0.510", "1100.15"], ["6*", "0.567", "757.23"], ["7", "0.578", "558.82"],
  ["8", "0.580", "444.66"], ["9", "0.598", "359.99"], ["10", "0.592", "312.87"],
];
const kColWidths = [1200, 2200, 2200];
const kScanTable = new Table({
  width: { size: 5600, type: WidthType.DXA },
  columnWidths: kColWidths,
  rows: [
    new TableRow({ children: ["k", "Silhouette (UMAP space)", "K-Means inertia"].map((h, i) => cell(h, { header: true, width: kColWidths[i] })) }),
    ...kScan.map((r) => new TableRow({ children: r.map((v, i) => cell(v, { width: kColWidths[i] })) })),
  ],
});

// ---------- Title block ----------
const title = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({
    text: "Machine Learning-Based Urban Morphological Signature Mapping Using Open Building Footprints and UMAP Clustering: A Grid-Based Assessment of Bhopal City, India",
    bold: true, size: 30,
  })],
});

function authorBlock(name, dept, email, orcid) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({ text: name, size: 20, break: 0 }),
      new TextRun({ text: dept, size: 18, break: 1 }),
      new TextRun({ text: email, size: 18, break: 1 }),
      new TextRun({ text: orcid, size: 18, break: 1 }),
    ],
  });
}

const deptLine = "Department of Geography, Faculty of Earth Science, Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh, India";

const authors = new Table({
  width: { size: 9600, type: WidthType.DXA },
  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
  rows: [
    new TableRow({
      children: [
        new TableCell({ width: { size: 3200, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, children: [authorBlock("Mukul Maravi*", deptLine, "research.mukul.maravi@igntu.ac.in", "https://orcid.org/0009-0004-4960-9666")] }),
        new TableCell({ width: { size: 3200, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, children: [authorBlock("Dr. Janki Prasad", deptLine, "janki.prasad@igntu.ac.in", "https://orcid.org/0009-0003-8682-4405")] }),
        new TableCell({ width: { size: 3200, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, children: [authorBlock("Bikash Das (IEEE Member)", deptLine, "ressch.bikash.das@igntu.ac.in", "https://orcid.org/0009-0004-8767-7643")] }),
      ],
    }),
  ],
});

const abstractHeading = new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ text: "Abstract", bold: true, italics: true, size: 20 })] });

const abstractText = "Rapid and often unplanned urban expansion in developing-country cities has outpaced the capacity of conventional planning tools to monitor heterogeneous built-form change, motivating data-driven approaches that classify settlement patterns directly from building-level geometry [1]. In India, the urban population is projected to rise from 31.8% (2011) to 38.2% by 2036, with urban growth accounting for nearly three-fourths of total national population increase [7], intensifying pressure on peripheral and municipal land in Tier-II cities that remain understudied relative to major metros. Bhopal, the capital of Madhya Pradesh, exemplifies this transition, combining a dense historic core with rapidly expanding peri-urban fringes, yet lacks a quantitative, grid-based characterization of its morphological heterogeneity. This study develops a machine learning framework integrating Open Building Footprints (143,864 structures) and World Settlement Footprint data within a 1 km x 1 km analytical grid (495 cells; ~411 km2 municipal extent, UTM Zone 43N). Five morphological indicators were computed per cell, standardized, projected via UMAP, and partitioned using K-Means into six urban morphological signatures. Cluster validity was independently assessed using silhouette and Davies-Bouldin indices in both the UMAP embedding and the original indicator space, and spatial coherence was verified with global and local Moran's I. The Urban Core cluster (962.3 buildings/grid; density 0.32) overlapped 62.5% with the statistically significant Local Moran's I High-High cluster, corroborating a genuine, non-random concentric urban structure. The framework offers a replicable, transparently validated, low-cost method for morphology-based urban monitoring in data-scarce Indian cities.";

const keywordsPara = pRuns([
  new TextRun({ text: "Keywords—", bold: true, italics: true, size: 20 }),
  new TextRun({ text: "Urban Morphology; Open Building Footprints; UMAP; K-Means Clustering; Local Moran's I; Spatial Autocorrelation; Cluster Validation; Bhopal; GIS", italics: true, size: 20 }),
]);

// ---------- References ----------
const refs = [
  "W. C. Jochem, D. R. Leasure, O. Pannell, H. R. Chamberlain, P. Jones, and A. J. Tatem, \"Classifying settlement types from multi-scale spatial patterns of building footprints,\" Environ. Plan. B: Urban Anal. City Sci., vol. 48, no. 5, pp. 1161-1179, 2021.",
  "L. McInnes, J. Healy, and J. Melville, \"UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction,\" arXiv:1802.03426, 2018.",
  "L. Anselin, \"Local Indicators of Spatial Association-LISA,\" Geogr. Anal., vol. 27, no. 2, pp. 93-115, 1995.",
  "M. Marconcini et al., \"Outlining where humans live: the World Settlement Footprint 2015,\" Sci. Data, vol. 7, art. 242, 2020.",
  "J. MacQueen, \"Some methods for classification and analysis of multivariate observations,\" in Proc. 5th Berkeley Symp. Math. Stat. Probab., vol. 1, pp. 281-297, 1967.",
  "S. Ghosh, \"A city growth and land-use/land-cover change: a case study of Bhopal, India,\" Model. Earth Syst. Environ., 2019. [AUTHOR TO CONFIRM volume/issue/page/DOI before submission]",
  "National Commission on Population, Ministry of Health and Family Welfare, Government of India, \"Population Projections for India and States 2011-2036,\" Report of the Technical Group on Population Projections, 2020.",
  "P. J. Rousseeuw, \"Silhouettes: A graphical aid to the interpretation and validation of cluster analysis,\" J. Comput. Appl. Math., vol. 20, pp. 53-65, 1987.",
];

const refParas = refs.map((r, i) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 200, hanging: 200 },
  children: [new TextRun({ text: `[${i + 1}] ${r}`, size: 18 })],
}));

// ---------- Build document body ----------
const children = [
  title,
  authors,
  new Paragraph({ text: "" }),
  abstractHeading,
  p(abstractText, {}),
  keywordsPara,

  sec("I. Introduction"),
  p("Rapid and often unplanned urban expansion in developing-country cities has outpaced the capacity of conventional planning instruments to monitor heterogeneous built-form change. Where land-use/land-cover (LULC) classification captures coarse functional categories, it does not, by itself, quantify the physical morphology of the built environment -- building density, footprint size, and their spatial variability -- that governs infrastructure loading, hazard exposure, and service delivery at the neighbourhood scale. This has motivated a shift toward data-driven approaches that classify settlement patterns directly from building-level geometry rather than from spectral land-cover classes alone [1]."),
  p("In India, the urban population is projected to rise from 31.8% in 2011 to 38.2% by 2036, with urban areas absorbing nearly three-fourths of the country's total population increase over this period [7]. This growth is concentrated disproportionately in peripheral and municipal land around Tier-II and Tier-III cities, which remain comparatively understudied relative to the country's major metropolitan regions. Bhopal, the capital of Madhya Pradesh, is representative of this transition: prior land-use/land-cover studies document substantial areal and morphological change in the city over recent decades [6], yet a quantitative, grid-based characterization of its internal morphological heterogeneity -- as distinct from a functional LULC classification -- has not been established."),
  p("This study addresses that gap by developing a machine-learning framework that (i) computes a set of building-level morphological indicators for Bhopal within a regular 1 km analytical grid using Open Building Footprints (OBF) and World Settlement Footprint (WSF) data; (ii) reduces and clusters this indicator space using UMAP and K-Means to derive interpretable urban morphological signatures; (iii) subjects the resulting clusters to independent statistical validation -- internal cluster-validity indices computed in more than one feature space, and spatial autocorrelation testing via global and local Moran's I -- rather than reporting cluster labels as self-evidently meaningful; and (iv) reports both the favourable and unfavourable outcomes of that validation transparently, including where the chosen cluster solution is not the statistically optimal one."),

  sec("II. Study Area"),
  p("Bhopal, the capital of the central Indian state of Madhya Pradesh, is administered by the Bhopal Municipal Corporation and is characterized by a dense historic core interspersed with several large natural and artificial lakes, surrounded by rapidly expanding peri-urban development. A regular 1 km x 1 km analytical grid was constructed over the Bhopal Municipal Corporation boundary in the WGS 1984 UTM Zone 43N projected coordinate system (Fig. 1), yielding 495 grid cells covering approximately 411.0 km2. Of these, 423 cells (85.5%) contained sufficient building-footprint coverage for full indicator computation; the remaining 72 cells lie at the municipal boundary margin and are predominantly open land or water."),
  figure(`${FIG_DIR}/fig1_data_integration_map.png`, 2000, 1414),
  caption("Fig. 1. Integration of Open Building Footprints (OBF), World Settlement Footprint (WSF), and the 1 km analytical grid over Bhopal."),

  sec("III. Materials and Methods"),
  sec("A. Data Sources", HeadingLevel.HEADING_2),
  p("Building geometry was drawn from an Open Building Footprints (OBF) dataset comprising 143,864 structures within the study grid."),
  flag("exact OBF data provider (e.g., Google Open Buildings / Microsoft Building Footprints), release version, imagery vintage/year, and access date -- required for the Data Availability statement"),
  p("The World Settlement Footprint (WSF) 2015 product [4] was used as a complementary settlement-extent mask to cross-check the built-up area within each grid cell. Both datasets were integrated with the 1 km analytical grid in QGIS 3.44."),
  sec("B. Morphological Indicators", HeadingLevel.HEADING_2),
  p("Five morphological indicators were computed per grid cell from the aggregated building footprints: (1) building count; (2) built-up density, defined as the ratio of summed footprint area to cell area; (3) mean building footprint area; (4) maximum building footprint area; and (5) the standard deviation of building footprint area within the cell, capturing within-cell heterogeneity in building size."),
  sec("C. Dimensionality Reduction and Clustering", HeadingLevel.HEADING_2),
  p("The five indicators were z-score standardized across all grid cells and projected into a two-dimensional embedding using Uniform Manifold Approximation and Projection (UMAP) [2], which preserves local neighbourhood structure in the reduced space."),
  flag("UMAP hyperparameters used (n_neighbors, min_dist, metric, random_state) -- required for reproducibility"),
  p("K-Means clustering [5] with k=6 was then applied to the UMAP embedding to delineate discrete urban morphological signatures."),
  sec("D. Cluster Validity Assessment", HeadingLevel.HEADING_2),
  p("Because cluster labels are not self-validating, two internal validity indices -- the silhouette coefficient [8] and the Davies-Bouldin index -- were computed for the k=6 solution in two independent feature spaces: (i) the 2D UMAP embedding on which K-Means was run (n=495), and (ii) the original standardized five-indicator space, restricted to the 422 cells with complete indicator values and non-singleton cluster membership, to test whether cluster separation reflects genuine structure in the underlying morphological variables or is partly an artifact of the UMAP projection. A k-scan from k=2 to k=10 was additionally run, refitting K-Means on the same UMAP embedding at each k and recording the silhouette score, to assess where k=6 sits relative to other candidate solutions."),
  sec("E. Spatial Autocorrelation Validation", HeadingLevel.HEADING_2),
  p("A composite Urban Morphological Index (UMI) was computed per grid cell and tested for spatial autocorrelation using a rook (4-neighbor edge) contiguity weights matrix, built directly and exactly from the regular grid's row and column indices and row-standardized. Global Moran's I was computed on the UMI surface, with significance assessed via a 999-permutation test rather than an assumed normal approximation. Local Moran's I (LISA) [3] was then computed per cell, classifying each into High-High, Low-Low, Low-High, or High-Low quadrants, with significance reported at p<0.05 alongside a false-discovery-rate (FDR) corrected threshold."),

  sec("IV. Results and Discussion"),
  sec("A. Urban Morphological Cluster Profiles", HeadingLevel.HEADING_2),
  p("The K-Means solution delineated six morphological signatures (Table I, Fig. 2): Open Land/Water (Cluster 1, n=73), Sparse Peri-Urban Development (Cluster 4, n=85), Low-Density Residential (Cluster 0, n=70), Medium-Density Residential (Cluster 3, n=62), Compact Urban Fabric (Cluster 5, n=133), and Urban Core/High-Intensity Built-Up (Cluster 2, n=72). Cluster 2 recorded the highest mean building count (962.26 per grid cell) and density (0.32), consistent with a central business district / high-intensity core. Cluster 5 recorded the largest mean (416.92 m2), maximum (6674.99 m2), and most variable (735.70 m2 standard deviation) footprint sizes, consistent with large institutional, commercial, or mixed-use structures."),
  clusterTable,
  caption("TABLE I. Cluster Profile Statistics (K-Means, k=6)"),
  figure(`${FIG_DIR}/fig2_umap_projection.png`, 1107, 1600, 3200400),
  caption("Fig. 2. UMAP projection of the six urban morphological signature clusters."),

  sec("B. Cluster Validity", HeadingLevel.HEADING_2),
  p("In the UMAP embedding, the k=6 solution achieved an overall silhouette score of 0.567 (Davies-Bouldin = 0.554), indicating reasonable but uneven separation: Cluster 1 (Open Land/Water) was extremely well separated (mean silhouette 0.983), while Cluster 5 (Compact Urban Fabric, the largest cluster) was the weakest-defined (mean silhouette 0.308), indicating substantial boundary ambiguity for this class."),
  p("When the same k=6 labels were evaluated in the original standardized five-indicator space (n=422 complete cells), the overall silhouette score fell to 0.229 (Davies-Bouldin = 1.090) -- markedly lower than in the UMAP embedding. This discrepancy is consistent with the known tendency of UMAP to emphasize local neighbourhood structure over global distance preservation, which can visually and numerically inflate apparent cluster separation relative to the untransformed feature space. We report this openly as a limitation of the validation rather than presenting only the more favourable UMAP-space figure."),
  p("The k-scan (Table II) further shows that k=6 is not the silhouette-maximizing solution: k=9 (0.598) and k=10 (0.592) both exceed k=6 (0.567), while k=2 scores highest overall (0.844) but corresponds to a coarse urban/non-urban split of limited interpretive value. Accordingly, k=6 is justified in this study on typological interpretability and correspondence with established urban morphology classes, not on the basis of being the statistically optimal partition -- a distinction we consider necessary to state explicitly."),
  kScanTable,
  caption("TABLE II. Silhouette Score by k (K-Means Refit on UMAP Embedding, k=2..10)"),

  sec("C. Spatial Structure of the Morphological Signatures", HeadingLevel.HEADING_2),
  p("Global Moran's I on the UMI surface was 0.4324 (Z = 12.05, permutation-test p = 0.001, n = 999 permutations, rook contiguity), indicating strong, highly significant positive spatial autocorrelation across the city -- i.e., high- and low-intensity grid cells are not randomly distributed but form contiguous spatial clusters. This global result is a necessary precondition for interpreting the local (LISA) pattern."),
  p("Local Moran's I identified, among the 423 tested cells, 71 cells forming a statistically significant (p<0.05) High-High cluster (mean UMI = 0.462) concentrated in the historic urban core, and 58 cells forming a significant Low-Low cluster (mean UMI = 0.208) at the municipal periphery, with 4 Low-High outlier cells (Fig. 3). Of the 133 nominally significant cells (p<0.05), 61 remained significant after FDR correction, indicating that the central High-High core is statistically robust while a portion of the peripheral significance is attributable to multiple testing and should be interpreted with corresponding caution."),
  figure(`${FIG_DIR}/fig3_local_morans_i_map.png`, 2000, 1414),
  caption("Fig. 3. Local Moran's I (LISA) cluster map of the Urban Morphological Index."),
  p("As independent corroboration linking the two analyses, 45 of the 72 grid cells assigned to the K-Means Urban Core cluster (62.5%) also fell within the statistically significant LISA High-High cluster. This spatial correspondence between an attribute-space clustering (UMAP/K-Means) and a geography-based clustering (LISA), obtained through entirely different statistical procedures, supports the interpretation that the Urban Core morphological signature reflects a genuine, non-random concentration of built form rather than a clustering artifact. The remaining 37.5% of Urban Core cells not classified as LISA High-High likely reflects the fact that attribute-space and geographic-contiguity clustering are not expected to coincide completely, even when both are individually valid."),

  sec("D. Limitations", HeadingLevel.HEADING_2),
  p("This analysis is cross-sectional, representing a single time slice, and does not capture the temporal dynamics of morphological change. The 1 km grid resolution, while enabling city-wide coverage, risks an ecological-fallacy effect in which within-cell heterogeneity is averaged out; smaller grid sizes or building-level clustering would refine this in future work. The cluster solution (k=6) was justified on interpretability rather than statistical optimality, as shown directly by the k-scan in Section IV-B, and this framing is offered explicitly rather than left implicit. Cluster labels were assigned by expert interpretation of the indicator profiles and have not yet been validated against independent ground-truth imagery or socioeconomic data; we identify this as a priority for subsequent work. Finally, precise OBF data provenance requires confirmation before publication, as flagged in Section III-A."),

  sec("V. Conclusion"),
  p("This study developed and, critically, independently validated a machine-learning framework for grid-based urban morphological signature mapping in Bhopal, India, using Open Building Footprints and World Settlement Footprint data. Six morphological signatures were derived via UMAP and K-Means, and their validity was assessed using cluster-internal indices in two feature spaces and spatial-autocorrelation testing via global and local Moran's I. The framework's central methodological contribution is not the clustering itself but the transparency of its validation: we report that cluster separation is markedly weaker in the original indicator space than in the UMAP embedding, that k=6 is not the silhouette-optimal solution, and, on the favourable side, that the Urban Core signature is independently corroborated by a statistically significant spatial hotspot (global Moran's I = 0.43, p = 0.001; 62.5% spatial overlap with the LISA High-High cluster). This validated-and-caveated approach offers a replicable, low-cost method for morphology-based urban monitoring applicable to other data-scarce Indian cities, provided the limitations identified in Section IV-D are addressed in subsequent work."),

  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Acknowledgment", bold: true, size: 20 })] }),
  flag("add any funding source, data-provider acknowledgment, or institutional support statement here"),

  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "References", bold: true, size: 20 })] }),
  ...refParas,
];

const doc = new Document({
  sections: [
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1080, right: 1080 } },
        column: { count: 2, space: 360 },
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Bhopal_Urban_Morphology_FullPaper_DRAFT.docx", buf);
  console.log("Wrote docx");
});
