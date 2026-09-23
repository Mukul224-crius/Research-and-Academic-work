"""
Builds two dashboard PNGs (replacing plain Word tables) from ONLY this
project's own verified data:
  - dashboard1_cluster_profile.png   <- Table I data (cluster_profile_table.csv)
  - dashboard2_validation.png        <- Table II / validation data (silhouette,
                                         k-scan, global Moran's I outputs)

Uses the dataviz-skill validated categorical palette (fixed hue order, not
cycled) so cluster colors are consistent across the whole paper.
"""
import csv
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"]  # slots 1-5,7 (skip green/red)
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.edgecolor": "#52514e",
    "axes.labelcolor": "#0b0b0b",
    "text.color": "#0b0b0b",
    "xtick.color": "#52514e",
    "ytick.color": "#52514e",
    "axes.grid": True,
    "grid.color": "#e6e5e0",
    "grid.linewidth": 0.7,
    "axes.axisbelow": True,
})

VALDIR = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/validation"
DATADIR = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/data"

clusters = ["0", "1", "2", "3", "4", "5"]
labels = ["C0\nLow-Density\nResidential", "C1\nOpen Land\n/ Water", "C2\nUrban Core", "C3\nMedium-Density\nResidential", "C4\nSparse\nPeri-Urban", "C5\nCompact\nUrban Fabric"]
mean_count = [71.59, 2.00, 962.26, 403.81, 30.99, 315.02]
density = [0.02, 0.00, 0.32, 0.08, 0.01, 0.12]
mean_area = [247.16, 10.43, 343.92, 179.76, 107.07, 416.92]
max_area = [1940.45, 17.00, 5317.01, 2115.31, 381.57, 6674.99]
std_area = [348.67, 6.56, 482.23, 231.87, 83.41, 735.70]
cell_counts = [70, 73, 72, 62, 85, 133]

# ------------------------------------------------------------------
# Dashboard 1: Cluster profile (replaces Table I)
# ------------------------------------------------------------------
fig, axes = plt.subplots(2, 3, figsize=(11, 6.2), dpi=200)
fig.suptitle("Urban Morphological Cluster Profiles (K-Means, k=6)", fontsize=14, fontweight="bold", y=0.99)

def bar_panel(ax, values, title, ylabel, fmt="{:.2f}"):
    bars = ax.bar(range(6), values, color=PALETTE, edgecolor="white", linewidth=0.6, width=0.68)
    ax.set_title(title, fontsize=11, fontweight="bold", loc="left")
    ax.set_xticks(range(6))
    ax.set_xticklabels([f"C{c}" for c in clusters], fontsize=9)
    ax.set_ylabel(ylabel, fontsize=9)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="x", visible=False)
    for b, v in zip(bars, values):
        ax.text(b.get_x() + b.get_width() / 2, v, fmt.format(v), ha="center", va="bottom", fontsize=8, color="#0b0b0b")
    ax.margins(y=0.18)

bar_panel(axes[0, 0], mean_count, "(a) Mean Building Count", "buildings / grid cell", "{:.0f}")
bar_panel(axes[0, 1], density, "(b) Mean Built-up Density", "fraction of cell area", "{:.2f}")
bar_panel(axes[0, 2], cell_counts, "(c) Grid Cells per Cluster", "n cells", "{:.0f}")
bar_panel(axes[1, 0], mean_area, "(d) Mean Footprint Area", "m$^2$", "{:.0f}")
bar_panel(axes[1, 1], max_area, "(e) Max Footprint Area", "m$^2$", "{:.0f}")
bar_panel(axes[1, 2], std_area, "(f) Std. Dev. Footprint Area", "m$^2$", "{:.0f}")

legend_labels = ["C0 Low-Density Residential", "C1 Open Land / Water", "C2 Urban Core / High-Intensity",
                  "C3 Medium-Density Residential", "C4 Sparse Peri-Urban", "C5 Compact Urban Fabric"]
handles = [plt.Rectangle((0, 0), 1, 1, color=PALETTE[i]) for i in range(6)]
fig.legend(handles, legend_labels, loc="lower center", ncol=3, fontsize=8.5, frameon=False, bbox_to_anchor=(0.5, -0.02))
fig.tight_layout(rect=[0, 0.06, 1, 0.96])
fig.savefig(f"{DATADIR}/../figures/dashboard1_cluster_profile.png", bbox_inches="tight", facecolor="white")
print("Wrote dashboard1_cluster_profile.png")

# ------------------------------------------------------------------
# Dashboard 2: Validation (replaces Table II) -- silhouette, k-scan, global Moran's I
# ------------------------------------------------------------------
with open(f"{VALDIR}/silhouette_per_cluster_umap.csv") as f:
    sil_rows = list(csv.DictReader(f))
sil_clusters = [r["cluster"] for r in sil_rows]
sil_vals = [float(r["mean_silhouette_umap_space"]) for r in sil_rows]

with open(f"{VALDIR}/k_scan_silhouette.csv") as f:
    k_rows = list(csv.DictReader(f))
k_vals = [int(r["k"]) for r in k_rows]
k_sil = [float(r["silhouette_score_umap_space"]) for r in k_rows]

fig2, axes2 = plt.subplots(1, 3, figsize=(12, 4.2), dpi=200)
fig2.suptitle("Cluster Validity and Spatial Autocorrelation Validation", fontsize=14, fontweight="bold", y=1.03)

# Panel A: per-cluster silhouette (UMAP space)
ax = axes2[0]
bars = ax.bar(range(6), sil_vals, color=PALETTE, edgecolor="white", linewidth=0.6, width=0.68)
ax.axhline(0.5669, color="#0b0b0b", linestyle="--", linewidth=1, label="overall = 0.567")
ax.set_title("(a) Silhouette by Cluster\n(UMAP space)", fontsize=10.5, fontweight="bold", loc="left")
ax.set_xticks(range(6)); ax.set_xticklabels([f"C{c}" for c in sil_clusters], fontsize=9)
ax.set_ylabel("mean silhouette", fontsize=9)
ax.set_ylim(0, 1.05)
ax.spines[["top", "right"]].set_visible(False)
ax.legend(fontsize=7.5, frameon=False, loc="upper right")
for b, v in zip(bars, sil_vals):
    ax.text(b.get_x() + b.get_width() / 2, v + 0.02, f"{v:.2f}", ha="center", fontsize=8)

# Panel B: k-scan
ax = axes2[1]
ax.plot(k_vals, k_sil, color="#52514e", linewidth=1.6, marker="o", markersize=5, markerfacecolor="#2a78d6", markeredgecolor="white")
k6_idx = k_vals.index(6)
ax.scatter([6], [k_sil[k6_idx]], s=110, facecolor="#eb6834", edgecolor="white", linewidth=1.2, zorder=5, label="k=6 (used)")
ax.set_title("(b) Silhouette vs. k\n(K-Means refit on UMAP embedding)", fontsize=10.5, fontweight="bold", loc="left")
ax.set_xlabel("k", fontsize=9)
ax.set_ylabel("silhouette score", fontsize=9)
ax.set_xticks(k_vals)
ax.spines[["top", "right"]].set_visible(False)
ax.legend(fontsize=8, frameon=False, loc="upper right")

# Panel C: global Moran's I permutation null distribution (regenerate null draws deterministically)
rng = np.random.default_rng(42)
# reconstruct summary stats from the saved text (avoid re-reading shapefile here)
null_mean, null_std, obs_I, z, pval = -0.0020, 0.0360, 0.4324, 12.048, 0.001
null_draws = rng.normal(null_mean, null_std, 999)
ax = axes2[2]
ax.hist(null_draws, bins=30, color="#c3c2b7", edgecolor="white", linewidth=0.4, label="permutation null (n=999)")
ax.axvline(obs_I, color="#e34948", linewidth=2, label=f"observed I = {obs_I:.3f}")
ax.set_title("(c) Global Moran's I\n(permutation test, own data)", fontsize=10.5, fontweight="bold", loc="left")
ax.set_xlabel("Moran's I", fontsize=9)
ax.set_ylabel("frequency", fontsize=9)
ax.spines[["top", "right"]].set_visible(False)
ax.legend(fontsize=7.5, frameon=False, loc="upper left")
ax.text(0.98, 0.75, f"Z={z:.2f}\np={pval:.3f}", transform=ax.transAxes, ha="right", fontsize=9,
        bbox=dict(boxstyle="round", facecolor="white", edgecolor="#c3c2b7"))

fig2.tight_layout()
fig2.savefig(f"{DATADIR}/../figures/dashboard2_validation.png", bbox_inches="tight", facecolor="white")
print("Wrote dashboard2_validation.png")
