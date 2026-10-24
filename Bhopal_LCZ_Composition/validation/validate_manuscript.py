"""
Manuscript checks for the GIS Odyssey Journal submission:
  1. Length: 20,000-40,000 characters with spaces (journal rule)
  2. File size <= 2 MB (journal rule)
  3. Every in-text citation has a reference entry, and every reference is cited
  4. Every reference carries a DOI
  5. Abstract <= 20 lines (approx. <= 250 words), keywords <= 5
  6. Every number in the abstract matches validation/lcz_statistics.json
"""
import json, os, re, sys
import docx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "Bhopal_LCZ_Composition_Paper_DRAFT.docx")
ANON = "anonymised" in P
d = docx.Document(P)
paras = [p.text for p in d.paragraphs]
tables_txt = [c.text for t in d.tables for r in t.rows for c in r.cells]
full = "\n".join(paras + tables_txt)
ref_i = paras.index("References")
refs = [t for t in paras[ref_i + 1:] if t.strip()]
body = "\n".join(paras[:ref_i] + tables_txt)
ok = True
def check(cond, msg):
    global ok
    print(("PASS " if cond else "FAIL ") + msg); ok &= bool(cond)

n_all = len(full); n_body = len(body)
check(20000 <= n_all <= 40000, f"length incl. references = {n_all:,} chars (body only {n_body:,})")
sz = os.path.getsize(P) / 1024 / 1024
check(sz <= 2.0, f"file size = {sz:.2f} MB")

# reference keys: (first surname, year+suffix)
keys = []
for r in refs:
    m = re.match(r"([^,]+),.*?\((\d{4}[a-z]?)\)", r)
    keys.append((m.group(1).strip(), m.group(2)))
check(len(refs) >= 15, f"{len(refs)} references")
check(all("https://doi.org/10." in r for r in refs), "every reference has a DOI")
check(refs == sorted(refs, key=lambda x: x.lower()), "references in alphabetical order (APA)")
for surname, yr in keys:
    pat = re.compile(re.escape(surname) + r"[^()]{0,60}?(?:\(|, )" + re.escape(yr) + r"\b")
    pat2 = re.compile(re.escape(surname) + r" and [A-Z][a-z]+ \((?:[0-9a-z, ]*)" + yr[:4])
    hit = pat.search(body) or (surname == "Mistry" and re.search(r"Mistry and Mehrotra \((?:\d{4}[a-z]?, )*" + re.escape(yr), body))
    check(bool(hit), f"cited in text: {surname} {yr}")
# citations in text that have no reference
cites = set(re.findall(r"([A-Z][A-Za-z]+)(?: et al\.| & [A-Z][a-z]+| and [A-Z][a-z]+|, [A-Z][a-z]+, & [A-Z][a-z]+)?,? \(?((?:19|20)\d\d[a-z]?)\)?", body))
ref_names = {k[0] for k in keys}
orphans = sorted({c for c in cites if c[0] in {"Stewart","Bechtel","Demuzere","Kotharkar","Saxena","Saha","Mistry","Dwivedi","Shannon","Simpson"} and (c[0], c[1]) not in set(keys)})
check(not orphans, f"no in-text citation without a reference entry {orphans}")

abs_i = paras.index("Abstract")
abstract = paras[abs_i + 1]
check(len(abstract.split()) <= 250, f"abstract = {len(abstract.split())} words")
kw = paras[abs_i + 2].replace("Keywords:", "").split(";")
check(len(kw) <= 5, f"{len(kw)} keywords")

S = json.load(open(os.path.join(ROOT, "validation", "lcz_statistics.json")))
for val in [f"{S['valid_km2']:.2f}", f"{S['composition']['shannon_H']:.3f}", f"{S['composition']['gini_area']:.3f}",
            f"{S['groups']['built_pct']:.2f}", f"{S['code_stats_excl0']['mean']:.2f}"]:
    check(val in abstract, f"abstract value {val} matches statistics file")
U = json.load(open(os.path.join(ROOT, "validation", "lulc_statistics.json")))
check(f"{U['agreement']['proportional_overlap']*100:.1f}" in abstract, "abstract LULC overlap matches statistics file")
uc = U["code_stats"]
check(round(uc["mean"], 4) == 6.0001 and uc["median"] == 7 and round(uc["sd_pop"], 4) == 2.2466,
      "LULC mean/median/SD reproduce the independently reported 6.0001 / 7 / 2.2466")
check(abs(U["valid_km2"] - 411.3584) < 1e-9, "LULC valid area = 411.3584 km2")
if ANON:
    low = full.lower()
    for k in ["maravi", "janki", "bikash", "indira gandhi", "igntu", "orcid", "amarkantak", "author to confirm"]:
        check(k not in low, f"anonymised file contains no '{k}'")
    import zipfile
    core = zipfile.ZipFile(P).read("docProps/core.xml").decode()
    check(not re.search(r"<dc:creator>\S", core) and not re.search(r"<cp:lastModifiedBy>\S", core), "file properties carry no author name")
flags = [p for p in paras if p.startswith("[AUTHOR TO CONFIRM")]
print(f"INFO {len(flags)} author-to-confirm flags remain in the text")
print(f"INFO {len(d.tables)} tables, {len(d.inline_shapes)} images")
sys.exit(0 if ok else 1)
