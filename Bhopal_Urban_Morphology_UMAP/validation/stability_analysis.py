import pandas as pd, numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score, adjusted_rand_score
import umap
import warnings
warnings.filterwarnings("ignore")

DATA = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/data/bhopal_umap_clusters.csv"
df = pd.read_csv(DATA)
print("rows:", len(df))

ind_cols = ["fid_count", "density", "area_m2_mean", "area_m2_max", "area_m2_stddev"]
X = df[ind_cols].fillna(0).values
Z = StandardScaler().fit_transform(X)
orig_labels = df["Cluster"].values

print("\n=== 1. Seed stability (fixed UMAP params: n_neighbors=15, min_dist=0.10) ===")
seed_rows = []
for seed in range(10):
    reducer = umap.UMAP(n_neighbors=15, min_dist=0.10, n_components=2, metric="euclidean", random_state=seed)
    Y = reducer.fit_transform(Z)
    km = KMeans(n_clusters=6, random_state=seed, n_init=10).fit(Y)
    labels = km.labels_
    ari_vs_orig = adjusted_rand_score(orig_labels, labels)
    sil = silhouette_score(Y, labels)
    seed_rows.append((seed, ari_vs_orig, sil))
    print(f"seed={seed:2d}  ARI vs original={ari_vs_orig:.3f}  silhouette(UMAP space)={sil:.3f}")

seed_df = pd.DataFrame(seed_rows, columns=["seed", "ARI_vs_original", "silhouette_umap"])
print("\nSeed-stability summary: mean ARI=%.3f  min ARI=%.3f  max ARI=%.3f" % (
    seed_df.ARI_vs_original.mean(), seed_df.ARI_vs_original.min(), seed_df.ARI_vs_original.max()))

print("\n=== 2. UMAP hyperparameter sensitivity (random_state=42 fixed) ===")
hp_rows = []
for n_neighbors in [10, 15, 30]:
    for min_dist in [0.0, 0.1, 0.3]:
        reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=2, metric="euclidean", random_state=42)
        Y = reducer.fit_transform(Z)
        km = KMeans(n_clusters=6, random_state=42, n_init=10).fit(Y)
        labels = km.labels_
        ari_vs_orig = adjusted_rand_score(orig_labels, labels)
        sil = silhouette_score(Y, labels)
        hp_rows.append((n_neighbors, min_dist, ari_vs_orig, sil))
        print(f"n_neighbors={n_neighbors:2d}  min_dist={min_dist:.1f}  ARI vs original={ari_vs_orig:.3f}  silhouette={sil:.3f}")

hp_df = pd.DataFrame(hp_rows, columns=["n_neighbors", "min_dist", "ARI_vs_original", "silhouette_umap"])

print("\n=== 3. Plain K-Means baseline (no UMAP step), k=6, on standardized 5-indicator space ===")
km_raw = KMeans(n_clusters=6, random_state=42, n_init=10).fit(Z)
labels_raw = km_raw.labels_
ari_raw_vs_orig = adjusted_rand_score(orig_labels, labels_raw)
sil_raw = silhouette_score(Z, labels_raw)
db_raw = davies_bouldin_score(Z, labels_raw)
print(f"Plain K-Means (k=6) on raw 5-indicator space: silhouette={sil_raw:.3f}  Davies-Bouldin={db_raw:.3f}  ARI vs UMAP-based original={ari_raw_vs_orig:.3f}")

print("\n=== 4. k-scan for plain K-Means on raw indicator space (k=2..10) ===")
scan_rows = []
for k in range(2, 11):
    km_k = KMeans(n_clusters=k, random_state=42, n_init=10).fit(Z)
    sil_k = silhouette_score(Z, km_k.labels_)
    scan_rows.append((k, sil_k))
    print(f"k={k:2d}  silhouette(raw space)={sil_k:.3f}")
scan_df = pd.DataFrame(scan_rows, columns=["k", "silhouette_raw"])

OUT = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/validation"
seed_df.to_csv(f"{OUT}/stability_seed_scan.csv", index=False)
hp_df.to_csv(f"{OUT}/stability_umap_hyperparam_scan.csv", index=False)
scan_df.to_csv(f"{OUT}/stability_kmeans_raw_kscan.csv", index=False)

with open(f"{OUT}/stability_summary.txt", "w") as f:
    f.write("Clustering stability analysis -- AGERS 2026 revision (reviewer 1 & 2 request)\n")
    f.write("="*80 + "\n\n")
    f.write("1. Seed stability (10 seeds, fixed UMAP hyperparameters n_neighbors=15, min_dist=0.10):\n")
    f.write(f"   mean ARI vs original labels = {seed_df.ARI_vs_original.mean():.3f}\n")
    f.write(f"   min ARI = {seed_df.ARI_vs_original.min():.3f}, max ARI = {seed_df.ARI_vs_original.max():.3f}\n")
    f.write(f"   mean silhouette (UMAP space) = {seed_df.silhouette_umap.mean():.3f}\n\n")
    f.write("2. UMAP hyperparameter sensitivity (9 combinations of n_neighbors x min_dist):\n")
    f.write(f"   mean ARI vs original labels = {hp_df.ARI_vs_original.mean():.3f}\n")
    f.write(f"   min ARI = {hp_df.ARI_vs_original.min():.3f}, max ARI = {hp_df.ARI_vs_original.max():.3f}\n\n")
    f.write("3. Plain K-Means (no UMAP), k=6, on standardized raw 5-indicator space:\n")
    f.write(f"   silhouette = {sil_raw:.3f}, Davies-Bouldin = {db_raw:.3f}\n")
    f.write(f"   ARI vs UMAP-based original clustering = {ari_raw_vs_orig:.3f}\n\n")
    f.write("4. k-scan for plain K-Means on raw indicator space (k=2..10):\n")
    for k, s in scan_rows:
        f.write(f"   k={k}: silhouette={s:.3f}\n")

print("\nWrote CSVs and summary to", OUT)
