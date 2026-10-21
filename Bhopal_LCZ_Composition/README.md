# Bhopal Local Climate Zone (LCZ) Composition — Project Package

Manuscript for **GIS Odyssey Journal** (ISSN 2720-2682; Scopus-indexed, free, English only, CC-BY 4.0):

**"Decoding the Entropy of Urban Form: Shannon–Simpson Diversity and Rank–Dominance Diagnostics
of Local Climate Zones in Bhopal, India, from the Global 100 m LCZ Map"**

Authors: Mukul Maravi*, Janki Prasad, Bikash Das. Department of Geography, IGNTU, Amarkantak.

## Files

```
Bhopal_LCZ_Composition/
├── Bhopal_LCZ_Composition_Paper_DRAFT.docx   <- full manuscript (A4, Times New Roman, APA 7)
├── data/
│   ├── lcz_unique_values_report.csv          <- QGIS "Raster layer unique values report" (only data source)
│   └── stats_LCZ.xlsx                        <- author's earlier area table (cross-check)
├── scripts/
│   ├── compute_statistics.py                 <- every statistic in the paper, from the CSV only
│   ├── build_figures.py                      <- Fig. 2 (workflow), Fig. 3 and Fig. 4 (dashboards)
│   └── build_paper.js                        <- docx-js build; reads numbers from the JSON (no hand-typed values)
├── figures/                                   <- 300 dpi PNGs
└── validation/
    ├── lcz_statistics.json / .txt            <- computed statistics
    └── validate_manuscript.py                <- journal-rule and citation checks
```

Rebuild: `python3 scripts/compute_statistics.py && python3 scripts/build_figures.py && NODE_PATH=$(npm root -g) node scripts/build_paper.js && python3 validation/validate_manuscript.py`

## Journal rules applied

Rules come from the GIS Odyssey author guidelines, as quoted in search results; the site itself
could not be reached from this sandbox.
- 20,000–40,000 characters with spaces: the manuscript has **≈28,800**, so it passes.
- File ≤ 2 MB: **0.95 MB**, so it passes. Abstract ≤ 20 lines (198 words). Keywords ≤ 5 (5). Equations are numbered (9).
- Figures are 300 dpi. ORCID and affiliations are in footnotes.
- **Still to do:** download the journal's own Word template and paste the text into it. Its exact fonts and margins could not be fetched.

## Data validation (all pass)

1. For every class, the QGIS area column equals pixel count × 95.1595² m².
2. The total pixel count (83,050) equals 302 × 275.
3. The mean and SD from the frequency table, including 0 (5.54485 and 5.9331), **reproduce the values QGIS reports** for the layer.
4. Every number in the abstract is checked automatically against `lcz_statistics.json`.

Note: the valid area sums to 419.044 km². The earlier xlsx shows 419.045 because of rounding.

## Reference verification log (21 Oct 2026)

Each DOI was confirmed by web search: publisher page, PubMed, ADS, DOAJ or the journal's own listing.
Crossref and doi.org are blocked in this sandbox, so no reference comes from memory alone.

| Group | Reference | DOI | Status |
|---|---|---|---|
| Bhopal | Mistry & Mehrotra 2023, JISRS 51, 713–731 | 10.1007/s12524-022-01658-w | verified |
| Bhopal | Mistry & Mehrotra 2025a, Comput. Urban Sci. 5:47 | 10.1007/s43762-025-00217-6 | verified |
| Bhopal | Mistry & Mehrotra 2025b, ICUC12-1066 abstract | 10.5194/icuc12-1066 | verified |
| Bhopal | Mistry & Mehrotra 2026, JISRS (online first) | 10.1007/s12524-026-02447-5 | verified; volume/pages not yet assigned |
| Bhopal | Dwivedi & Soni 2026, Theor. Appl. Climatol. 157:493 | 10.1007/s00704-026-06420-7 | verified |
| India | Kotharkar & Bagade 2018, Urban Climate 24, 369–392 | 10.1016/j.uclim.2017.03.003 | verified |
| India | Kotharkar, Bagade & Agrawal 2019, Geogr. Pannonica 23(4) | 10.5937/gp23-24251 | verified |
| India | Kotharkar, Bagade & Ramesh 2019, Landsc. Urban Plan. | 10.1016/j.landurbplan.2019.05.017 | DOI and authors verified; **vol. 190 / art. 103586 not confirmed** (flagged red) |
| India | Saxena & Agrawal 2023, Spatial Inf. Res. 31, 609–623 | 10.1007/s41324-023-00527-z | verified (journal inferred from the s41324 DOI prefix) |
| India | Saha et al. 2025, Environ. Monit. Assess. 197:1070 | 10.1007/s10661-025-14466-9 | verified (PubMed 40888962) |
| Intl | Stewart & Oke 2012, BAMS 93(12) | 10.1175/BAMS-D-11-00019.1 | verified |
| Intl | Stewart, Oke & Krayenhoff 2014, IJC 34 | 10.1002/joc.3746 | verified (online 2013, issue 2014) |
| Intl | Bechtel et al. 2015, ISPRS IJGI 4(1) | 10.3390/ijgi4010199 | verified |
| Intl | Demuzere et al. 2019, PLOS ONE 14(4) | 10.1371/journal.pone.0214474 | verified |
| Intl | Demuzere et al. 2022, ESSD 14, 3835–3873 | 10.5194/essd-14-3835-2022 | verified |
| Method | Shannon 1948; Simpson 1949 | listed in paper | verified |

The "5 Bhopal" group has a caveat. Only three Bhopal papers are explicitly LCZ-based (2023, 2025a and 2025b).
Mistry & Mehrotra 2026 is a Bhopal heat study by the same LCZ research group. Dwivedi & Soni 2026
uses "Local Geo-Urban Zones", a zoning closely related to LCZs. No other peer-reviewed Bhopal LCZ paper with a DOI was found.

Rejected candidates had a DOI that could not be confirmed:
- Das & Das 2020 (Urban Climate)
- Choudhury, Das & Das (Urban Climate 35)
- Kotharkar & Bagade 2018 (Landsc. Urban Plan. 169)
- Pielou 1966

## Open items (red "AUTHOR TO CONFIRM" flags in the docx)

1. Name and source of the boundary used for clipping. 419.04 km² here does not match the ≈411 km² grid in the UMAP paper.
2. Exact global LCZ map version, Zenodo record and access date.
3. Confirm nearest-neighbour resampling during reprojection.
4. Section 4.1: describe the spatial pattern from the final map, and paste the map into the reserved Fig. 1 box.
5. Kotharkar, Bagade & Ramesh (2019): volume and article number.
