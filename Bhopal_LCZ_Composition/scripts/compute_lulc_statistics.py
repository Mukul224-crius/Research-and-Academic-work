"""
Statistics for the 10 m Esri / Impact Observatory LULC 2017 layer
(LULC_2017_clipped.tif) from ONLY its QGIS unique-values report
(data/lulc2017_unique_values_report.csv; 2850 x 2550 px, NoData 3,153,916 px),
plus a harmonised cross-comparison with the LCZ statistics.

Output: validation/lulc_statistics.json, validation/lulc_statistics.txt
"""
import csv
import json
import math
import os

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIXEL = 10.0
WIDTH, HEIGHT, NODATA = 2850, 2550, 3153916
NAMES = {1: "Water", 2: "Trees", 4: "Flooded vegetation", 5: "Crops", 7: "Built area",
         8: "Bare ground", 9: "Snow/ice", 10: "Clouds", 11: "Rangeland"}

rows = []
with open(os.path.join(ROOT, "data", "lulc2017_unique_values_report.csv")) as f:
    for r in csv.DictReader(f):
        rows.append((int(r["value"]), int(r["pixel_count"]), float(r["area_m2"])))
for v, n, a in rows:
    assert n * PIXEL * PIXEL == a, (v, n, a)            # check 1: area column
vals = np.array([r[0] for r in rows]); cnt = np.array([r[1] for r in rows])
N = int(cnt.sum())
assert N + NODATA == WIDTH * HEIGHT == 7267500            # check 2: valid + NoData = raster size
area = cnt * PIXEL * PIXEL / 1e6
p = cnt / N

mean = float((vals * cnt).sum() / N)
var_pop = float((cnt * (vals - mean) ** 2).sum() / N)
var_smp = float((cnt * (vals - mean) ** 2).sum() / (N - 1))
cum = np.cumsum(cnt)
pos = lambda k: int(vals[np.searchsorted(cum, k)])
median = (pos(N / 2) + pos(N / 2 + 1)) / 2 if N % 2 == 0 else pos((N + 1) / 2)
code = dict(n=N, min=int(vals.min()), max=int(vals.max()), mean=mean, median=median,
            mode=int(vals[np.argmax(cnt)]), q1=pos(math.ceil(0.25 * N)), q3=pos(math.ceil(0.75 * N)),
            sd_pop=math.sqrt(var_pop), sd_sample=math.sqrt(var_smp), cv_pct=math.sqrt(var_pop) / mean * 100)

x = area
area_stats = dict(n=int(x.size), mean=float(x.mean()), median=float(np.median(x)), sd_pop=float(x.std()),
                  sd_sample=float(x.std(ddof=1)), cv_pct=float(x.std() / x.mean() * 100), min=float(x.min()),
                  max=float(x.max()), total=float(x.sum()))

H = float(-(p * np.log(p)).sum())
srt = np.sort(area); nC = srt.size
comp = dict(shannon_H=H, pielou_J=H / math.log(len(p)), gini_simpson=float(1 - (p ** 2).sum()),
            inverse_simpson=float(1 / (p ** 2).sum()), hill_N1=math.exp(H), berger_parker=float(p.max()),
            gini_area=float((2 * np.arange(1, nC + 1) - nC - 1).dot(srt) / (nC * srt.sum())))

classes = [dict(value=int(v), name=NAMES[int(v)], pixels=int(n), area_km2=float(a), pct=float(pp * 100))
           for v, n, a, pp in zip(vals, cnt, area, p)]

# ---- harmonised comparison with the LCZ layer ----
L = json.load(open(os.path.join(ROOT, "validation", "lcz_statistics.json")))
g = L["groups"]
lulc_by = {c["value"]: c["area_km2"] for c in classes}
harm = [
    ("Built", g["built_km2"], lulc_by[7], "LCZ 1–10", "Built area (7)"),
    ("Vegetated", g["vegetation_km2"], lulc_by[2] + lulc_by[4] + lulc_by[5] + lulc_by[11], "LCZ 11–14", "Trees, Flooded veg., Crops, Rangeland (2, 4, 5, 11)"),
    ("Bare", g["bare_km2"], lulc_by[8], "LCZ 15–16", "Bare ground (8)"),
    ("Water", g["water_km2"], lulc_by[1], "LCZ 17", "Water (1)"),
]
harmonised = []
for name, a_lcz, a_lulc, d_lcz, d_lulc in harm:
    harmonised.append(dict(group=name, lcz_classes=d_lcz, lulc_classes=d_lulc,
                           lcz_km2=a_lcz, lulc_km2=a_lulc,
                           lcz_pct=a_lcz / L["valid_km2"] * 100, lulc_pct=a_lulc / area.sum() * 100,
                           diff_pp=a_lcz / L["valid_km2"] * 100 - a_lulc / area.sum() * 100,
                           ratio=a_lcz / a_lulc))
# overall proportional agreement between the two 4-group compositions
pl = np.array([h["lcz_pct"] for h in harmonised]) / 100
pu = np.array([h["lulc_pct"] for h in harmonised]) / 100
overlap = float(np.minimum(pl, pu).sum())                  # proportional similarity (1 - dissimilarity index)
mid = (pl + pu) / 2
kl = lambda a, b: float((a * np.log(a / b)).sum())
jsd = (kl(pl, mid) + kl(pu, mid)) / 2 / math.log(2)        # Jensen-Shannon divergence, bits (0-1)

out = dict(pixel_size_m=PIXEL, total_pixels=WIDTH * HEIGHT, nodata_pixels=NODATA,
           extent_km2=WIDTH * HEIGHT * PIXEL ** 2 / 1e6, nodata_km2=NODATA * PIXEL ** 2 / 1e6,
           valid_pixels=N, valid_km2=float(area.sum()), valid_pct=N / (WIDTH * HEIGHT) * 100,
           n_classes=len(classes), classes=classes, code_stats=code, class_area_stats_km2=area_stats,
           composition=comp, harmonised=harmonised,
           agreement=dict(proportional_overlap=overlap, dissimilarity_index=1 - overlap, jensen_shannon_bits=jsd),
           extent_difference_km2=L["valid_km2"] - float(area.sum()),
           extent_difference_pct=(L["valid_km2"] - float(area.sum())) / float(area.sum()) * 100)
json.dump(out, open(os.path.join(ROOT, "validation", "lulc_statistics.json"), "w"), indent=2)

lines = [f"LULC 2017 (10 m): extent {out['extent_km2']:.4f} km2, valid {N} px = {area.sum():.4f} km2 "
         f"({out['valid_pct']:.2f}%), NoData {out['nodata_km2']:.4f} km2"]
for c in classes:
    lines.append(f"{c['value']:>3} {c['name']:<20} {c['pixels']:>9} {c['area_km2']:>10.4f} km2 {c['pct']:>6.2f}%")
lines.append(f"Codes: mean={mean:.4f} median={median} mode={code['mode']} Q1={code['q1']} Q3={code['q3']} "
             f"SDpop={code['sd_pop']:.4f} SDsample={code['sd_sample']:.4f} CV={code['cv_pct']:.2f}%")
lines.append("Class areas: " + ", ".join(f"{k}={v:.3f}" for k, v in area_stats.items()))
lines.append("Composition: " + ", ".join(f"{k}={v:.4f}" for k, v in comp.items()))
for h in harmonised:
    lines.append(f"{h['group']:<10} LCZ {h['lcz_km2']:8.3f} km2 ({h['lcz_pct']:5.2f}%)  LULC {h['lulc_km2']:8.3f} km2 "
                 f"({h['lulc_pct']:5.2f}%)  diff {h['diff_pp']:+6.2f} pp  ratio {h['ratio']:.3f}")
lines.append(f"Agreement: overlap={overlap:.4f}, dissimilarity={1-overlap:.4f}, JSD={jsd:.4f} bits")
lines.append(f"Valid extent LCZ - LULC = {out['extent_difference_km2']:.3f} km2 ({out['extent_difference_pct']:.2f}%)")
txt = "\n".join(lines)
open(os.path.join(ROOT, "validation", "lulc_statistics.txt"), "w").write(txt + "\n")
print(txt)
