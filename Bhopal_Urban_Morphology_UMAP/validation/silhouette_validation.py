"""
Silhouette-score validation of the K-Means (k=6) urban morphology clusters
for Bhopal, using ONLY the project's own data file:

    data/bhopal_umap_clusters.csv  (495 grid cells)

Two checks are run, both against the Cluster labels already present in the
CSV (i.e. the labels actually used in the abstract/paper draft — nothing
here is re-clustered arbitrarily; the existing assignment is what's tested):

  1. Silhouette score of the existing k=6 clusters in the 2D UMAP embedding
     (UMAP1, UMAP2) — the space K-Means was reportedly run on. Uses all 495
     rows since UMAP1/UMAP2/Cluster are complete for every cell.

  2. Silhouette score of the SAME existing cluster labels, but measured in
     the original standardized 5-indicator feature space (building count,
     density, mean/max/stddev footprint area) — restricted to the 423 rows
     that have complete raw indicator values. This checks whether the
     clusters are also coherent in the untransformed variables, not only
     in the UMAP projection.

  3. A k-scan (k = 2..10): K-Means is refit on the same UMAP embedding for
     each k, and the silhouette score is recorded, to show where k=6 sits
     relative to other candidate values (elbow / silhouette curve).

No synthetic or external data is used anywhere in this script.
"""
import csv
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, silhouette_samples, davies_bouldin_score
from sklearn.preprocessing import StandardScaler

DATA_PATH = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/data/bhopal_umap_clusters.csv"
OUT_DIR = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/validation"

with open(DATA_PATH) as f:
    rows = list(csv.DictReader(f))

print(f"Loaded {len(rows)} grid cells from {DATA_PATH}")

# ---------------------------------------------------------------
# 1. Silhouette score of EXISTING k=6 labels in UMAP 2D space (n=495)
# ---------------------------------------------------------------
umap_xy = np.array([[float(r["UMAP1"]), float(r["UMAP2"])] for r in rows])
cluster_labels = np.array([int(r["Cluster"]) for r in rows])

n_clusters_found = len(np.unique(cluster_labels))
print(f"\n[1] UMAP-space validation — {len(rows)} cells, {n_clusters_found} clusters")

sil_umap_overall = silhouette_score(umap_xy, cluster_labels)
sil_umap_per_sample = silhouette_samples(umap_xy, cluster_labels)
db_umap = davies_bouldin_score(umap_xy, cluster_labels)

print(f"  Overall silhouette score (UMAP space): {sil_umap_overall:.4f}")
print(f"  Davies-Bouldin index (UMAP space):      {db_umap:.4f}")

print("  Mean silhouette per cluster (UMAP space):")
per_cluster_umap = {}
for c in sorted(np.unique(cluster_labels)):
    mask = cluster_labels == c
    mean_sil = sil_umap_per_sample[mask].mean()
    per_cluster_umap[int(c)] = (int(mask.sum()), float(mean_sil))
    print(f"    Cluster {c}: n={mask.sum():4d}  mean silhouette={mean_sil:.4f}")

# ---------------------------------------------------------------
# 2. Silhouette score of the SAME labels in the raw 5-indicator space
#    (only rows with complete raw indicators, n=423)
# ---------------------------------------------------------------
complete_rows = [r for r in rows if r["fid_count"] != "" and r["area_m2_mean"] != ""]
print(f"\n[2] Raw-indicator-space validation — {len(complete_rows)} cells with complete indicators")

feat_cols = ["fid_count", "density", "area_m2_mean", "area_m2_max", "area_m2_stddev"]
X_raw = np.array([[float(r[c]) for c in feat_cols] for r in complete_rows])
labels_raw = np.array([int(r["Cluster"]) for r in complete_rows])

scaler = StandardScaler()
X_std = scaler.fit_transform(X_raw)

# Only clusters with >=2 members can contribute to a silhouette score
valid_clusters = [c for c in np.unique(labels_raw) if (labels_raw == c).sum() >= 2]
mask_valid = np.isin(labels_raw, valid_clusters)
n_dropped = (~mask_valid).sum()
if n_dropped:
    print(f"  Note: dropped {n_dropped} cell(s) in singleton clusters (silhouette undefined for n<2)")

sil_raw_overall = silhouette_score(X_std[mask_valid], labels_raw[mask_valid])
db_raw = davies_bouldin_score(X_std[mask_valid], labels_raw[mask_valid])
print(f"  Overall silhouette score (raw standardized indicators): {sil_raw_overall:.4f}")
print(f"  Davies-Bouldin index (raw standardized indicators):      {db_raw:.4f}")

# ---------------------------------------------------------------
# 3. k-scan on the UMAP embedding: refit K-Means for k=2..10
# ---------------------------------------------------------------
print("\n[3] k-scan on UMAP embedding (K-Means refit per k, random_state=42, n_init=10)")
k_scan_results = []
for k in range(2, 11):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels_k = km.fit_predict(umap_xy)
    sil_k = silhouette_score(umap_xy, labels_k)
    inertia_k = km.inertia_
    k_scan_results.append((k, sil_k, inertia_k))
    marker = "  <-- k used in the paper" if k == 6 else ""
    print(f"  k={k:2d}  silhouette={sil_k:.4f}  inertia={inertia_k:10.2f}{marker}")

# ---------------------------------------------------------------
# Write outputs
# ---------------------------------------------------------------
with open(f"{OUT_DIR}/silhouette_per_cluster_umap.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["cluster", "n_cells", "mean_silhouette_umap_space"])
    for c, (n, s) in sorted(per_cluster_umap.items()):
        w.writerow([c, n, round(s, 4)])

with open(f"{OUT_DIR}/k_scan_silhouette.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["k", "silhouette_score_umap_space", "kmeans_inertia"])
    for k, s, inertia in k_scan_results:
        w.writerow([k, round(s, 4), round(inertia, 2)])

with open(f"{OUT_DIR}/validation_summary.txt", "w") as f:
    f.write("Silhouette validation summary — Bhopal urban morphology clustering\n")
    f.write("Computed from data/bhopal_umap_clusters.csv only (no external or synthetic data)\n")
    f.write("=" * 75 + "\n\n")
    f.write(f"1. UMAP-space silhouette (existing k=6 labels, n={len(rows)}):\n")
    f.write(f"   Overall silhouette score : {sil_umap_overall:.4f}\n")
    f.write(f"   Davies-Bouldin index     : {db_umap:.4f}\n\n")
    f.write("   Per-cluster mean silhouette:\n")
    for c, (n, s) in sorted(per_cluster_umap.items()):
        f.write(f"     Cluster {c}: n={n:4d}  mean silhouette={s:.4f}\n")
    f.write(f"\n2. Raw-indicator-space silhouette (same labels, n={mask_valid.sum()} complete cells):\n")
    f.write(f"   Overall silhouette score : {sil_raw_overall:.4f}\n")
    f.write(f"   Davies-Bouldin index     : {db_raw:.4f}\n\n")
    f.write("3. k-scan on UMAP embedding (k=2..10):\n")
    for k, s, inertia in k_scan_results:
        marker = "  <-- k used in the paper" if k == 6 else ""
        f.write(f"   k={k:2d}  silhouette={s:.4f}  inertia={inertia:10.2f}{marker}\n")

print(f"\nWrote: {OUT_DIR}/silhouette_per_cluster_umap.csv")
print(f"Wrote: {OUT_DIR}/k_scan_silhouette.csv")
print(f"Wrote: {OUT_DIR}/validation_summary.txt")
