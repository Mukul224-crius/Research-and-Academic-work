import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Revision Form AGERS"

thin = Side(style="thin")
border = Border(left=thin, right=thin, top=thin, bottom=thin)
header_fill = PatternFill("solid", fgColor="D9D9D9")

col_widths = {"A": 4, "B": 46, "C": 60, "D": 10, "E": 22}
for col, w in col_widths.items():
    ws.column_dimensions[col].width = w

# Title
ws.merge_cells("B1:E1")
ws["B1"] = "Revision Form for The Paper of AGERS 2026"
ws["B1"].font = Font(bold=True, size=14)
ws["B1"].alignment = Alignment(horizontal="center")

ws["B3"] = "REVISION DETAILS"
ws["B3"].font = Font(bold=True)

ws["B4"] = "Paper ID :"
ws["C4"] = "1571358824"
ws["B5"] = "Paper Title :"
ws["C5"] = ("Machine Learning-Based Urban Morphological Signature Mapping Using Open "
            "Building Footprints and UMAP Clustering: A Grid-Based Assessment of Bhopal "
            "City, India")
ws["C5"].alignment = Alignment(wrap_text=True)

headers = ["No.", "Review Comment", "Revision", "Page", "Paragraph/ Line number"]
header_row = 7
for i, h in enumerate(headers):
    c = ws.cell(row=header_row, column=i + 1, value=h)
    c.font = Font(bold=True)
    c.alignment = Alignment(horizontal="center", wrap_text=True)
    c.fill = header_fill
    c.border = border

rows = [
    ("Reviewer 3: In-text section-referencing error -- Limitations section referred "
     "to “Section IV-B” and “Section IV-D,” which do not exist (Section IV is the "
     "Conclusion, with no subsections).",
     "Corrected throughout: a manual section renumbering (Study Area merged into "
     "Materials and Methods as II-A) had not been propagated into every cross-"
     "reference. Fixed “Section IV-B”→“III-B”, “III-A”→“II-B”, the Fig. 3 "
     "caption's nonexistent “III-F”→“II-G”, and “IV-D”→“III-D”. Every remaining "
     "in-text section reference was verified against the corrected numbering.",
     "", "Sec. II, III (throughout)"),

    ("Reviewers 1 & 2: Spatial-autocorrelation checks (global Moran's I on the UMI "
     "surface; 62.5% Urban Core / LISA High-High overlap) were described in terms "
     "that implied they validate the entire six-cluster classification, when the "
     "UMI shares inputs with the clustering and the overlap supports only one "
     "cluster.",
     "Reworded in four places (Abstract, Results §III-C, Limitations §III-D, "
     "Conclusion) to state explicitly that these checks corroborate the UMI "
     "surface's non-random structure and the Urban Core cluster specifically, and "
     "are not an independent accuracy assessment of the full classification.",
     "", "Abstract; Sec. III-C, III-D; Conclusion"),

    ("Reviewer 2: Conclusions about transferability to other cities should align "
     "with the scope of the available evidence (only Bhopal was analyzed).",
     "Softened “applicable to other data-scarce Indian cities” (stated as fact) to "
     "“designed for extension to other data-scarce Indian cities, pending "
     "independent testing in those settings” in the Abstract and Conclusion.",
     "", "Abstract; Conclusion"),

    ("Reviewers 1 & 2: The choice of k=6 needs a stability analysis across random "
     "seeds / UMAP settings, and comparison against K-Means applied directly to "
     "the standardized indicators (no UMAP).",
     "Added a new stability analysis (Sec. III-B): 10 random seeds and 9 UMAP "
     "hyperparameter combinations scored against the original labeling via "
     "Adjusted Rand Index (mean ARI 0.78-0.79); a plain K-Means baseline on the "
     "raw 5-indicator space (bypassing UMAP) agreed only weakly (ARI=0.29), "
     "showing UMAP materially reshapes the partition rather than just "
     "visualizing it.",
     "", "Sec. III-B"),

    ("Reviewer 1: Document the full data/preprocessing workflow -- building-"
     "footprint provenance, temporal compatibility with WSF 2015, handling of "
     "empty/singleton cells, assignment of buildings crossing grid boundaries, "
     "and the effect of clipped boundary-cell areas on count-based comparisons.",
     "OBF provenance confirmed and stated (Google Open Buildings v3 polygons, 30 "
     "May 2023 snapshot, CC-BY 4.0/ODbL). Documented that 72/495 cells with no "
     "buildings are zero-filled before standardization (Sec. II-C). Documented "
     "that density (not raw count) is the valid basis for comparing clipped "
     "boundary cells. Confirmed from the authors' own QGIS Processing History "
     "that buildings are joined via an “intersects” predicate, so a boundary-"
     "crossing building is attributed in full to every cell it touches -- stated "
     "explicitly as a limitation.",
     "", "Sec. II-B, II-C, III-D"),

    ("Reviewer 3: Data provenance uncertainty -- OBF source/version/imagery date "
     "unconfirmed; UMI_w weights were reverse-engineered rather than confirmed "
     "from the original script.",
     "OBF provenance fully confirmed (see above). UMI_w: checked the QGIS "
     "Processing History log and the saved .qgz project's field definitions "
     "(every layer's expressionfields element is empty) and confirmed no stored "
     "expression exists anywhere recoverable; Eq. (13) is reported explicitly as "
     "the best available reconstruction (OLS fit, n=423, max residual 0.00046), "
     "not a confirmed original formula.",
     "", "Sec. II-B, II-C"),

    ("Reviewer 3 (“fatal flaw”): The 1 km x 1 km grid risks ecological fallacy; "
     "requested testing at a much finer scale (e.g., 250 m x 250 m).",
     "Not performed this round: requires re-aggregating raw building-footprint "
     "geometry at a new resolution from source data, which is not retained at "
     "finer than 1 km in the current data package. Added as a named, explicit "
     "limitation together with a competing risk the reviewer's proposal "
     "introduces (very few buildings per cell at 250 m makes variance-based "
     "indicators unstable); a multi-resolution sensitivity analysis is committed "
     "as priority follow-up work.",
     "", "Sec. III-D"),

    ("Reviewer 3: Validate the clusters against independent field data (e.g., "
     "satellite imagery or land-use data) to confirm labels are morphologically, "
     "not just mathematically, sensible.",
     "Not performed this round. Added as a named priority for follow-up work in "
     "Sec. III-D: a stratified visual check of a representative sample of cells "
     "from each of the six clusters against high-resolution satellite basemap "
     "imagery.",
     "", "Sec. III-D"),

    ("Reviewer 2: Manuscript requires improvement in technical presentation -- "
     "equation formatting, notation clarity, figure quality.",
     "All equations are native embedded Word equation objects (proper stacked "
     "fractions/roots/sums), not unicode-text approximations. All 5 figures are "
     "dedicated, individually captioned, full-width dashboards. Manuscript "
     "reformatted into the official IEEE conference template (named paragraph "
     "styles, automatic section/figure/reference numbering, 3-column author "
     "block, no author numbering, no hyperlinked emails) per the AGERS "
     "secretariat's acceptance-email instructions.",
     "", "Throughout"),

    ("Internal: unconfirmed reference lacking volume/issue/page/DOI "
     "(Ghosh 2019, Bhopal LULC) -- flagged pre-review, not itself raised by a "
     "reviewer but affecting reference-list completeness/accuracy.",
     "Reference removed along with its sole in-text citation (the claim it "
     "supported was dropped rather than left uncited); all subsequent "
     "references and every in-text citation number were renumbered and verified "
     "consistent (11 references total, no gaps).",
     "", "References"),
]

r = header_row + 1
for i, (comment, revision, page, para) in enumerate(rows, start=1):
    ws.cell(row=r, column=1, value=i).alignment = Alignment(horizontal="center", vertical="top")
    c2 = ws.cell(row=r, column=2, value=comment)
    c2.alignment = Alignment(wrap_text=True, vertical="top")
    c3 = ws.cell(row=r, column=3, value=revision)
    c3.alignment = Alignment(wrap_text=True, vertical="top")
    c4 = ws.cell(row=r, column=4, value=page)
    c4.alignment = Alignment(horizontal="center", vertical="top")
    c5 = ws.cell(row=r, column=5, value=para)
    c5.alignment = Alignment(wrap_text=True, vertical="top")
    for col in range(1, 6):
        ws.cell(row=r, column=col).border = border
    ws.row_dimensions[r].height = 90
    r += 1

out = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Revision-Form-AGERS2026-1571358824.xlsx"
wb.save(out)
print("Wrote", out)
