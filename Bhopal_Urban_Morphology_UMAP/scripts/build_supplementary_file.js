const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
} = require("docx");

const TITLE =
  "Machine Learning-Based Urban Morphological Signature Mapping Using Open " +
  "Building Footprints and UMAP Clustering: A Grid-Based Assessment in Bhopal City";

function h(text) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, size: 24 })],
  });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text, size: 22, ...opts })] });
}
function caption(text) {
  return new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text, italics: true, size: 20 })] });
}
function codeLine(text) {
  return new Paragraph({
    spacing: { after: 0, line: 240, lineRule: "auto" },
    children: [new TextRun({ text: text.length ? text : " ", font: "Courier New", size: 18 })],
  });
}
function codeBlock(code) {
  return code.split("\n").map(codeLine);
}

const thinBorder = { style: BorderStyle.SINGLE, size: 2, color: "000000" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder, insideHorizontal: thinBorder, insideVertical: thinBorder };

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 1000, type: WidthType.DXA },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(text), bold: !!opts.bold, size: 18 })] })],
  });
}
function dataTable(headerRow, rows, widths) {
  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    rows: [
      new TableRow({ children: headerRow.map((t, i) => cell(t, { bold: true, width: widths[i] })) }),
      ...rows.map((r) => new TableRow({ children: r.map((t, i) => cell(t, { width: widths[i] })) })),
    ],
  });
}

// ---- S1: Full cluster profile statistics (K-Means, k=6) ----
// Source: Cluster_Profile_Table.csv and UMAP.xlsx (both user-supplied, cross-consistent
// with manuscript Fig. 3) -- n grid cells, mean building count and density from
// UMAP.xlsx; mean/max/SD footprint area from Cluster_Profile_Table.csv.
const clusterNames = {
  0: "Low-Density Residential",
  1: "Open Land / Water",
  2: "Urban Core / High-Intensity Built-Up",
  3: "Medium-Density Residential",
  4: "Sparse Peri-Urban",
  5: "Compact Urban Fabric",
};
const s1Rows = [
  [0, "Low-Density Residential", 70, "71.6", "0.02", "16,073", "247.16", "1940.45", "348.67"],
  [1, "Open Land / Water", 73, "2.0", "0.00", "21", "10.43", "17.00", "6.56"],
  [2, "Urban Core / High-Intensity Built-Up", 72, "962.3", "0.32", "315,919", "343.92", "5317.01", "482.23"],
  [3, "Medium-Density Residential", 62, "403.8", "0.08", "71,118", "179.76", "2115.31", "231.87"],
  [4, "Sparse Peri-Urban", 85, "31.0", "0.01", "3,583", "107.07", "381.57", "83.41"],
  [5, "Compact Urban Fabric", 133, "315.0", "0.12", "114,428", "416.92", "6674.99", "735.70"],
];

// ---- S2: Cluster validity -- silhouette scores ----
const s2aRows = [
  [0, 70, "0.577"], [1, 73, "0.983"], [2, 72, "0.5923"],
  [3, 62, "0.5769"], [4, 85, "0.5779"], [5, 133, "0.3077"],
];
const s2bRows = [
  [2, "0.8436", "7215.72"], [3, "0.5883", "2614.51"], [4, "0.5516", "1497.84"],
  [5, "0.5099", "1100.15"], [6, "0.5669 (used)", "757.23"], [7, "0.5784", "558.82"],
  [8, "0.5803", "444.66"], [9, "0.5979", "359.99"], [10, "0.5923", "312.87"],
];

// ---- S3: Stability analysis ----
const s3aRows = [
  ["Seed stability (10 seeds, n_neighbors=15, min_dist=0.10)", "0.791", "0.691", "0.928"],
  ["UMAP hyperparameter sensitivity (9 combinations)", "0.781", "0.676", "0.936"],
];
const s3bRows = [
  [2, "0.486"], [3, "0.487"], [4, "0.435"], [5, "0.426"], [6, "0.406 (used)"],
  [7, "0.411"], [8, "0.380"], [9, "0.388"], [10, "0.405"],
];

const GEE_OBF = `// ======================================================
// OPEN BUILDINGS V3 - BHOPAL STUDY AREA
// Data source: Google Research Open Buildings v3
// ======================================================

// 1. Study area
var studyArea = ee.FeatureCollection(
  'projects/seraphic-plexus-492407-m0/assets/Reproject'
);

var aoi = studyArea.geometry();

Map.centerObject(studyArea, 10);
Map.addLayer(studyArea, {color: 'red'}, 'Bhopal Study Boundary');

// 2. Load Open Buildings v3
var obf = ee.FeatureCollection(
  'GOOGLE/Research/open-buildings/v3/polygons'
);

// 3. Filter buildings intersecting Bhopal
var obfBhopal = obf.filterBounds(aoi);

// 4. Display building footprints
Map.addLayer(
  obfBhopal,
  {color: 'blue'},
  'Open Buildings v3 - Bhopal'
);

// 5. Print information
print('OBF Feature Collection:', obfBhopal);
print('Total building footprints:', obfBhopal.size());
print('Sample building attributes:', obfBhopal.first());

// 6. Export building polygons to Google Drive
// Note: Intersecting polygons are retained in their
// original geometry, not cut at the municipal boundary.

Export.table.toDrive({
  collection: obfBhopal,
  description: 'Bhopal_Open_Buildings_V3',
  folder: 'Bhopal_UMI_Data',
  fileNamePrefix: 'Bhopal_OBF_V3',
  fileFormat: 'SHP'
});`;

const GEE_WSF = `// ======================================================
// WORLD SETTLEMENT FOOTPRINT 2015 - BHOPAL
// Data source: DLR WSF 2015
// Spatial resolution: 10 metres
// ======================================================

// 1. Study area
var studyArea = ee.FeatureCollection(
  'projects/seraphic-plexus-492407-m0/assets/Reproject'
);

var aoi = studyArea.geometry();

Map.centerObject(studyArea, 10);

Map.addLayer(
  studyArea,
  {color: 'red'},
  'Bhopal Study Boundary'
);

// 2. Load WSF 2015
var wsf = ee.Image('DLR/WSF/WSF2015/v1')
  .select('settlement');

// 3. Convert masked non-settlement pixels to zero
// Settlement pixels retain their original value (255).
var wsfBhopal = wsf
  .unmask(0)
  .clip(aoi);

// 4. Visualization
var wsfVis = {
  min: 0,
  max: 255,
  palette: ['white', 'red']
};

Map.addLayer(
  wsfBhopal,
  wsfVis,
  'WSF 2015 - Bhopal'
);

// 5. Print dataset information
print('WSF 2015 image:', wsf);
print('WSF band information:', wsf.bandNames());
print('WSF Bhopal:', wsfBhopal);

// 6. Export raster to Google Drive
Export.image.toDrive({
  image: wsfBhopal,
  description: 'Bhopal_WSF_2015',
  folder: 'Bhopal_UMI_Data',
  fileNamePrefix: 'Bhopal_WSF_2015',
  region: aoi,
  scale: 10,
  crs: 'EPSG:32643',
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});`;

const PY_UMAP = `import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl

# Load data
df = pd.read_csv(r"D:\\UMAP\\bhopal_umap_clusters.csv")

# Cluster names and colors
cluster_names = {
    0: "Low-Density Residential",
    1: "Open Land / Water",
    2: "Urban Core / High-Intensity Built-Up",
    3: "Medium-Density Residential",
    4: "Sparse Peri-Urban",
    5: "Compact Urban Fabric"
}
cluster_colors = {
    0: "#4DAF4A",  # green
    1: "#A6D854",  # light green
    2: "#377EB8",  # blue
    3: "#F781BF",  # pink
    4: "#FFDB6F",  # orange
    5: "#6A3D9A"   # purple
}

# Plot
plt.figure(figsize=(9, 7), dpi=300)
for cl in sorted(df['Cluster'].unique()):
    subset = df[df['Cluster'] == cl]
    plt.scatter(subset['UMAP1'], subset['UMAP2'],
                s=60, c=cluster_colors[cl], label=cluster_names[cl],
                edgecolor='k', linewidth=0.3, alpha=0.85)

plt.xlabel("UMAP Dimension 1", fontsize=12)
plt.ylabel("UMAP Dimension 2", fontsize=12)
plt.title("UMAP Projection of Urban Morphological Signatures in Bhopal",
          fontsize=14, weight='bold')
plt.legend(title="Urban Morphological Signatures", loc='best',
           frameon=True, fontsize=10, title_fontsize=11)
plt.grid(True, linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig(r"D:\\UMAP\\UMAP_scatter_publication.png",
            dpi=300, bbox_inches='tight')
plt.show()`;

const PY_STABILITY = `# validation/stability_analysis.py
# Clustering stability analysis -- AGERS 2026 revision (reviewer 1 & 2 request)
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score, silhouette_score
import umap

df = pd.read_csv("bhopal_umap_clusters.csv")
indicators = ["fid_count", "density", "area_m2_mean", "area_m2_max", "area_m2_stddev"]
X = df[indicators].fillna(0).values
X_scaled = StandardScaler().fit_transform(X)
original_labels = df["Cluster"].values

# 1. Seed stability: 10 seeds, fixed UMAP hyperparameters
seed_rows = []
for seed in range(10):
    reducer = umap.UMAP(n_neighbors=15, min_dist=0.10, n_components=2,
                         random_state=seed)
    Y = reducer.fit_transform(X_scaled)
    km = KMeans(n_clusters=6, random_state=seed, n_init=10).fit(Y)
    ari = adjusted_rand_score(original_labels, km.labels_)
    sil = silhouette_score(Y, km.labels_)
    seed_rows.append({"seed": seed, "ARI_vs_original": ari, "silhouette_umap": sil})
pd.DataFrame(seed_rows).to_csv("stability_seed_scan.csv", index=False)

# 2. UMAP hyperparameter sensitivity: 9 combinations
hp_rows = []
for n_neighbors in [10, 15, 30]:
    for min_dist in [0.0, 0.1, 0.3]:
        reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist,
                             n_components=2, random_state=42)
        Y = reducer.fit_transform(X_scaled)
        km = KMeans(n_clusters=6, random_state=42, n_init=10).fit(Y)
        ari = adjusted_rand_score(original_labels, km.labels_)
        sil = silhouette_score(Y, km.labels_)
        hp_rows.append({"n_neighbors": n_neighbors, "min_dist": min_dist,
                         "ARI_vs_original": ari, "silhouette_umap": sil})
pd.DataFrame(hp_rows).to_csv("stability_umap_hyperparam_scan.csv", index=False)

# 3. Plain K-Means baseline (no UMAP) on standardized raw indicator space
kscan_rows = []
for k in range(2, 11):
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X_scaled)
    sil = silhouette_score(X_scaled, km.labels_)
    kscan_rows.append({"k": k, "silhouette_raw": sil})
pd.DataFrame(kscan_rows).to_csv("stability_kmeans_raw_kscan.csv", index=False)`;

const PY_MORAN = `# validation/global_morans_i.py
# Global Moran's I on the composite UMI surface, rook (4-neighbor edge)
# contiguity built directly from the regular grid's row/column indices.
import pandas as pd
import numpy as np

df = pd.read_csv("Bhopal_umi-grid.csv")  # row, col, UMI per grid cell
n = len(df)
coords = {(r.row, r.col): i for i, r in df.iterrows()}

W = np.zeros((n, n))
for i, r in df.iterrows():
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        j = coords.get((r.row + dr, r.col + dc))
        if j is not None:
            W[i, j] = 1
W = W / W.sum(axis=1, keepdims=True)  # row-standardized

x = df["UMI"].values
z = (x - x.mean()) / x.std()
I_obs = (n / W.sum()) * (z @ W @ z) / (z @ z)

# 999-permutation significance test
rng = np.random.default_rng(42)
perm_I = []
for _ in range(999):
    zp = rng.permutation(z)
    perm_I.append((n / W.sum()) * (zp @ W @ zp) / (zp @ zp))
perm_I = np.array(perm_I)
p_value = (np.sum(perm_I >= I_obs) + 1) / 1000
z_score = (I_obs - perm_I.mean()) / perm_I.std()
print(f"Global Moran's I = {I_obs:.4f}, Z = {z_score:.2f}, p = {p_value:.3f}")`;

const doc = new Document({
  styles: { default: { document: { run: { font: "Times New Roman", size: 22 } } } },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Supplementary file: ", bold: true, size: 26 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Title of the research paper:", bold: true, size: 22 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: TITLE, italics: true, size: 22 })] }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "Supplementary Data Tables and Code", bold: true, size: 24 })] }),

      h("S1. Full Cluster Profile Statistics (K-Means, k = 6)"),
      dataTable(
        ["Cluster", "Label", "n Grid Cells", "Mean Building Count", "Mean Density", "Mean Built-up Area (m\u00b2)", "Mean Footprint Area (m\u00b2)", "Max Footprint Area (m\u00b2)", "SD Footprint Area (m\u00b2)"],
        s1Rows,
        [500, 1700, 900, 1100, 900, 1300, 1100, 1100, 1100]
      ),
      caption("Table S1. Per-cluster descriptive statistics underlying manuscript Fig. 3 (source: Cluster_Profile_Table.csv / UMAP.xlsx)."),

      h("S2. Cluster Validity \u2013 Silhouette Scores"),
      p("S2a. Mean silhouette per cluster (UMAP embedding, k = 6 solution):"),
      dataTable(["Cluster", "n Cells", "Mean Silhouette (UMAP space)"], s2aRows, [2000, 2000, 3500]),
      caption("Table S2a. Per-cluster silhouette values underlying manuscript Fig. 5a (source: silhouette_per_cluster_umap.csv)."),
      p("S2b. Silhouette score and K-Means inertia across k = 2\u201310 (UMAP embedding):"),
      dataTable(["k", "Silhouette Score (UMAP space)", "K-Means Inertia"], s2bRows, [1500, 3000, 3000]),
      caption("Table S2b. k-scan underlying manuscript Fig. 5b (source: k_scan_silhouette.csv)."),

      h("S3. Clustering Stability Analysis"),
      p("S3a. Agreement (Adjusted Rand Index, ARI) with the original k = 6 labeling across random seeds and UMAP hyperparameters:"),
      dataTable(["Scan", "Mean ARI", "Min ARI", "Max ARI"], s3aRows, [5500, 1500, 1500, 1500]),
      caption("Table S3a. Summary of 10-seed and 9-hyperparameter-combination scans (source: stability_seed_scan.csv, stability_umap_hyperparam_scan.csv, stability_summary.txt)."),
      p("S3b. Plain K-Means (no UMAP) k-scan on the standardized raw 5-indicator space:"),
      dataTable(["k", "Silhouette (raw indicator space)"], s3bRows, [2000, 4000]),
      caption("Table S3b. Source: stability_kmeans_raw_kscan.csv. Plain K-Means at k = 6 achieved silhouette = 0.406, Davies-Bouldin = 0.963, and ARI = 0.294 against the UMAP-based clustering (stability_summary.txt)."),

      new Paragraph({ spacing: { before: 300, after: 150 }, children: [new TextRun({ text: "Supplementary Code", bold: true, size: 24 })] }),

      p("Code 1. Google Earth Engine (GEE) \u2013 Open Buildings v3 acquisition for the Bhopal study area.", { bold: true }),
      ...codeBlock(GEE_OBF),
      caption("Figure S1. GEE script used to filter and export Google Research Open Buildings v3 polygons intersecting the Bhopal study boundary."),

      p("Code 2. Google Earth Engine (GEE) \u2013 World Settlement Footprint (WSF) 2015 acquisition for the Bhopal study area.", { bold: true }),
      ...codeBlock(GEE_WSF),
      caption("Figure S2. GEE script used to extract and export the WSF 2015 settlement mask, clipped to the Bhopal study boundary."),

      p("Code 3. Python \u2013 UMAP projection and K-Means clustering (k = 6).", { bold: true }),
      ...codeBlock(PY_UMAP),
      caption("Figure S3. Python code used to generate the UMAP scatter plot of urban morphological signatures (manuscript Fig. 2)."),

      p("Code 4. Python \u2013 Clustering stability analysis (seed scan, UMAP hyperparameter scan, raw-space K-Means baseline).", { bold: true }),
      ...codeBlock(PY_STABILITY),
      caption("Figure S4. Python code used to produce Tables S3a and S3b above (manuscript Section III-B)."),

      p("Code 5. Python \u2013 Global Moran's I on the composite Urban Morphological Index (UMI) surface, rook contiguity.", { bold: true }),
      ...codeBlock(PY_MORAN),
      caption("Figure S5. Python code used to compute the global Moran's I statistic reported in manuscript Fig. 5c (I = 0.432, Z = 12.05, p = 0.001, n = 999 permutations)."),

      new Paragraph({
        spacing: { before: 300 },
        children: [new TextRun({
          text: "[Note: Building footprints were acquired from Google Research Open Buildings v3 via Google Earth Engine (GEE); the WSF 2015 complementary mask was likewise acquired via GEE. UMAP projection, K-Means clustering, stability analysis, and spatial autocorrelation testing were carried out in Python. Grid construction, spatial joins, and zonal aggregation were carried out in QGIS. For further data and analysis, please contact the corresponding author.]",
          italics: true, size: 20,
        })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Supplementary_File_AGERS2026_1571358824.docx";
  fs.writeFileSync(out, buf);
  console.log("Wrote", out);
});
