const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");

function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text, size: 24, ...opts })] });
}
function pRuns(runs, opts = {}) {
  return new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.JUSTIFIED, ...opts, children: runs });
}
function R(text, opts = {}) { return new TextRun({ text, size: 24, ...opts }); }

const TITLE = "Machine Learning-Based Urban Morphological Signature Mapping Using Open Building Footprints and UMAP Clustering: A Grid-Based Assessment in BhopalCity";

const doc = new Document({
  styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      pRuns([R("Covering Letter for IEEE AGERS 2026 (2026 IEEE Asia-Pacific Conference on Geoscience, Electronics and Remote Sensing Technology), Camera-Ready Manuscript Submission", { bold: true })]),

      p("To"),
      p("The Editorial Board / Organizing Committee"),
      p("IEEE AGERS 2026 (2026 IEEE Asia-Pacific Conference on Geoscience, Electronics and Remote Sensing Technology)"),

      pRuns([R("[Sub: Submission of Revised Camera-Ready Manuscript and Reviewer Response; Paper ID #1571358824; Dated 23/11/2026]", {})], { alignment: AlignmentType.RIGHT }),

      p("Dear AGERS 2026 Organizing Committee,"),

      p(`We are pleased to submit the revised camera-ready manuscript of our accepted paper entitled “${TITLE}” (Paper ID #1571358824) for inclusion in the proceedings of IEEE AGERS 2026, following the reviewers' comments and the Editorial Board's acceptance notification.`),

      p("This study develops a machine-learning framework for grid-based urban morphological signature mapping, integrating Open Building Footprints (143,864 structures) and World Settlement Footprint data within a 1 km x 1 km analytical grid (495 cells) covering Bhopal City, India. Five morphological indicators -- building count, density, and mean/maximum/standard-deviation of footprint area -- were standardized, projected using UMAP, and partitioned into six interpretable urban morphological signatures using K-Means clustering."),

      p("Cluster validity was independently assessed using silhouette and Davies-Bouldin indices in both the UMAP embedding and the original indicator space, together with a stability analysis across random seeds and UMAP hyperparameters, and a comparison against K-Means applied directly to the standardized indicators. Spatial coherence was further verified using global and local Moran's I under an explicitly defined contiguity structure: the Urban Core cluster overlapped 62.5% with the statistically significant Local Moran's I High-High cluster, corroborating a genuine, non-random concentration of built form. All reviewer recommendations have been addressed in this revision; the limitations that could not be resolved within the revision window -- specifically, testing at a finer (250 m) grid resolution and independent validation against ground-truth imagery -- are explicitly disclosed as priority future work rather than presented as completed."),

      p("We believe this study is well suited to IEEE AGERS 2026 because it applies an open-data, machine-learning framework to a geoscience and remote-sensing problem of direct relevance to the conference: quantifying urban morphological heterogeneity in a data-scarce Tier-II Indian city using globally available building-footprint and settlement-extent products. The reproducible, transparently validated workflow offers a low-cost method for morphology-based urban monitoring that is readily extensible to other developing-country cities."),

      p("We confirm that the manuscript is original, has not been published previously, and is not under consideration elsewhere. All authors have reviewed and approved this submission. Conflict of Interest: The authors declare no conflicts of interest. Funding: This research received no external funding."),

      p("Thank you very much for your time and consideration."),

      p("Sincerely,"),
      pRuns([R("Corresponding author", { bold: true })]),
      p("Mukul Maravi"),
      p("Department of Geography, Faculty of Earth Science"),
      p("Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh, India, 484887"),
      pRuns([
        R("Email: "), R("research.mukul.maravi@igntu.ac.in", { color: "0563C1" }),
        R("; ORCID ID: "), R("https://orcid.org/0009-0004-4960-9666", { color: "0563C1" }),
      ]),

      new Paragraph({ text: "", spacing: { after: 200 } }),
      p("On behalf of co-authors:"),
      p("Dr. Janki Prasad, Department of Geography, Faculty of Earth Science, Indira Gandhi National Tribal University, Amarkantak"),
      p("Bikash Das (IEEE Member), Department of Geography, Faculty of Earth Science, Indira Gandhi National Tribal University, Amarkantak"),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Covering_Letter_AGERS2026.docx";
  fs.writeFileSync(out, buf);
  console.log("Wrote", out);
});
