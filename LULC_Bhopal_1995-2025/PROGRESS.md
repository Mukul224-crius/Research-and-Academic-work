# LULC change, Bhopal 1995–2005–2015–2025 — RF & SVM in QGIS SCP

Progress log so any new Claude session can pick up where we left off.
Read this first, then ask for a fresh QGIS screenshot.

## Setup
- Study area: Bhopal (boundary layer "Reproject"), EPSG:32643 (WGS 84 / UTM 43N).
- Software: QGIS + Semi-Automatic Classification Plugin (SCP) 8.5.0.
  Stay on 8.5 until all four years are done (don't upgrade to SCP 9 mid-project).
- Imagery plan:
  - 1995, 2005: Landsat 5 TM, Collection 2 Level-2 surface reflectance, Tier 1
    (not Landsat 7 for 2005 — SLC-off stripes after May 2003).
  - 2015, 2025: Landsat 8/9 (30 m) so all years share the same resolution.
  - Same season for every year; <10% cloud.
- Band set (1995): B1, B2, B3, B4, B5, B7. In SCP RGB box: 4-3-2 = false colour,
  5-4-3 = SWIR composite (best for forest vs crop), 6-4-2 = TM 7-4-2.
- Band set wavelengths were wrong (showed 7/8/9 µm) — set
  "Landsat 5 TM" in Band set > wavelength quick settings.

## Classes (keep identical for all four years)
| ID | Class |
|---|---|
| 0 | Unclassified |
| 1 | Vegetation |
| 2 | Water bodies |
| 3 | Agriculture |
| 4 | Barren land |
| 5 | Built-up |

## Status (27-11-2026)
- 1995: first RF ("RF_final", "Rain_forest_classification_1995") and SVM
  ("SVM_Classification_1995") outputs produced.
- Issues seen in the 1995 RF map:
  1. Built-up (red) heavily over-predicted across rural fields and hills —
     likely bare/fallow/harvested soil confused with built-up.
  2. Centre of Upper Lake shows black (class 0 / NoData) — check deep-water
     pixel values; add deep-water ROIs or handle NoData.
  3. Strong salt-and-pepper noise.
  4. Vegetation vs agriculture mixed in the north.
  5. Map extends beyond the study boundary — clip before area statistics.
  6. Several "SCP training layer" entries loaded — keep one ROI file per year.
- Region-growing ROI settings still at Dist 0.01 / Min 60 / Max 100;
  recommended Min 5–10, Max 10–15 for crops, ~20–30 for forest blocks.

- SVM 1995 (screenshot 27-11-2026): built-up over-prediction even worse than RF
  (most of the west and north is red); same black lake centre. Barren-land class
  has no display colour — give it one (e.g. tan/brown) so it is visible.
- Accuracy plan agreed: fix ROIs first, then assess with QGIS plugin AcATaMa
  (stratified random sample, ~50+ points per class, blind labelling, same points
  for RF and SVM). Report OA, PA, UA (+ kappa only as a secondary figure).
  Target: OA >= 85% (Anderson et al. 1976) with no class badly below.

## Next steps
1. Fix 1995 ROIs (barren/fallow vs built-up, deep water) and re-run RF and SVM.
2. Accuracy assessment with an independent, stratified random reference sample
   (not the training ROIs): confusion matrix, overall / producer's / user's accuracy.
3. Compare RF vs SVM on the same reference sample (e.g. McNemar test).
4. Clip to boundary, sieve, area statistics.
5. Repeat for 2005, 2015, 2025; then change matrix (SCP Land cover change).
