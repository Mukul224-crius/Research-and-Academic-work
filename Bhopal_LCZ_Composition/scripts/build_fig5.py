"""
Fig. 5 - LCZ (100 m) vs Esri/Impact Observatory LULC 2017 (10 m) cross-check dashboard.
Reads validation/lulc_statistics.json and validation/lcz_statistics.json only.
LULC bars use the product's published legend colours; the two-layer comparison
uses dataviz categorical slots 1 and 2 (validated earlier) with direct labels.
"""
import json, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
U = json.load(open(os.path.join(ROOT, "validation", "lulc_statistics.json")))
L = json.load(open(os.path.join(ROOT, "validation", "lcz_statistics.json")))
ESRI = {1: "#419bdf", 2: "#397d49", 4: "#7a87c6", 5: "#e49635", 7: "#c4281b", 8: "#a59b8f", 11: "#e3e2c3"}
C_LCZ, C_LULC = "#2a78d6", "#eb6834"
INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e0"
plt.rcParams.update({"font.family": "DejaVu Serif", "font.size": 10.5, "axes.edgecolor": INK2,
                     "xtick.color": INK2, "ytick.color": INK2, "axes.grid": True, "grid.color": GRID,
                     "grid.linewidth": 0.6, "axes.axisbelow": True,
                     "axes.spines.top": False, "axes.spines.right": False})
title = lambda ax, t: ax.set_title(t, loc="left", fontsize=12, fontweight="bold", pad=6)

fig = plt.figure(figsize=(7.2, 6.8), dpi=300)
gs = fig.add_gridspec(2, 2, hspace=0.42, wspace=0.55, bottom=0.12)

# (a) LULC class areas
ax = fig.add_subplot(gs[0, 0])
cl = sorted(U["classes"], key=lambda c: -c["area_km2"])
y = np.arange(len(cl))[::-1]
for yi, c in zip(y, cl):
    ax.barh(yi, c["area_km2"], color=ESRI[c["value"]], edgecolor=INK2, linewidth=0.4, height=0.7)
    ax.text(c["area_km2"] + 3, yi, f"{c['area_km2']:.1f} ({c['pct']:.1f}%)", va="center", fontsize=8.2)
ax.set_yticks(y); ax.set_yticklabels([f"{c['value']}  {c['name']}" for c in cl], fontsize=8.6)
ax.set_xlim(0, 250); ax.set_xlabel("Area (km²)"); ax.grid(axis="y", visible=False)
title(ax, "(a) Esri LULC 2017 (10 m)")

# (b) harmonised group shares
ax = fig.add_subplot(gs[0, 1])
H = U["harmonised"]
x = np.arange(len(H)); w = 0.38
for off, key, col, lab in ((-w / 2, "lcz_pct", C_LCZ, "LCZ 100 m"), (w / 2, "lulc_pct", C_LULC, "LULC 10 m")):
    bars = ax.bar(x + off, [h[key] for h in H], width=w - 0.03, color=col, label=lab)
    for b, h in zip(bars, H):
        ax.text(b.get_x() + b.get_width() / 2, h[key] + 0.8, f"{h[key]:.1f}", ha="center", fontsize=7.8)
ax.set_xticks(x); ax.set_xticklabels([h["group"] for h in H], fontsize=8.6, rotation=20)
ax.set_ylabel("Share of valid area (%)"); ax.set_ylim(0, 62); ax.grid(axis="x", visible=False)
title(ax, "(b) Harmonised composition")

# (c)/(d) composition indices as grouped bars: bounded 0-1 indices and unbounded ones apart
def grouped(ax, items, xlim, fmt):
    yy = np.arange(len(items))[::-1]; h = 0.36
    for yi, (lab, kl, ku) in zip(yy, items):
        for off, val, col in ((h / 2, L["composition"][kl], C_LCZ), (-h / 2, U["composition"][ku], C_LULC)):
            ax.barh(yi + off, val, height=h - 0.04, color=col)
            ax.text(val + xlim * 0.015, yi + off, fmt.format(val), va="center", fontsize=8.2)
    ax.set_yticks(yy); ax.set_yticklabels([i[0] for i in items], fontsize=9.1)
    ax.set_xlim(0, xlim); ax.grid(axis="y", visible=False)

ax = fig.add_subplot(gs[1, 0])
grouped(ax, [("Evenness J", "pielou_J_observed", "pielou_J"), ("Gini–Simpson D", "gini_simpson", "gini_simpson"),
             ("Berger–Parker BP", "berger_parker", "berger_parker"), ("Gini (class areas)", "gini_area", "gini_area")],
        1.0, "{:.3f}")
ax.set_xlabel("Index value (0–1)")
title(ax, "(c) Bounded indices")

ax = fig.add_subplot(gs[1, 1])
grouped(ax, [("Shannon H\n(nats)", "shannon_H", "shannon_H"), ("Hill N1\n(effective\nclasses)", "hill_N1", "hill_N1")],
        6.5, "{:.3f}")
ax.set_xlabel("Index value")
ag = U["agreement"]
ax.text(6.4, -0.75, f"Harmonised-group overlap = {ag['proportional_overlap']*100:.1f}%\n"
        f"Jensen–Shannon divergence = {ag['jensen_shannon_bits']:.3f} bits", ha="right", va="bottom", fontsize=8.2, color=INK2)
ax.set_ylim(-0.85, 1.5)
title(ax, "(d) Unbounded indices")

h1 = plt.Rectangle((0, 0), 1, 1, color=C_LCZ); h2 = plt.Rectangle((0, 0), 1, 1, color=C_LULC)
fig.legend([h1, h2], [f"LCZ 100 m ({L['n_classes']} classes)", f"Esri LULC 2017, 10 m ({U['n_classes']} classes)"],
           loc="lower center", ncol=2, frameon=False, fontsize=9.6, bbox_to_anchor=(0.5, 0.0))
fig.savefig(os.path.join(ROOT, "figures", "fig5_dashboard_lcz_vs_lulc.png"), bbox_inches="tight", facecolor="white")
print("fig5 written")
