# Bhopal Urban Morphological Signature Mapping — Project Data Package

Single reference package for the AGERS-2026 submission:
**"Machine Learning-Based Urban Morphological Signature Mapping Using Open Building
Footprints and UMAP Clustering: A Grid-Based Assessment of Bhopal City, India"**

Authors: Mukul Maravi, Janki Prasad, Bikash Das — Dept. of Geography, IGNTU, Amarkantak.

Upload this whole folder (or the zipped version) in a future session so Claude can
re-derive full context in one shot instead of re-reading files one at a time.

---

## 1. Study parameters (verified from data, 22 Sep 2026)

| Parameter | Value | Source |
|---|---|---|
| Building footprints (OBF) | 138,745 structures (as stated in prior drafts; raw per-cell sum in `bhopal_umap_clusters.csv` = 143,864 — **discrepancy not yet reconciled, verify before final paper**) | `bhopal_umap_clusters.csv` |
| Analytical grid | 1 km x 1 km, 495 total cells | `bhopal_umap_clusters.csv`, `Bhopal_umi-grid.csv` |
| Cells with valid morphology data | 423 of 495 | `Local_Morans_I` DBF |
| Municipal grid extent | ~411.0 km2 (sum of cell `area_km2`) | `Bhopal_umi-grid.csv` |
| CRS | WGS 1984 UTM Zone 43N | `Local_Morans_I.prj` |
| Clustering pipeline | Standardize 5 indicators -> UMAP (2D) -> K-Means (k=6) | `cluster_results_of_UMAP.docx`, `UMAP.xlsx` |
| Spatial validation | Local Moran's I (LISA) | `Local_Morans_I.zip` (dbf fields: `Z_score`, `p_value`, `q_value`, `p_fdr`) |

## 2. Cluster profile (K-Means, k=6) — `Cluster_Profile_Table.csv`

| Cluster | Signature | Mean bldg count | Density | Mean area (m2) | Max area (m2) | Std dev (m2) |
|---|---|---|---|---|---|---|
| 0 | Low-Density Residential | 71.59 | 0.02 | 247.16 | 1940.45 | 348.67 |
| 1 | Open Land / Water / Non-Urban | 2.00 | 0.00 | 10.43 | 17.00 | 6.56 |
| 2 | Urban Core / High-Intensity Built-Up | 962.26 | 0.32 | 343.92 | 5317.01 | 482.23 |
| 3 | Medium-Density Residential | 403.81 | 0.08 | 179.76 | 2115.31 | 231.87 |
| 4 | Sparse Peri-Urban Development | 30.99 | 0.01 | 107.07 | 381.57 | 83.41 |
| 5 | Compact Urban Fabric | 315.02 | 0.12 | 416.92 | 6674.99 | 735.70 |

Cluster cell counts (from `bhopal_umap_clusters.csv`, all 495 cells assigned):
0=70, 1=73, 2=72, 3=62, 4=85, 5=133.

## 3. Local Moran's I (LISA) results — verified by direct DBF parse

Field `q_value` (LISA quadrant code): 1 = High-High, 2 = Low-High, 3 = Low-Low, 4 = High-Low (per ESRI/GeoDa convention).
Significance = `p_value` < 0.05 (423 valid cells tested).

| Cluster type | q_value | Significant cells (p<0.05) | Mean UMI |
|---|---|---|---|
| High-High (hot spot / core) | 1 | 71 | 0.462 |
| Low-Low (cold spot / periphery) | 3 | 58 | 0.208 |
| Low-High (outlier) | 2 | 4 | 0.322 |
| Total significant (p<0.05) | — | 133 | — |
| Total significant (FDR-corrected, p_fdr<0.05) | — | 61 | — |

This is the evidence used to claim the UMAP/K-Means signatures are **not random** —
the High-Intensity Urban Core cluster spatially coincides with the statistically
significant High-High LISA cluster shown in `Local Moran's I map (image 4)`.

## 4. Data sources

- **OBF** — Open Building Footprints (integrate exact source/provider — Google/Microsoft
  Open Buildings — and confirm before final paper; not explicitly logged in any file here).
- **WSF** — World Settlement Footprint (DLR/EOC), used as a settlement mask overlay.
- **1 km grid** — custom analytical grid built over Bhopal Municipal Corporation boundary.
- Processing done in QGIS 3.44 (per `.qmd` metadata) + Python (UMAP, K-Means).

**Action item:** confirm and cite the exact OBF/WSF dataset versions/years and access
dates in the full paper's Data section — this package does not contain that provenance.

## 5. Files in this package

```
Bhopal_Urban_Morphology_UMAP/
├── README.md                          <- this file
├── abstract_final.txt                 <- submission-ready abstract (250-300 words)
├── data/
│   ├── bhopal_umap_clusters.csv       <- 495-cell grid: coords, morphology indices, UMAP1/2, Cluster
│   ├── Bhopal_umi-grid.csv            <- 495-cell grid: raw OBF/WSF overlay counts, UMI, UMI_w
│   ├── Bhopal_umi-grid.xlsx           <- same as above, Excel
│   ├── UMAP.xlsx                      <- UMAP output (Excel)
│   ├── Cluster_Profile_Table.csv      <- 6-cluster summary statistics
│   ├── Bhopal_UMI_Grid.zip            <- shapefile: grid + UMI (QGIS project fields)
│   ├── Local_Morans_I.zip             <- shapefile: LISA results (Z_score, p_value, q_value, p_fdr)
│   └── shape2026072511713.zip         <- small boundary/reference shapefile (4 records only — verify what this is)
└── docs/
    ├── Machine_Learning.docx          <- original submitted abstract (AGERS-2026)
    └── cluster_results_of_UMAP.docx   <- cluster interpretation notes
```

## 6. Open items to resolve before the full paper

1. Reconcile 138,745 vs 143,864 building-count discrepancy.
2. Confirm OBF and WSF dataset provenance (source, version, year, license) for the Data/Methods section.
3. `shape2026072511713.zip` is a tiny 4-record shapefile of unclear purpose — confirm what it represents.
4. No clustering validity metric (e.g., silhouette score) was found in the provided files —
   compute and report one if the full paper needs it, or rely on the LISA spatial-coherence
   check as the stated validation method (as done in the abstract).
5. Author name "Janki Parasd" appears in both source docs — verify spelling before final submission.
