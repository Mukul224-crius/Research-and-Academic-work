const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DOCX = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Bhopal_Urban_Morphology_FullPaper_DRAFT.docx";
const TPL = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/ieee_template/extracted";
const WORK = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/scripts/.splice_work";

if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
execSync(`unzip -q "${DOCX}" -d "${WORK}"`);

// 1. Copy the template's footer1.xml in verbatim (IEEE copyright-line
// placeholder, first-page only).
fs.copyFileSync(`${TPL}/word/footer1.xml`, `${WORK}/word/footer1.xml`);

// 2. Add a relationship for it in document.xml.rels (next free rId).
const relsPath = `${WORK}/word/_rels/document.xml.rels`;
let rels = fs.readFileSync(relsPath, "utf-8");
const existingIds = [...rels.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1], 10));
const nextId = Math.max(0, ...existingIds) + 1;
const footerRelId = `rId${nextId}`;
rels = rels.replace(
  "</Relationships>",
  `<Relationship Id="${footerRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`
);
fs.writeFileSync(relsPath, rels);

// 3. Content-Types override for the footer part.
const ctPath = `${WORK}/[Content_Types].xml`;
let ct = fs.readFileSync(ctPath, "utf-8");
if (!ct.includes("/word/footer1.xml")) {
  ct = ct.replace(
    "</Types>",
    `<Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" PartName="/word/footer1.xml"/></Types>`
  );
  fs.writeFileSync(ctPath, ct);
}

// 4. Insert footerReference (first-page only) + titlePg into the FIRST
// sectPr in document order -- that's the end of the title/authors/abstract
// section, since our sections are emitted in document order and only the
// first one should carry the IEEE copyright-line footer.
const docPath = `${WORK}/word/document.xml`;
let doc = fs.readFileSync(docPath, "utf-8");
const firstSectPrOpen = doc.indexOf("<w:sectPr");
if (firstSectPrOpen === -1) throw new Error("no sectPr found");
const openTagEnd = doc.indexOf(">", firstSectPrOpen) + 1;
const insert = `<w:footerReference w:type="first" r:id="${footerRelId}"/><w:titlePg/>`;
doc = doc.slice(0, openTagEnd) + insert + doc.slice(openTagEnd);
fs.writeFileSync(docPath, doc);

// 5. Replace numbering.xml wholesale with the template's own -- this is
// what makes Heading1/Heading2/figurecaption/references' embedded numPr
// (numId 4/2/8, referencing abstractNum 16/19/18) resolve to real "I.",
// "A.", "Fig. N." and "[n]" auto-numbering instead of showing nothing.
fs.copyFileSync(`${TPL}/word/numbering.xml`, `${WORK}/word/numbering.xml`);

// 6. Re-zip (must re-add [Content_Types].xml first per OOXML convention,
// though most readers tolerate any order).
if (fs.existsSync(DOCX)) fs.unlinkSync(DOCX);
execSync(`cd "${WORK}" && zip -q -X -r "${DOCX}" "[Content_Types].xml" _rels docProps word customXml`);
fs.rmSync(WORK, { recursive: true });
console.log("Spliced footer + numbering.xml into", DOCX);
