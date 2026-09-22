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
| Building footprints (OBF) | 143,864 structures (raw per-cell sum of `fid_count` across all 495 grid cells in `bhopal_umap_clusters.csv`; supersedes the 138,745 figure used in earlier drafts, which is not reconcilable from any file in this package) | `bhopal_umap_clusters.csv` |
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
├── README.md                              <- this file
├── abstract_final.txt                     <- submission-ready abstract (250-300 words)
├── Bhopal_Urban_Morphology_FullPaper_DRAFT.docx  <- full IEEE-format paper draft (see item 7)
├── data/
│   ├── bhopal_umap_clusters.csv       <- 495-cell grid: coords, morphology indices, UMAP1/2, Cluster
│   ├── Bhopal_umi-grid.csv            <- 495-cell grid: raw OBF/WSF overlay counts, UMI, UMI_w
│   ├── Bhopal_umi-grid.xlsx           <- same as above, Excel
│   ├── UMAP.xlsx                      <- UMAP output (Excel)
│   ├── Cluster_Profile_Table.csv      <- 6-cluster summary statistics
│   ├── Bhopal_UMI_Grid.zip            <- shapefile: grid + UMI (QGIS project fields)
│   ├── Local_Morans_I.zip             <- shapefile: LISA results (Z_score, p_value, q_value, p_fdr)
│   └── shape2026072511713.zip         <- small boundary/reference shapefile (4 records only — verify what this is)
├── docs/
│   ├── Machine_Learning.docx          <- original submitted abstract (AGERS-2026)
│   └── cluster_results_of_UMAP.docx   <- cluster interpretation notes
├── figures/
│   ├── fig1_data_integration_map.png  <- OBF/WSF/grid integration map (used as Fig. 1 in the paper)
│   ├── fig2_umap_projection.png       <- UMAP cluster scatter plot (used as Fig. 2)
│   └── fig3_local_morans_i_map.png    <- LISA cluster map (used as Fig. 3)
├── scripts/
│   └── build_paper.js                 <- docx-js script that generates the full paper draft
└── validation/
    ├── silhouette_validation.py       <- k=6 silhouette/Davies-Bouldin + k-scan (own data only)
    ├── silhouette_per_cluster_umap.csv
    ├── k_scan_silhouette.csv
    ├── validation_summary.txt
    ├── global_morans_i.py             <- global Moran's I + permutation test (own data only)
    └── global_morans_i_summary.txt
```

## 6. Open items to resolve before the full paper

1. ~~Reconcile 138,745 vs 143,864 building-count discrepancy.~~ Resolved 22 Sep 2026 — using
   143,864 (verified sum of `fid_count` across all 495 cells) going forward. 138,745 is
   retired as unsourced.
2. Confirm OBF and WSF dataset provenance (source, version, year, license) for the Data/Methods section.
3. `shape2026072511713.zip` is a tiny 4-record shapefile of unclear purpose — confirm what it represents.
4. ~~No clustering validity metric~~ Resolved 22 Sep 2026 — see `validation/` folder.
   **Important finding:** k=6 is NOT the silhouette-optimal k (k=9 and k=10 score higher
   on the UMAP embedding: 0.598 and 0.592 vs. 0.567 for k=6), and the k=6 clusters score
   much weaker in the raw untransformed indicator space (silhouette 0.229) than in the
   UMAP-compressed space (0.567) — UMAP inflates apparent separation. Cluster 5 (Compact
   Urban Fabric, n=133) is the weakest-defined cluster (mean silhouette 0.31). The full
   paper must justify k=6 on interpretability grounds, not on "statistically optimal k" —
   that claim is not supported by this data. See `validation/validation_summary.txt`.
5. ~~Author name "Janki Parasd"~~ Resolved 22 Sep 2026 — confirmed as a typo against the
   authors' own IEEE InGARSS-2026 manuscript template (same email, same institution):
   correct form is **Dr. Janki Prasad**. Fixed in the full-paper draft.
6. ~~Full data-validation pass~~ Partially resolved 22 Sep 2026 — silhouette/Davies-Bouldin
   (item 4) and global Moran's I (item 8 below) are done. Feature-recomputation spot-check
   and ground-truth imagery check (protocol items 2 and 5) are still open — cannot be done
   from this package alone; raw building geometries are not included, only pre-aggregated
   per-cell statistics.
7. **First full-paper draft written** — `Bhopal_Urban_Morphology_FullPaper_DRAFT.docx`
   (IEEE two-column, ~6 pages with 3 figures + 2 tables + 8 references). Built from
   `scripts/build_paper.js` (docx-js). Two items are flagged directly in the document text
   in red italics and must be filled in by the authors before submission:
   - exact OBF dataset provider/version/vintage/access date
   - UMAP hyperparameters (n_neighbors, min_dist, random_state)
   Reference [6] (Ghosh 2019, Bhopal LULC) also needs volume/issue/page/DOI confirmed.
   **Could not render a PDF preview in this sandbox** — LibreOffice fails to convert even
   a trivial file here (environment issue, not a document defect). Structural validity was
   confirmed instead via `python-docx` read-back (60 paragraphs, 3 tables, 3 images, all
   8 references present and in order). Open in Word/Google Docs to visually check layout,
   pagination, and figure placement before relying on it.
8. **Global Moran's I computed** 22 Sep 2026 (`validation/global_morans_i.py`, own data
   only, rook contiguity, row-standardized, 999-permutation significance test):
   I = 0.4324, Z = 12.05, pseudo-p = 0.001 on the UMI surface — strong, highly significant
   positive spatial autocorrelation city-wide, which is the necessary precondition for
   interpreting the Local Moran's I (LISA) results in item 3 above as meaningful rather
   than spurious local noise. See `validation/global_morans_i_summary.txt`.
9. **Cross-validation between the two clustering methods**: 45 of 72 cells (62.5%) in the
   K-Means Urban Core cluster (Cluster 2) also fall in the statistically significant LISA
   High-High cluster — independent corroboration that this signature reflects real spatial
   structure. Computed directly from `data/bhopal_umap_clusters.csv` + `data/Local_Morans_I.zip`.
10. `shape2026072511713.zip` still unresolved (item 3 above, unchanged).

## 7. Data validation protocol (must run before full-paper drafting)

See the chat record for the full walkthrough. Summary of the four checks required:

1. **Source data QA** — footprint geometry validity (no null/self-intersecting polygons,
   no duplicates, plausible area range), boundary correctness (grid vs municipal limit
   clip), and confirmed OBF/WSF vintage.
2. **Feature computation QA** — recompute the 5 per-cell indicators independently
   (e.g., in QGIS field calculator or a fresh Python script) and diff against
   `bhopal_umap_clusters.csv` — spot-check at least 10-20 cells by hand.
3. **Clustering validity** — compute a silhouette score (and/or Davies-Bouldin index) for
   the k=6 K-Means solution on the UMAP embedding; justify k=6 against a scan of
   k=3..10 (elbow/silhouette curve), and report UMAP hyperparameters used
   (n_neighbors, min_dist, random_state) for reproducibility.
4. **Spatial validation** — already partly done via Local Moran's I; still need the
   global Moran's I value + its own p-value (tests whether the whole UMI surface
   is autocorrelated, not just local hot/cold spots), and to fix the spatial weights
   matrix definition (queen/rook contiguity, k-nearest, or distance band) explicitly.
5. **External/independent check** — cross-check a sample of grid cells (e.g., the Urban
   Core cluster) against Google/Bing satellite imagery or ground truth to confirm the
   morphology labels are visually sensible, not just numerically self-consistent.
