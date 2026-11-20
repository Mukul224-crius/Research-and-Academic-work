const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType,
} = require("docx");

function h1(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0B0B0B", space: 3 } },
    children: [new TextRun({ text, bold: true, size: 26 })],
  });
}
function h2(text) {
  return new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text, bold: true, size: 22 })] });
}
function label(text) {
  return new Paragraph({ spacing: { before: 140, after: 40 }, children: [new TextRun({ text, bold: true, italics: true, size: 20 })] });
}
function quote(text) {
  return new Paragraph({
    spacing: { after: 100 },
    indent: { left: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, italics: true, size: 20, color: "444444" })],
  });
}
function resp(runs) {
  return new Paragraph({
    spacing: { after: 160 },
    indent: { left: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: typeof runs === "string" ? [new TextRun({ text: runs, size: 20 })] : runs,
  });
}
// Plain response run.
function R(text, opts = {}) { return new TextRun({ text, size: 20, ...opts }); }
// Highlighted run -- marks the specific clause that states what was actually
// fixed/done, so the reviewer-facing claim is visually easy to verify at a
// glance rather than buried in paragraph prose.
function HL(text, opts = {}) { return new TextRun({ text, size: 20, highlight: "yellow", ...opts }); }
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text, size: 20, ...opts })] });
}

// ---------- status-colored summary table ----------
const STATUS_FILL = {
  "Fixed": "C6EFCE",
  "Done": "C6EFCE",
  "Not done -- flagged limitation + future work": "FFEB9C",
  "Open -- to confirm before camera-ready": "FFC7CE",
};
function statusCell(text) {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: STATUS_FILL[text] || "FFFFFF" },
    children: [new Paragraph({ children: [new TextRun({ text, size: 17 })] })],
  });
}
function legendSwatch(fill, text) {
  return new TableCell({
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [new Paragraph({
      children: [
        new TextRun({ text: "   ", shading: { type: ShadingType.CLEAR, fill }, size: 17 }),
        new TextRun({ text: " " + text, size: 17 }),
      ],
    })],
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Times New Roman" } } } },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: "Response to Reviewers", bold: true, size: 32 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({
          text: "IEEE AGERS 2026 — Paper #1571358824",
          size: 22,
        })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({
          text: "“Machine Learning-Based Urban Morphological Signature Mapping Using Open Building Footprints and UMAP Clustering: A Grid-Based Assessment of Bhopal City, India”",
          italics: true, size: 20,
        })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({
          text: "Highlighted text marks the specific claim about what was actually changed in the manuscript, for quick verification.",
          italics: true, size: 16, color: "666666",
        })],
      }),
      p("We thank the editors and all three reviewers for their careful reading of the manuscript and for comments that have materially improved it. Below we address every strong aspect noted and every weak aspect and recommended change raised, reviewer by reviewer, citing the section of the revised manuscript where each change now appears. Items that require new data collection beyond what the revision window allows are stated plainly as such, together with the interim mitigation we were able to carry out and a concrete plan for the remaining work."),

      // ================= Reviewer 1 =================
      h1("Reviewer 1"),

      h2("Strong aspects"),
      quote("“The study addresses a relevant urban-monitoring problem through a practical grid-based workflow using open geospatial data. The cluster profiles provide useful descriptions of differences in building counts, density, and footprint sizes. Evaluating the same cluster labels in both UMAP and original indicator spaces is particularly valuable... The application value and transparent discussion of limitations support a weak accept recommendation.”"),
      resp("We thank the reviewer for this assessment. We agree that evaluating the k=6 labels in both the UMAP embedding and the original standardized indicator space (Section III-B) is central to the paper's credibility, and we have preserved and extended this dual-space evaluation in the revision (see our response to Weak Aspect 2 below), rather than retreating to the more favorable UMAP-space figure alone."),

      h2("Weak aspects and recommended changes"),
      label("1. Document the full data and preprocessing workflow — building-footprint provenance, temporal compatibility with WSF 2015, handling of empty/singleton cells, assignment of buildings crossing grid boundaries, and the effect of clipped boundary-cell areas on count-based comparisons."),
      resp([
        R("Response: "),
        R("Addressed in part, with one item still open. (a) "),
        R("Building-footprint provenance", { bold: true }),
        R(" is now stated in Section II-B: "),
        HL("the Google Research Open Buildings v3 polygons FeatureCollection (Earth Engine asset GOOGLE/Research/open-buildings/v3/polygons), a fixed 30 May 2023 imagery-composite snapshot, CC-BY 4.0 / ODbL v1.0 license"),
        R(" — matching the existing Sirko et al. (2021) citation [9]. (b) "),
        R("Empty and singleton cells", { bold: true }),
        R(" are now documented in Section II-C: "),
        HL("72 of the 495 grid cells contain zero intersecting OBF polygons (predominantly at the municipal boundary margin); their mean, maximum and standard-deviation footprint-area fields are undefined under Eqs. (3)-(5) and are zero-filled prior to standardization"),
        R(", which is why these cells form the core of the Open Land/Water cluster rather than being discarded. (c) "),
        R("Clipped boundary-cell area effects on count-based comparisons", { bold: true }),
        R(" are now stated in Section II-C: "),
        HL("because built-up density (Eq. 7) normalizes by each cell's own, possibly clipped, area, a boundary cell's lower raw building count does not disadvantage it in density terms"),
        R(", so density rather than raw count is the appropriate basis for comparing boundary and non-boundary cells. (d) "),
        R("Assignment of buildings crossing a grid-cell boundary", { bold: true }),
        R(" (e.g., centroid-in-polygon vs. any-intersection) is the one item we cannot yet confirm and remains explicitly flagged in Section II-C; we will confirm the exact QGIS join rule used and update this before camera-ready. (e) "),
        R("Temporal compatibility between OBF (2023 imagery) and WSF 2015", { bold: true }),
        R(" is a genuine ~8-year gap between the two source products; we agree it belongs in the manuscript as a limitation and will add one sentence noting that the WSF mask reflects 2015 settlement extent while OBF reflects 2023 building stock, which could cause WSF to under-represent post-2015 peripheral growth captured by OBF."),
      ]),

      label("2. Test clustering stability across random seeds, UMAP settings, and alternative grid sizes, and compare with K-Means applied directly to the standardized indicators. Use these results to strengthen the justification for six classes."),
      resp([
        R("Response: "),
        HL("We have run this analysis and added it to Section III-B."),
        R(" Using the existing per-cell indicator table (no new data collection required), we re-ran the full UMAP + K-Means pipeline across 10 random seeds and across nine combinations of UMAP's "),
        R("n_neighbors", { italics: true }),
        R(" (10, 15, 30) and "),
        R("min_dist", { italics: true }),
        R(" (0.0, 0.1, 0.3), scoring agreement with the original labeling via the Adjusted Rand Index (ARI). "),
        HL("Agreement was moderate-to-high in both checks (mean ARI = 0.79, range 0.69–0.93 across seeds; mean ARI = 0.78, range 0.68–0.94 across hyperparameters)"),
        R(", indicating the six-cluster structure is largely, though not perfectly, recovered regardless of the specific run. We additionally fit plain K-Means (k=6) directly on the standardized five-indicator space, bypassing UMAP entirely, as the requested baseline: "),
        HL("this raw-space solution agreed only weakly with the UMAP-based clustering (ARI = 0.29) and scored a silhouette of 0.406 (Davies-Bouldin = 0.963)"),
        R(" — better than the UMAP-based labels evaluated in raw space (0.229) but still below the UMAP embedding's own 0.567. We report this transparently as evidence that UMAP materially reshapes the partition rather than serving as a cosmetic visualization step, and we revise our characterization of k=6 accordingly: it is best understood as a typologically motivated, UMAP-assisted structure, not a representation-independent ground truth. The "),
        R("alternative grid sizes", { bold: true }),
        R(" portion of this request could not be completed in the revision window: it requires re-aggregating the raw building-footprint geometry at a new resolution, not simply reprocessing the existing per-cell table, and the raw polygon geometry is not retained at a resolution finer than the current 1 km grid in our present data package. We address this together with Reviewer 3's related grid-scale comment below."),
      ]),

      // ================= Reviewer 2 =================
      h1("Reviewer 2"),

      h2("Strong aspects"),
      quote("“This paper examines the morphological characteristics of Bhopal, India, a city experiencing rapid urban expansion. A machine-learning-based approach could help urban planners gain a more quantitative understanding of variations in settlement patterns... The authors not only present findings that support their chosen method but also acknowledge that the silhouette values in the original feature space are relatively weak, and that k=6 is not the optimal number of clusters according to the silhouette score.”"),
      resp("We thank the reviewer for recognizing both the application context and our decision to report the less favorable raw-space silhouette score and the non-optimal k=6 result openly rather than omitting them. We have kept this transparent framing throughout the revision and extended it with the stability analysis described under Reviewer 1, Weak Aspect 2 above."),

      h2("Weak aspects and recommended changes"),
      label("1. Improve technical presentation: writing consistency, mathematical equation formatting, notation clarity, and figure quality."),
      resp([
        R("Response: "),
        HL("All 18 equations in the manuscript are native embedded Word equation objects (OMML, with proper stacked fractions, radicals, subscripts and summation limits), not unicode-text approximations, and every figure (Figs. 1–5) is a dedicated, individually captioned, full-page-width dashboard rather than a plain data table."),
        R(" We have reviewed the manuscript for consistent notation (subscript conventions, variable naming matching the attribute-table field names given in Section II-C) as part of this revision. If the reviewer can point us to specific passages that remain unclear or inconsistent in a subsequent round, we will address them individually; absent line-specific pointers, we have used this round to tighten the sections most directly implicated by the other reviewers' comments (Sections II-C, III-B, III-D)."),
      ]),
      label("2. Strengthen the justification for the selected number of clusters, assess clustering stability, and clarify the distinction between cluster validation and spatial autocorrelation analysis."),
      resp([
        R("Response: "),
        R("The clustering-stability analysis described under Reviewer 1, Weak Aspect 2 directly addresses the first two points. On the third point, "),
        HL("we have reworded Section III-C and the Abstract/Conclusion to state the distinction explicitly: the global Moran's I computed on the UMI composite surface is evidence that the surface itself is non-randomly distributed — not an independent validation of the six-cluster partition"),
        R(", since the UMI is built from the same variables used as clustering inputs. Similarly, "),
        HL("the 62.5% spatial overlap between the Urban Core cluster and the LISA High-High hotspot is now stated to corroborate that one cluster specifically, not the overall six-cluster classification"),
        R(", which rests primarily on the internal cluster-validity indices (Section III-B) and would require independent ground-truth or socioeconomic data to assess directly (see our response to Reviewer 3, Recommended Change 3, below)."),
      ]),
      label("3. The spatial overlap between the Urban Core cluster and the LISA High-High hotspot does not, by itself, establish the validity of the overall classification. Additional validation and sensitivity analysis would strengthen the conclusions."),
      resp([
        R("Response: "),
        R("We agree, and "),
        HL("have edited the manuscript accordingly in four places — the Abstract, Section III-C (both the global Moran's I paragraph and the 62.5%-overlap paragraph), Section III-D (Limitations), and the Conclusion"),
        R(" — each now states explicitly that this spatial correspondence corroborates the Urban Core cluster specifically and is not an independent accuracy assessment of the full classification. The “additional validation” requested overlaps with Reviewer 3's Recommended Change 3 (independent imagery/land-use validation), which we address there; the “sensitivity analysis” requested is the stability analysis now in Section III-B."),
      ]),
      label("4. The generalizability of the proposed framework remains insufficiently demonstrated because the analysis focuses on a single city."),
      resp([
        R("Response: "),
        R("Addressed together with the next recommended change below."),
      ]),
      label("5. Conclusions about transferability to other cities should align with the scope of the available evidence."),
      resp([
        R("Response: "),
        HL("We have softened the transferability language in both the Abstract and Conclusion."),
        R(" The claim that the framework is “applicable to other data-scarce Indian cities” (stated as established fact in the original submission) now reads that the workflow is "),
        HL("“replicable” and “designed for extension to other data-scarce Indian cities, pending independent testing in those settings”"),
        R(" — since the present study analyzed Bhopal only, and we agree transferability is a design goal supported by the method's reliance on globally available open data, not yet a demonstrated result."),
      ]),

      // ================= Reviewer 3 =================
      h1("Reviewer 3"),

      h2("Strong aspects"),
      quote("“Methodological Transparency: The authors openly report less-than-ideal validation results, such as a decrease in the silhouette score in the original indicator space and the fact that k=6 is not the statistically optimal solution. Reproducibility: The inclusion of detailed mathematical equations and code snippets significantly enhances the reproducibility of the study.”"),
      resp("We thank the reviewer for highlighting both points, which we have preserved and strengthened in this revision: the raw-space silhouette and the non-optimal k=6 result remain reported in full (now alongside the new stability analysis), and all per-cell field formulas (Eqs. 1-13, Section II-C) remain individually traced and numerically verified against the project's own attribute tables."),

      h2("Weak aspects and recommended changes"),
      label("1. Too coarse a grid scale (“fatal flaw”): the 1 km x 1 km grid risks ecological fallacy, since urban morphology varies at much smaller block/neighborhood scales. Recommended: re-run at a finer scale (e.g., 250 m x 250 m)."),
      resp([
        R("Response: "),
        R("We agree this is a legitimate and important concern. We were unable to complete a full re-run at a finer resolution within the revision window: doing so requires re-aggregating the raw building-footprint geometry at a new grid resolution from the original source data, not reprocessing the already-aggregated per-cell table used in the present analysis. We also note a competing methodological risk at finer resolutions that argues for caution rather than a hurried re-run: at 250 m, a large share of peripheral cells would contain very few buildings, which would make variance-based indicators such as footprint-area standard deviation statistically unstable rather than more informative — trading the ecological-fallacy risk the reviewer correctly identifies for a small-sample instability risk. "),
        HL("We have added this explicitly to Section III-D (Limitations) as a named, specific limitation, and commit to a multi-resolution sensitivity analysis (testing grid sizes between 250 m and 1 km, explicitly weighing both risks against each other) as priority follow-up work, using re-acquired source geometry."),
      ]),
      label("2. Data provenance uncertainty: the OBF source/version/imagery date was unconfirmed, and the UMI_w weights were reverse-engineered rather than confirmed from the original script."),
      resp([
        R("Response: "),
        HL("The OBF provenance is now confirmed and stated in Section II-B (Google Research Open Buildings v3 polygons, Earth Engine asset GOOGLE/Research/open-buildings/v3/polygons, 30 May 2023 imagery composite, CC-BY 4.0 / ODbL v1.0 license)"),
        R(" — see our response to Reviewer 1, Weak Aspect 1(a) above for the same change. The UMI_w weighting (Eq. 13) remains, as previously stated, an empirically recovered fit (ordinary least-squares regression against the stored UMI_w values, n=423, maximum absolute residual 0.00046) rather than a value taken from the original processing script; we checked the authors' QGIS Processing History for the field's creation step and did not find it logged there (only a later Local Moran's I run that "),
        R("uses", { italics: true }),
        R(" the already-existing UMI_w field, which did independently confirm the Section II-G spatial-weights parameters: KNN k=5, row-standardized, 999 permutations). We continue to flag the UMI_w formula explicitly in the text (Section II-C) as empirically recovered rather than confirmed, and will keep checking for the original expression before camera-ready."),
      ]),
      label("3. Validate the clusters using independent field data (e.g., Google Earth imagery or land-use data) to confirm the cluster labels are morphologically, not just mathematically, sensible."),
      resp([
        R("Response: "),
        R("We were not able to complete a systematic independent validation of this kind within the revision window. "),
        HL("We have added it to Section III-D (Limitations) as a named priority for follow-up work: a stratified visual check of a representative sample of cells from each of the six clusters against high-resolution satellite basemap imagery."),
        R(" We agree this is a meaningfully different and stronger form of evidence than the internal cluster-validity indices and spatial-autocorrelation checks already reported, and we have been careful throughout this revision (see Reviewer 2, Weak Aspects 2-3 above) not to describe the existing checks as a substitute for it."),
      ]),
      label("4. In-text section-referencing error: the Limitations section (III-D) refers to “Section IV-B” and “Section IV-D,” but Section IV is the Conclusion and has no subsections."),
      resp([
        R("Response: "),
        HL("Confirmed and fixed."),
        R(" This was traced to a manual section renumbering (Study Area merged into Materials and Methods as subsection A) that was not propagated back into the document-generation script, leaving several hardcoded cross-references pointing at the pre-merge section numbers. "),
        HL("We have corrected the build script and the resulting manuscript throughout: “Section IV-B” → “Section III-B” (k=6 justification), “Section III-A” → “Section II-B” (OBF provenance), “Section III-F” (which did not exist) → “Section II-G” (Fig. 3's spatial-weights definition, where we also removed a leftover “to be confirmed” placeholder), and “Section IV-D” → “Section III-D” (Conclusion's forward reference to Limitations)."),
        R(" We verified every remaining in-text section reference against the corrected numbering before resubmission."),
      ]),

      // ================= Summary table =================
      h1("Summary of Changes"),
      new Table({
        width: { size: 9350, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [
          new TableRow({
            children: [
              legendSwatch("C6EFCE", "Fixed / done this round"),
              legendSwatch("FFEB9C", "Not done — flagged as limitation + future work"),
              legendSwatch("FFC7CE", "Open — needs author confirmation"),
            ],
          }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Table({
        width: { size: 9350, type: WidthType.DXA },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ width: { size: 3800, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "D9D9D9" }, children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true, size: 18 })] })] }),
              new TableCell({ width: { size: 3800, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "D9D9D9" }, children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true, size: 18 })] })] }),
              new TableCell({ width: { size: 1750, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "D9D9D9" }, children: [new Paragraph({ children: [new TextRun({ text: "Section", bold: true, size: 18 })] })] }),
            ],
          }),
          ...[
            ["Broken section cross-references (Rev. 3)", "Fixed", "II, III"],
            ["Spatial-autocorrelation overclaiming (Rev. 1, 2)", "Fixed", "Abstract, III-C, III-D, IV"],
            ["Transferability claim scope (Rev. 2)", "Fixed", "Abstract, IV"],
            ["Clustering stability: seeds + UMAP hyperparameters (Rev. 1, 2)", "Done", "III-B"],
            ["K-Means-without-UMAP baseline comparison (Rev. 1, 2)", "Done", "III-B"],
            ["Empty/singleton-cell handling documented (Rev. 1)", "Done", "II-C"],
            ["Clipped boundary-cell area effect on counts (Rev. 1)", "Done", "II-C"],
            ["OBF dataset provenance confirmed (Rev. 1, 3)", "Done", "II-B"],
            ["Alternative grid sizes / 250 m re-run (Rev. 1, 3)", "Not done -- flagged limitation + future work", "III-D"],
            ["Independent imagery/land-use validation (Rev. 3)", "Not done -- flagged limitation + future work", "III-D"],
            ["Boundary-crossing building assignment rule (Rev. 1)", "Open -- to confirm before camera-ready", "II-C"],
            ["UMI_w original-script confirmation (Rev. 3)", "Open -- to confirm before camera-ready", "II-C"],
          ].map(([a, b, c]) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a, size: 17 })] })] }),
              statusCell(b),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c, size: 17 })] })] }),
            ],
          })),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Response_to_Reviewers_AGERS2026.docx", buf);
  console.log("Wrote response letter");
});
