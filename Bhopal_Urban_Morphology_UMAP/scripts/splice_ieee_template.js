const fs = require("fs");
const path = require("path");
const JSZip = require("/opt/node-tools/node_modules/jszip/lib/index.js");

const DOCX = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/Bhopal_Urban_Morphology_FullPaper_DRAFT.docx";
const TPL = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/ieee_template/extracted";

async function main() {
  const buf = fs.readFileSync(DOCX);
  const zip = await JSZip.loadAsync(buf);

  // 1. Copy the template's footer1.xml in verbatim (IEEE copyright-line
  // placeholder, first-page only).
  const footerXml = fs.readFileSync(`${TPL}/word/footer1.xml`, "utf-8");
  zip.file("word/footer1.xml", footerXml);

  // 2. Add a relationship for it in document.xml.rels (next free rId).
  let rels = await zip.file("word/_rels/document.xml.rels").async("string");
  const existingIds = [...rels.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1], 10));
  const nextId = Math.max(0, ...existingIds) + 1;
  const footerRelId = `rId${nextId}`;
  rels = rels.replace(
    "</Relationships>",
    `<Relationship Id="${footerRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`
  );
  zip.file("word/_rels/document.xml.rels", rels);

  // 3. Content-Types override for the footer part.
  let ct = await zip.file("[Content_Types].xml").async("string");
  if (!ct.includes("/word/footer1.xml")) {
    ct = ct.replace(
      "</Types>",
      `<Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" PartName="/word/footer1.xml"/></Types>`
    );
    zip.file("[Content_Types].xml", ct);
  }

  // 4. Insert footerReference (first-page only) + titlePg into the FIRST
  // sectPr in document order (the title/authors/abstract section).
  let doc = await zip.file("word/document.xml").async("string");
  const firstSectPrOpen = doc.indexOf("<w:sectPr");
  if (firstSectPrOpen === -1) throw new Error("no sectPr found");
  const openTagEnd = doc.indexOf(">", firstSectPrOpen) + 1;
  const insert = `<w:footerReference w:type="first" r:id="${footerRelId}"/><w:titlePg/>`;
  doc = doc.slice(0, openTagEnd) + insert + doc.slice(openTagEnd);
  zip.file("word/document.xml", doc);

  // 5. Replace numbering.xml wholesale with the template's own -- this is
  // what makes Heading1/Heading2/figurecaption/references' embedded numPr
  // (numId 4/2/8, referencing abstractNum 16/19/18) resolve to real "I.",
  // "A.", "Fig. N." and "[n]" auto-numbering instead of showing nothing.
  const numberingXml = fs.readFileSync(`${TPL}/word/numbering.xml`, "utf-8");
  zip.file("word/numbering.xml", numberingXml);

  // 6. Write back out as a clean OPC zip (no directory entries, matching
  // the structure docx-js itself produces) -- STORE/DEFLATE per entry,
  // no directory records, which is what broke the previous CLI-zip splice.
  const outBuf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    platform: "UNIX",
  });
  fs.writeFileSync(DOCX, outBuf);
  console.log("Spliced footer + numbering.xml into", DOCX);
}

main().catch((err) => { console.error(err); process.exit(1); });
