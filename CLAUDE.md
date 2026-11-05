# Standing lessons for academic paper drafting (Mukul Maravi, IGNTU)

These apply to every future paper build (AHP-GIS, LCZ, WSF, LST, UHI, urban-morphology, etc.)
in this repo. Read before writing a new draft.

## 1. Don't repeat boilerplate caveats verbatim

Noticed across the LCZ, WSF and LST drafts: a qualifying phrase (e.g. "0 values
outside my study area", "this is a descriptive statistic, not a physical
measurement") gets repeated near-verbatim many times through the manuscript.
State a caveat fully once, where it first matters, then refer back to it
briefly ("as noted in Section X") instead of restating the full sentence again.
Vary wording if it must reappear. This was already hand-corrected once by the
user's senior for the LCZ paper — don't reintroduce it in new drafts.

## 2. Lessons from the ChatGPT technical review of the Bhopal LCZ paper

Apply these to any paper that compares two independently produced
classification/raster products, uses categorical class-code statistics, or
reports area/validation-style metrics:

- **Never call a cross-dataset compositional comparison "validation" or
  "accuracy"** unless there is an independent reference sample with a
  documented sampling design and a confusion matrix (overall/producer's/user's
  accuracy). A proportional-overlap number between two classification products
  is a "compositional consistency check," not accuracy.
- **Separate statistics on categorical class codes from physical
  measurements.** Mean/SD/median of numeric class codes (e.g. LCZ codes 1–13)
  describe the coding, not urban form, height, or climate — say so once,
  clearly, near the table, not repeatedly.
- **Verify background/NoData masks rigorously.** Spot-checking a few
  zero-valued pixels against the study boundary is not proof that all
  zero/background pixels fall outside it. Where possible, check this
  systematically (boundary polygon vs. raster mask) before excluding pixels
  from reported stats, and say what was actually checked.
- **Equations must render as real editable equation objects** in the final
  .docx (OMML via docx-js `Math`/`OMath`, as already established), never as
  blank/missing numbers — verify this before delivery (the splice/export step
  should be checked for this explicitly, not assumed).
- **Dataset DOI vs. article DOI**: cite the dataset's own DOI (e.g. a Zenodo
  record) separately from the journal article DOI describing it, when both
  exist.
- **Name the exact product/band used**, not just the paper that describes the
  general dataset (e.g. "LCZ_Filter band" vs. raw LCZ band; exact LULC product
  / access link; exact boundary dataset name, provider, version, date).
- **Note resampling/reprojection effects on cell size** explicitly (e.g. a
  ~100 m global product becoming 95.1595 m after reprojection) rather than
  presenting the reprojected cell size as the dataset's native resolution.
- **Hedge conclusions to match what the analysis actually establishes.** Avoid
  language like "validates," "credible picture," or treating an absence of a
  class in a coarse global product as proof the class is physically absent on
  the ground.
- **Figures**: legible label/axis font size at final print size, captions that
  describe every panel (not just one), no embedded crowding metadata inside a
  map layout, ≥300 dpi exports, consistent source note.
- **Reproducibility claims must be true**: if a script/table is said to be
  "available on request," either include it as supplementary material or
  don't claim it's ready to share unless it actually is.
- **Double-anonymized submission prep** (when the target journal requires it):
  keep author names/affiliations/acknowledgments in a separate title-page
  file, strip identifying metadata from the manuscript file properties.

## 3. Established build pattern (carry forward)

- MDPI-style templates: use `externalStyles` from the real template's
  `word/styles.xml`, apply named `MDPI_*` style IDs directly on `Paragraph`s —
  don't hand-roll formatting.
- Equations: native OMML via docx-js `Math` API, laid out in the 2-column
  borderless equation-number table pattern, not plain text.
- First-page header/journal logo: splice `header1/2/3.xml` + `footer1.xml`
  (plus their rels, media, Content_Types overrides, and
  `headerReference`/`footerReference`/`titlePg` on `sectPr`) from the real
  template — don't skip this, the logo row above the title is part of the
  template's visual identity.
- Figures: size `ImageRun` to the true pixel aspect ratio of the source image,
  scaled to fit the page's actual printable column width — never stretch to
  an arbitrary width/height pair.
- Result visualizations: rebuild from the real underlying data (matplotlib,
  following the `dataviz` skill's categorical palette and validator) — never
  screenshot or copy-paste a source figure, except GIS maps the user has
  explicitly said to reuse as-is.
- Never fabricate statistics, citations, or DOIs. Flag discrepancies in the
  source data explicitly rather than silently resolving them.
