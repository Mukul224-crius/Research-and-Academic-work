"""
Computes every statistic used in the Bhopal LCZ paper from ONE source only:
the QGIS "Raster layer unique values report" for CLIP_LCZ.tif (band 1),
saved verbatim in data/lcz_unique_values_report.csv.

Nothing here is assumed or invented: every number is derived from the 14
(value, pixel_count) pairs plus the reported pixel size (95.1595 m).

Outputs:
  validation/lcz_statistics.json   <- machine-readable, consumed by build_paper.js
  validation/lcz_statistics.txt    <- human-readable summary
"""
import csv
import json
import math
import os

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIXEL = 95.1595  # m, from the QGIS report ("units per pixel 95.1595")
QGIS_MEAN, QGIS_SD = 5.54485, 5.9331  # values reported in QGIS layer metadata

NAMES = {
    1: "Compact high-rise", 2: "Compact mid-rise", 3: "Compact low-rise",
    4: "Open high-rise", 5: "Open mid-rise", 6: "Open low-rise",
    7: "Lightweight low-rise", 8: "Large low-rise", 9: "Sparsely built",
    10: "Heavy industry", 11: "Dense trees (A)", 12: "Scattered trees (B)",
    13: "Bush, scrub (C)", 14: "Low plants (D)", 15: "Bare rock or paved (E)",
    16: "Bare soil or sand (F)", 17: "Water (G)",
}

rows = []
with open(os.path.join(ROOT, "data", "lcz_unique_values_report.csv")) as f:
    for r in csv.DictReader(f):
        rows.append((int(r["value"]), int(r["pixel_count"]), float(r["area_m2"])))

pix_area = PIXEL * PIXEL
# Integrity check 1: QGIS area column == pixel_count * pixel_area
for v, n, a in rows:
    assert abs(n * pix_area - a) / a < 1e-6, (v, n, a)

total_pixels = sum(n for _, n, _ in rows)
assert total_pixels == 302 * 275 == 83050  # width x height from the report

valid = [(v, n) for v, n, _ in rows if v != 0]
n_valid = sum(n for _, n in valid)
values = np.array([v for v, _ in valid])
counts = np.array([n for _, n in valid])
area_km2 = counts * pix_area / 1e6
p = counts / n_valid


def weighted_stats(vals, wts):
    vals = np.asarray(vals, float)
    wts = np.asarray(wts, float)
    N = wts.sum()
    mean = (vals * wts).sum() / N
    var_pop = (wts * (vals - mean) ** 2).sum() / N
    var_smp = (wts * (vals - mean) ** 2).sum() / (N - 1)
    cum = np.cumsum(wts)

    def quantile_pos(k):  # value at 1-based sorted position k
        return vals[np.searchsorted(cum, k)]

    # median: average of the two middle positions (N even) or the middle (N odd)
    if int(N) % 2 == 0:
        median = (quantile_pos(N / 2) + quantile_pos(N / 2 + 1)) / 2
    else:
        median = quantile_pos((N + 1) / 2)
    q1 = quantile_pos(math.ceil(0.25 * N))
    q3 = quantile_pos(math.ceil(0.75 * N))
    mode = vals[np.argmax(wts)]
    return dict(n=int(N), min=float(vals.min()), max=float(vals.max()), mean=float(mean),
                median=float(median), mode=float(mode), q1=float(q1), q3=float(q3),
                sd_pop=float(math.sqrt(var_pop)), sd_sample=float(math.sqrt(var_smp)),
                cv_pct=float(math.sqrt(var_pop) / mean * 100))


all_vals = [v for v, _, _ in rows]
all_cnts = [n for _, n, _ in rows]
code_incl0 = weighted_stats(all_vals, all_cnts)
code_excl0 = weighted_stats(values, counts)

# Integrity check 2: reproduce QGIS-reported mean/SD (incl. 0) to its printed precision
assert abs(code_incl0["mean"] - QGIS_MEAN) < 5e-5, code_incl0["mean"]
assert abs(code_incl0["sd_pop"] - QGIS_SD) < 5e-4, code_incl0["sd_pop"]


def plain_stats(x):
    x = np.asarray(x, float)
    m = x.mean()
    sd_p = x.std(ddof=0)
    sd_s = x.std(ddof=1)
    skew = ((x - m) ** 3).mean() / sd_p ** 3
    return dict(n=int(x.size), mean=float(m), median=float(np.median(x)), sd_pop=float(sd_p),
                sd_sample=float(sd_s), cv_pct=float(sd_p / m * 100), min=float(x.min()),
                max=float(x.max()), q1=float(np.percentile(x, 25)), q3=float(np.percentile(x, 75)),
                skewness=float(skew), total=float(x.sum()))


area_stats = plain_stats(area_km2)
pct_stats = plain_stats(p * 100)

# ---- Landscape-composition (categorical) metrics ----
H = float(-(p * np.log(p)).sum())                 # Shannon entropy (nats)
H_max_obs = math.log(len(p))                      # ln(13)
H_max_all = math.log(17)                          # ln(17) - full LCZ typology
J_obs = H / H_max_obs                             # Pielou evenness vs observed classes
J_all = H / H_max_all                             # evenness vs full 17-class scheme
simpson = float(1 - (p ** 2).sum())               # Gini-Simpson diversity
inv_simpson = float(1 / (p ** 2).sum())           # effective number of classes (order 2)
hill1 = math.exp(H)                               # effective number of classes (order 1)
berger_parker = float(p.max())                    # dominance of the largest class
srt = np.sort(area_km2)
nC = srt.size
gini = float((2 * np.arange(1, nC + 1) - nC - 1).dot(srt) / (nC * srt.sum()))

order = np.argsort(-area_km2)
cum_share = np.cumsum(p[order]) * 100
k80 = int(np.searchsorted(cum_share, 80) + 1)     # classes needed to reach 80 % of area

built_mask = values <= 10
built_km2 = float(area_km2[built_mask].sum())
nat_km2 = float(area_km2[~built_mask].sum())
compact_km2 = float(area_km2[np.isin(values, [1, 2, 3])].sum())
open_km2 = float(area_km2[np.isin(values, [4, 5, 6])].sum())
other_built_km2 = float(area_km2[np.isin(values, [7, 8, 9, 10])].sum())
veg_km2 = float(area_km2[np.isin(values, [11, 12, 13, 14])].sum())
bare_km2 = float(area_km2[np.isin(values, [15, 16])].sum())
water_km2 = float(area_km2[values == 17].sum())

# Shannon of built classes only (internal heterogeneity of the built fabric)
pb = counts[built_mask] / counts[built_mask].sum()
H_built = float(-(pb * np.log(pb)).sum())
pn = counts[~built_mask] / counts[~built_mask].sum()
H_nat = float(-(pn * np.log(pn)).sum())

zero_km2 = 36774 * pix_area / 1e6
extent_km2 = total_pixels * pix_area / 1e6

classes = []
rank = {int(values[i]): r + 1 for r, i in enumerate(order)}
for v, n, a, pp in zip(values, counts, area_km2, p):
    classes.append(dict(lcz=int(v), name=NAMES[int(v)], pixels=int(n), area_km2=float(a),
                        pct=float(pp * 100), rank=rank[int(v)],
                        group="Built" if v <= 10 else "Land cover"))

out = dict(
    pixel_size_m=PIXEL, pixel_area_m2=pix_area, total_pixels=total_pixels,
    extent_km2=extent_km2, zero_pixels=36774, zero_km2=zero_km2,
    zero_pct_of_extent=36774 / total_pixels * 100,
    valid_pixels=n_valid, valid_km2=float(area_km2.sum()), n_classes=int(len(values)),
    absent_classes=[c for c in range(1, 18) if c not in values],
    classes=classes,
    code_stats_incl0=code_incl0, code_stats_excl0=code_excl0,
    class_area_stats_km2=area_stats, class_area_stats_pct=pct_stats,
    composition=dict(shannon_H=H, H_max_observed=H_max_obs, H_max_17=H_max_all,
                     pielou_J_observed=J_obs, pielou_J_17=J_all, gini_simpson=simpson,
                     inverse_simpson=inv_simpson, hill_N1=hill1, berger_parker=berger_parker,
                     gini_area=gini, classes_to_80pct=k80, top2_share_pct=float(cum_share[1]),
                     shannon_built=H_built, shannon_landcover=H_nat),
    groups=dict(built_km2=built_km2, landcover_km2=nat_km2,
                built_pct=built_km2 / area_km2.sum() * 100,
                landcover_pct=nat_km2 / area_km2.sum() * 100,
                built_to_landcover_ratio=built_km2 / nat_km2,
                compact_km2=compact_km2, open_km2=open_km2, other_built_km2=other_built_km2,
                vegetation_km2=veg_km2, bare_km2=bare_km2, water_km2=water_km2,
                open_to_compact_ratio=open_km2 / compact_km2),
    cumulative_share_by_rank=[dict(lcz=int(values[i]), cum_pct=float(c)) for i, c in zip(order, cum_share)],
    checks=dict(area_column_matches_pixel_count=True, total_pixels_matches_width_x_height=True,
                qgis_mean_reproduced=True, qgis_sd_reproduced=True),
)

with open(os.path.join(ROOT, "validation", "lcz_statistics.json"), "w") as f:
    json.dump(out, f, indent=2)

lines = []
lines.append("BHOPAL LCZ STATISTICS - derived only from data/lcz_unique_values_report.csv")
lines.append(f"Pixel {PIXEL} m -> {pix_area:.2f} m2/pixel; extent {total_pixels} px = {extent_km2:.3f} km2")
lines.append(f"Value 0 (excluded): {36774} px = {zero_km2:.3f} km2 ({out['zero_pct_of_extent']:.2f}% of extent)")
lines.append(f"Valid LCZ: {n_valid} px = {area_km2.sum():.3f} km2, {len(values)} classes; absent: {out['absent_classes']}")
lines.append("")
lines.append("LCZ  name                       pixels   km2      %      rank")
for c in sorted(classes, key=lambda c: c['lcz']):
    lines.append(f"{c['lcz']:>3}  {c['name']:<25} {c['pixels']:>7} {c['area_km2']:>8.3f} {c['pct']:>6.2f}  {c['rank']}")
lines.append("")
for lab, s in (("Raster codes INCL. 0", code_incl0), ("Raster codes EXCL. 0", code_excl0)):
    lines.append(f"{lab}: n={s['n']} min={s['min']:.0f} max={s['max']:.0f} mean={s['mean']:.4f} "
                 f"median={s['median']:.1f} mode={s['mode']:.0f} Q1={s['q1']:.0f} Q3={s['q3']:.0f} "
                 f"SDpop={s['sd_pop']:.4f} SDsample={s['sd_sample']:.4f} CV={s['cv_pct']:.2f}%")
lines.append(f"  -> QGIS-reported mean {QGIS_MEAN} / SD {QGIS_SD} reproduced (incl. 0): PASS")
lines.append("")
for lab, s in (("Class area (km2)", area_stats), ("Class area (%)", pct_stats)):
    lines.append(f"{lab}: n={s['n']} mean={s['mean']:.3f} median={s['median']:.3f} SDpop={s['sd_pop']:.3f} "
                 f"SDsample={s['sd_sample']:.3f} CV={s['cv_pct']:.1f}% min={s['min']:.3f} max={s['max']:.3f} "
                 f"Q1={s['q1']:.3f} Q3={s['q3']:.3f} skew={s['skewness']:.3f}")
lines.append("")
c = out["composition"]
lines.append(f"Shannon H={c['shannon_H']:.4f} nats; Hmax(13)={c['H_max_observed']:.4f}; Hmax(17)={c['H_max_17']:.4f}")
lines.append(f"Pielou J (13)={c['pielou_J_observed']:.4f}; J (17)={c['pielou_J_17']:.4f}")
lines.append(f"Gini-Simpson={c['gini_simpson']:.4f}; inverse Simpson={c['inverse_simpson']:.3f}; Hill N1={c['hill_N1']:.3f}")
lines.append(f"Berger-Parker={c['berger_parker']:.4f}; Gini(area)={c['gini_area']:.4f}; classes to 80%={c['classes_to_80pct']}; top-2 share={c['top2_share_pct']:.2f}%")
lines.append(f"Shannon built-only={c['shannon_built']:.4f}; land-cover-only={c['shannon_landcover']:.4f}")
g = out["groups"]
lines.append(f"Built {g['built_km2']:.3f} km2 ({g['built_pct']:.2f}%), land cover {g['landcover_km2']:.3f} km2 ({g['landcover_pct']:.2f}%), ratio {g['built_to_landcover_ratio']:.3f}")
lines.append(f"Compact(1-3) {g['compact_km2']:.3f}; Open(4-6) {g['open_km2']:.3f}; Other built(7-10) {g['other_built_km2']:.3f}; open:compact {g['open_to_compact_ratio']:.3f}")
lines.append(f"Vegetation(11-14) {g['vegetation_km2']:.3f}; Bare(15-16) {g['bare_km2']:.3f}; Water(17) {g['water_km2']:.3f}")
txt = "\n".join(lines)
with open(os.path.join(ROOT, "validation", "lcz_statistics.txt"), "w") as f:
    f.write(txt + "\n")
print(txt)
