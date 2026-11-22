import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Revision Form AGERS"

thin = Side(style="thin")
border = Border(left=thin, right=thin, top=thin, bottom=thin)
header_fill = PatternFill("solid", fgColor="D9D9D9")

col_widths = {"A": 4, "B": 46, "C": 60, "D": 10, "E": 24}
for col, w in col_widths.items():
    ws.column_dimensions[col].width = w

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

# Each row = one official numbered "Recommended changes" bullet, verbatim,
# from the three reviews -- no weak-aspect text. Page numbers are from the
# actual rendered 8-page camera-ready PDF (pdftoppm render of the current
# docx); re-check once the authors' own Word/PDF eXpress pass renders the
# native equation objects, which LibreOffice's headless renderer does not
# draw, and could shift pagination slightly.
rows = [
    ("Reviewer 1, Recommended change 1: “Document the full data and "
     "preprocessing workflow, including building-footprint provenance, "
     "temporal compatibility with WSF 2015, handling of empty and singleton "
     "cells, and assignment of buildings crossing grid boundaries. Explain "
     "how clipped boundary-cell areas affect count-based comparisons.”",
     "OBF provenance confirmed and stated (Google Open Buildings v3 polygons, "
     "30 May 2023 snapshot, CC-BY 4.0/ODbL). Documented that 72/495 cells "
     "with no buildings are zero-filled before standardization. Confirmed "
     "from the authors' own QGIS Processing History that buildings are "
     "joined via an “intersects” predicate (a boundary-crossing building is "
     "attributed in full to every cell it touches) and stated this "
     "explicitly, together with its effect on count- vs. density-based "
     "comparisons.",
     2, "Sec. II-B, II-C"),

    ("Reviewer 1, Recommended change 2: “Test clustering stability across "
     "random seeds, UMAP settings, and alternative grid sizes, and compare "
     "the results with K-Means applied directly to the standardized "
     "indicators. Use these results to strengthen the justification for six "
     "classes.”",
     "Added a stability analysis: 10 random seeds and 9 UMAP hyperparameter "
     "combinations scored against the original labeling via Adjusted Rand "
     "Index (mean ARI 0.78-0.79); a plain K-Means baseline on the raw "
     "5-indicator space (no UMAP) agreed only weakly (ARI=0.29), showing "
     "UMAP materially reshapes the partition. (Alternative grid sizes could "
     "not be tested this round -- see Reviewer 3, Recommended change 1.)",
     4, "Sec. III-B"),

    ("Reviewer 2, Recommended change 1: “The authors should revise the "
     "manuscript to improve its technical presentation, provide clearer "
     "mathematical formulations, and substantially enhance the figures and "
     "maps.”",
     "All 18 equations are native embedded Word equation objects (proper "
     "stacked fractions/roots/sums). All 5 figures are dedicated, "
     "individually captioned, full-page-width dashboards. Manuscript "
     "reformatted into the official IEEE conference template (named "
     "paragraph styles, automatic section/figure/reference numbering, "
     "3-column author block, no author numbering, no hyperlinked emails).",
     2, "Sec. II-C (equations); Figs. 1-5"),

    ("Reviewer 2, Recommended change 2: “They should also strengthen the "
     "justification for the selected number of clusters, assess clustering "
     "stability, and clarify the distinction between cluster validation and "
     "spatial autocorrelation analysis.”",
     "Stability analysis as above. Reworded the Abstract, Results §III-C and "
     "Limitations §III-D to state explicitly that the global Moran's I and "
     "the 62.5% Urban Core/LISA overlap corroborate the UMI surface's "
     "non-random structure and the Urban Core cluster specifically, and are "
     "not an independent accuracy assessment of the full six-cluster "
     "classification.",
     4, "Sec. III-B, III-C, III-D"),

    ("Reviewer 2, Recommended change 3: “Conclusions about transferability "
     "to other cities should align with the scope of the available "
     "evidence.”",
     "Softened “applicable to other data-scarce Indian cities” (stated as "
     "fact) to “designed for extension to other data-scarce Indian cities, "
     "pending independent testing in those settings” in the Abstract and "
     "Conclusion.",
     1, "Abstract (p.1); Conclusion (p.5)"),

    ("Reviewer 3, Recommended change 1: “Run testing with a much finer grid "
     "scale (e.g., 250m x 250m) to verify that the framework truly captures "
     "neighborhood-level morphology without excessively averaging out "
     "heterogeneity.”",
     "Not performed this round: requires re-aggregating raw building-"
     "footprint geometry at a new resolution from source data, not retained "
     "at finer than 1 km in the current data package. Added as a named, "
     "explicit limitation together with a competing risk (very few buildings "
     "per cell at 250 m would make variance-based indicators unstable); a "
     "multi-resolution sensitivity analysis is committed as priority "
     "follow-up work.",
     4, "Sec. III-D"),

    ("Reviewer 3, Recommended change 2: “Clarify and confirm the source, "
     "version, and acquisition date of the Open Building Footprints dataset "
     "used, and refine the data processing flow to eliminate the need for "
     "reverse-engineering the attributes themselves.”",
     "OBF source/version/date fully confirmed (Google Open Buildings v3 "
     "polygons, 30 May 2023 snapshot). UMI_w: checked the QGIS Processing "
     "History log and the saved .qgz project's field definitions (every "
     "layer's expressionfields element is empty) and confirmed no stored "
     "expression exists anywhere recoverable; Eq. (13) is reported "
     "explicitly as the best available reconstruction, not a confirmed "
     "original formula.",
     2, "Sec. II-B (p.2); II-C (p.3)"),

    ("Reviewer 3, Recommended change 3: “Validate the clusters using "
     "independent field data samples (such as Google Earth satellite "
     "imagery or land use data) to ensure that the assigned cluster labels "
     "make sense morphologically, not just mathematically.”",
     "Not performed this round. Added as a named priority for follow-up work: "
     "a stratified visual check of a representative sample of cells from "
     "each of the six clusters against high-resolution satellite basemap "
     "imagery.",
     4, "Sec. III-D"),
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
    ws.row_dimensions[r].height = 95
    r += 1

note_row = r + 1
ws.cell(row=note_row, column=2,
        value=("Note: page numbers are from the current 8-page camera-ready render. "
               "Please re-verify against your own PDF eXpress / Word pagination before "
               "sending, since native equation rendering can shift page breaks slightly."))
ws.cell(row=note_row, column=2).font = Font(italic=True, size=9)
ws.cell(row=note_row, column=2).alignment = Alignment(wrap_text=True)
ws.merge_cells(start_row=note_row, start_column=2, end_row=note_row, end_column=5)

out = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Revision-Form-AGERS2026-1571358824.xlsx"
wb.save(out)
print("Wrote", out)
