"""
Builds the paper's figures from validation/lcz_statistics.json ONLY (no other data):
  fig2_workflow.png             <- methodological workflow
  fig3_dashboard_composition.png <- LCZ composition dashboard
  fig4_dashboard_statistics.png  <- raster-code / class-area statistics dashboard

LCZ classes are drawn in the standard WUDAPT/Demuzere et al. (2022) LCZ colour
key, so the bars match the colours of the authors' QGIS map. Group-level
categories use the dataviz-skill validated categorical palette in fixed slot
order (contrast WARN relieved by direct value labels on every group mark).
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIG = os.path.join(ROOT, "figures")
S = json.load(open(os.path.join(ROOT, "validation", "lcz_statistics.json")))

LCZ_COL = {1: "#8c0000", 2: "#d10000", 3: "#ff0000", 4: "#bf4d00", 5: "#ff6600", 6: "#ff9955",
           7: "#faee05", 8: "#bcbcbc", 9: "#ffccaa", 10: "#555555", 11: "#006a00", 12: "#00aa00",
           13: "#648525", 14: "#b9db79", 15: "#000000", 16: "#fbf7ae", 17: "#6a6aff"}
CAT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#6250d6"]
INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e0"
DPI = 300

plt.rcParams.update({
    "font.family": "DejaVu Serif", "font.size": 9,
    "axes.edgecolor": INK2, "axes.labelcolor": INK, "text.color": INK,
    "xtick.color": INK2, "ytick.color": INK2,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6, "axes.axisbelow": True,
    "axes.spines.top": False, "axes.spines.right": False,
})

classes = sorted(S["classes"], key=lambda c: -c["area_km2"])
g, comp = S["groups"], S["composition"]


def panel_title(ax, t):
    ax.set_title(t, loc="left", fontsize=10, fontweight="bold", pad=6)


# =====================================================================
# Fig. 2  Workflow
# =====================================================================
fig, ax = plt.subplots(figsize=(7.2, 3.6), dpi=DPI)
ax.set_xlim(0, 100); ax.set_ylim(0, 50); ax.axis("off")
W, H, X = 21, 13, [1, 26.5, 52, 77.5]
boxes = [
    (X[0], 31, "Global 100 m LCZ map,\nLCZ_Filter band (GEE)\nexported at 100 m"),
    (X[1], 31, "Reprojection to\nWGS 84 / UTM 43N\n(95.16 m pixels)"),
    (X[2], 31, "Clip to Bhopal\nboundary; value 0\nset as background"),
    (X[3], 31, "Symbology with the\nstandard LCZ colour\nkey (QGIS 3.44)"),
    (X[3], 5, "Raster layer unique\nvalues report\n(pixel counts)"),
    (X[2], 5, "Class area (km², %);\nbuilt vs land-cover\naggregation"),
    (X[1], 5, "Mean, median, SD;\nShannon, Simpson,\nB–P, Gini indices"),
    (X[0], 5, "Cross-check with\nEsri LULC 2017 (10 m):\noverlap and JSD"),
]
for i, (x, y, t) in enumerate(boxes):
    col = CAT[0] if i < 4 else CAT[2]
    ax.add_patch(FancyBboxPatch((x, y), W, H, boxstyle="round,pad=0.3,rounding_size=1.2",
                                fc="white", ec=col, lw=1.4))
    ax.text(x + W / 2, y + H / 2, t, ha="center", va="center", fontsize=6.8)
for a, b in ((0, 1), (1, 2), (2, 3)):
    ax.annotate("", xy=(X[b] - 0.4, 37.5), xytext=(X[a] + W + 0.4, 37.5), arrowprops=dict(arrowstyle="-|>", color=INK2, lw=1.1))
    ax.annotate("", xy=(X[a] + W + 0.4, 11.5), xytext=(X[b] - 0.4, 11.5), arrowprops=dict(arrowstyle="-|>", color=INK2, lw=1.1))
ax.annotate("", xy=(X[3] + W / 2, 18.4), xytext=(X[3] + W / 2, 30.6), arrowprops=dict(arrowstyle="-|>", color=INK2, lw=1.1))
ax.text(1, 46.5, "Stage I — Data preparation", ha="left", fontsize=8.5, fontweight="bold", color=CAT[0])
ax.text(1, 20.5, "Stage II — Quantitative analysis and validation", ha="left", fontsize=8.5, fontweight="bold", color=CAT[2])
fig.savefig(os.path.join(FIG, "fig2_workflow.png"), bbox_inches="tight", facecolor="white")
plt.close(fig)

# =====================================================================
# Fig. 3  Composition dashboard
# =====================================================================
fig = plt.figure(figsize=(7.2, 8.4), dpi=DPI)
gs = fig.add_gridspec(3, 2, height_ratios=[0.22, 1.55, 1.15], hspace=0.38, wspace=0.32)

# (a) KPI tiles
axk = fig.add_subplot(gs[0, :]); axk.axis("off"); axk.set_xlim(0, 5); axk.set_ylim(0, 1)
kpis = [(f"{S['valid_km2']:.1f} km²", "valid LCZ area"),
        (f"{S['n_classes']} / 17", "LCZ classes present"),
        (f"{g['built_pct']:.1f} %", "built LCZs (1–10)"),
        (f"{comp['shannon_H']:.3f}", "Shannon H (nats)"),
        (f"{comp['pielou_J_observed']:.3f}", "Pielou evenness J")]
for i, (v, lab) in enumerate(kpis):
    axk.add_patch(FancyBboxPatch((i + 0.05, 0.05), 0.9, 0.85, boxstyle="round,pad=0,rounding_size=0.06",
                                 fc="#f4f3ef", ec="none"))
    axk.text(i + 0.5, 0.64, v, ha="center", va="center", fontsize=12, fontweight="bold")
    axk.text(i + 0.5, 0.2, lab, ha="center", va="center", fontsize=7.5, color=INK2)
axk.set_title("(a) Headline indicators", loc="left", fontsize=10, fontweight="bold", pad=2)

# (b) Class area bars (all 13 classes, LCZ colours)
axb = fig.add_subplot(gs[1, 0])
y = np.arange(len(classes))[::-1]
for yi, c in zip(y, classes):
    axb.barh(yi, c["area_km2"], color=LCZ_COL[c["lcz"]], edgecolor=INK2, linewidth=0.4, height=0.72)
    axb.text(c["area_km2"] + 2, yi, f"{c['area_km2']:.1f} ({c['pct']:.1f}%)", va="center", fontsize=6.6)
axb.set_yticks(y)
axb.set_yticklabels([f"LCZ {c['lcz']}  {c['name']}" for c in classes], fontsize=6.8)
axb.set_xlim(0, 205); axb.set_xlabel("Area (km²)")
axb.grid(axis="y", visible=False)
panel_title(axb, "(b) Area by LCZ class")

# (c) Rank–cumulative share
axc = fig.add_subplot(gs[1, 1])
cum = [r["cum_pct"] for r in S["cumulative_share_by_rank"]]
ranks = np.arange(1, len(cum) + 1)
axc.plot(np.r_[0, ranks], np.r_[0, cum], color=CAT[0], lw=2, zorder=3)
axc.plot([0, 13], [0, 100], color=INK2, lw=1, ls="--", zorder=2)
for r, cc, rec in zip(ranks, cum, S["cumulative_share_by_rank"]):
    axc.scatter(r, cc, s=26, color=LCZ_COL[rec["lcz"]], edgecolor=INK2, linewidth=0.5, zorder=4)
axc.axhline(80, color=CAT[1], lw=1, ls=":")
k = comp["classes_to_80pct"]
axc.annotate(f"{k} classes cover\n{cum[k-1]:.1f}% of area", xy=(k, cum[k - 1]), xytext=(5.0, 24),
             fontsize=7.2, arrowprops=dict(arrowstyle="-", color=INK2, lw=0.7))
axc.text(10.0, 58, "perfect\nevenness", fontsize=7, color=INK2, rotation=0)
axc.text(8.0, 76, "80 % threshold", fontsize=7, color=INK2)
axc.set_xlim(0, 13.5); axc.set_ylim(0, 105)
axc.set_xlabel("Class rank (largest → smallest)"); axc.set_ylabel("Cumulative share of area (%)")
axc.set_xticks(range(0, 14, 2))
panel_title(axc, "(c) Rank–dominance curve")

# (d) Hierarchical group composition (single stacked bar per tier)
axd = fig.add_subplot(gs[2, :])
tiers = [("Tier 1", [("Built LCZs 1–10", g["built_km2"], CAT[1]),
                     ("Land-cover LCZs 11–17", g["landcover_km2"], CAT[2])]),
         ("Tier 2", [("Compact 1–3", g["compact_km2"], CAT[1]),
                     ("Open 4–6", g["open_km2"], CAT[3]),
                     ("Other built 7–10", g["other_built_km2"], CAT[4]),
                     ("Vegetated 11–14", g["vegetation_km2"], CAT[2]),
                     ("Bare 15–16", g["bare_km2"], CAT[5]),
                     ("Water 17", g["water_km2"], CAT[0])])]
total = S["valid_km2"]
for ti, (tname, segs) in enumerate(tiers):
    left = 0
    small_i = -1
    yy = 1 - ti
    for lab, v, col in segs:
        w = v / total * 100
        axd.barh(yy, w - 0.25, left=left, color=col, height=0.55, edgecolor="white", linewidth=0)
        if w > 14:
            axd.text(left + w / 2, yy, f"{lab}\n{v:.1f} km² · {w:.1f}%", ha="center", va="center",
                     fontsize=6.6, color=INK)
        elif w > 6:
            axd.text(left + w / 2, yy, f"{lab.split()[0]}\n{lab.split()[1]}\n{w:.1f}%", ha="center", va="center", fontsize=6.0, color=INK)
        else:
            small_i += 1
            axd.annotate(f"{lab}: {v:.1f} km² · {w:.1f}%", xy=(left + w / 2, yy - 0.28),
                         xytext=(left + w / 2 - 2, yy - 0.5 - 0.22 * small_i), fontsize=6.4, ha="right", va="center",
                         arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
        left += w
axd.set_yticks([1, 0]); axd.set_yticklabels(["Built vs\nland cover", "Morphological\ngroups"], fontsize=7.5)
axd.set_xlim(0, 100); axd.set_ylim(-0.95, 1.45); axd.set_xlabel("Share of valid LCZ area (%)")
axd.grid(axis="y", visible=False)
panel_title(axd, f"(d) Hierarchical composition (built : land-cover ratio = {g['built_to_landcover_ratio']:.2f})")

fig.savefig(os.path.join(FIG, "fig3_dashboard_composition.png"), bbox_inches="tight", facecolor="white")
plt.close(fig)

# =====================================================================
# Fig. 4  Statistics dashboard
# =====================================================================
fig = plt.figure(figsize=(7.2, 7.4), dpi=DPI)
gs = fig.add_gridspec(2, 2, hspace=0.45, wspace=0.32)
inc, exc = S["code_stats_incl0"], S["code_stats_excl0"]

# (a) Pixel frequency by raster code with mean / median markers
axa = fig.add_subplot(gs[0, :])
codes = [0] + sorted(c["lcz"] for c in S["classes"])
cnt = {0: S["zero_pixels"], **{c["lcz"]: c["pixels"] for c in S["classes"]}}
for cd in range(0, 18):
    if cd in cnt:
        col = "#d9d8d3" if cd == 0 else LCZ_COL[cd]
        axa.bar(cd, cnt[cd] / 1000, color=col, edgecolor=INK2, linewidth=0.4, width=0.75)
    else:
        axa.text(cd + (0.28 if cd == 10 else 0), 0.6, "absent", rotation=90, ha="center", va="bottom", fontsize=6.3, color=INK2)
for val, lab, col, ls in ((inc["mean"], f"mean incl. 0 = {inc['mean']:.2f}", CAT[0], "--"),
                          (inc["median"], f"median incl. 0 = {inc['median']:.0f}", CAT[0], ":"),
                          (exc["mean"], f"mean excl. 0 = {exc['mean']:.2f}", CAT[1], "--"),
                          (exc["median"], f"median excl. 0 = {exc['median']:.0f}", CAT[1], ":")):
    axa.axvline(val, color=col, ls=ls, lw=1.4, label=lab)
axa.set_xticks(range(0, 18)); axa.set_xlabel("Raster value (0 = background; 1–17 = LCZ code)")
axa.set_ylabel("Pixel count (thousands)")
axa.legend(fontsize=7, frameon=True, framealpha=1, edgecolor=GRID, loc="upper right", ncol=1)
axa.set_ylim(0, 44)
axa.grid(axis="x", visible=False)
panel_title(axa, "(a) Frequency distribution of raster values")

# (b) Mean ± SD and median, incl. vs excl. value 0
axb = fig.add_subplot(gs[1, 0])
for i, (s, col, lab) in enumerate(((inc, CAT[0], "Incl. 0\n(n = 83,050)"), (exc, CAT[1], "Excl. 0\n(n = 46,276)"))):
    axb.add_patch(Rectangle((i - 0.18, s["q1"]), 0.36, s["q3"] - s["q1"], fc=col, alpha=0.18, ec=col, lw=1))
    axb.errorbar(i, s["mean"], yerr=s["sd_pop"], fmt="o", color=col, capsize=5, lw=1.6, ms=6)
    axb.plot([i - 0.18, i + 0.18], [s["median"]] * 2, color=INK, lw=2)
    axb.text(i + 0.24, s["mean"], f"x̄ = {s['mean']:.2f}\nSD = {s['sd_pop']:.2f}\nMd = {s['median']:.0f}",
             va="center", fontsize=7)
axb.set_xticks([0, 1]); axb.set_xticklabels([kpi for kpi in ("Incl. 0\n(n = 83,050)", "Excl. 0\n(n = 46,276)")], fontsize=7.5)
axb.set_xlim(-0.5, 1.9); axb.set_ylim(-2, 18); axb.set_ylabel("Raster code value")
axb.grid(axis="x", visible=False)
axb.text(-0.45, 17, "dot ± bar = mean ± SD; black bar = median;\nshaded box = Q1–Q3", fontsize=6.4, color=INK2, va="top")
panel_title(axb, "(b) Code statistics: effect of value 0")

# (c) Diversity metrics against theoretical maximum
axc = fig.add_subplot(gs[1, 1])
metrics = [("Pielou J\n(13 classes)", comp["pielou_J_observed"], 1),
           ("Pielou J\n(17 classes)", comp["pielou_J_17"], 1),
           ("Gini–Simpson", comp["gini_simpson"], 1 - 1 / 13),
           ("Berger–Parker\ndominance", comp["berger_parker"], 1),
           ("Gini coefficient\n(class areas)", comp["gini_area"], 1)]
yy = np.arange(len(metrics))[::-1]
for yi, (lab, v, mx) in zip(yy, metrics):
    axc.barh(yi, mx, color="#efeee9", height=0.55)
    axc.barh(yi, v, color=CAT[5], height=0.55)
    axc.text(v + 0.02, yi, f"{v:.3f}", va="center", fontsize=7.2)
axc.set_yticks(yy); axc.set_yticklabels([m[0] for m in metrics], fontsize=7)
axc.set_xlim(0, 1.05); axc.set_xlabel("Index value (grey = attainable maximum)")
axc.grid(axis="y", visible=False)
panel_title(axc, "(c) Composition indices")

fig.savefig(os.path.join(FIG, "fig4_dashboard_statistics.png"), bbox_inches="tight", facecolor="white")
plt.close(fig)
print("figures written")
