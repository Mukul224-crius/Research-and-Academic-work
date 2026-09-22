"""
Global Moran's I for the Urban Morphological Index (UMI) surface, Bhopal.

Uses ONLY this project's own data: the row_index/col_index grid position and
UMI value of each cell, read directly from the Local Moran's I DBF
(data/Local_Morans_I.zip). No external or synthetic data.

Spatial weights: ROOK contiguity (shared edge, i.e. 4-neighbor) on the
regular 1 km grid, built directly from row_index/col_index -- this is an
exact, deterministic adjacency for a regular grid, not an approximation.
Row-standardized weights (each neighbor weighted 1/n_neighbors), the
standard convention for Moran's I.

Significance is assessed by a permutation test (999 random permutations of
UMI values across the fixed grid layout) rather than assuming normality,
since the theoretical normal/randomization approximations can be unreliable
for irregular boundary effects.
"""
import struct
import numpy as np

DBF_PATH = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/data/_Local_Morans_I_extracted/Local_Moran;s_I.dbf"


def read_dbf(fname):
    with open(fname, "rb") as f:
        header = f.read(32)
        numrec = struct.unpack("<I", header[4:8])[0]
        headerlen = struct.unpack("<H", header[8:10])[0]
        recordlen = struct.unpack("<H", header[10:12])[0]
        fields = []
        while True:
            field = f.read(32)
            if field[0:1] == b"\r":
                break
            name = field[0:11].split(b"\x00")[0].decode("latin1")
            flen = field[16]
            fields.append((name, flen))
        f.seek(headerlen)
        recs = []
        for _ in range(numrec):
            rec = f.read(recordlen)
            if len(rec) < recordlen:
                break
            vals = {}
            pos = 1
            for name, flen in fields:
                raw = rec[pos : pos + flen].decode("latin1").strip()
                vals[name] = raw
                pos += flen
            recs.append(vals)
    return recs


recs = read_dbf(DBF_PATH)
print(f"Loaded {len(recs)} grid cells from Local_Moran's_I.dbf (own project data)")

row_idx = np.array([int(r["row_index"]) for r in recs])
col_idx = np.array([int(r["col_index"]) for r in recs])
umi = np.array([float(r["UMI"]) for r in recs])
n = len(recs)

# position -> array index, for O(1) neighbor lookup
pos_to_i = {(row_idx[k], col_idx[k]): k for k in range(n)}

# Rook contiguity (4-neighbor: up/down/left/right) built from grid position
W = np.zeros((n, n))
for k in range(n):
    r, c = row_idx[k], col_idx[k]
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nb = pos_to_i.get((r + dr, c + dc))
        if nb is not None:
            W[k, nb] = 1.0

row_sums = W.sum(axis=1)
isolated = int((row_sums == 0).sum())
print(f"Cells with zero neighbors (isolated in this dataset's cell set): {isolated}")

# Row-standardize (skip isolated cells to avoid div-by-zero; they contribute 0 to I)
W_std = np.divide(W, row_sums[:, None], out=np.zeros_like(W), where=row_sums[:, None] != 0)

z = umi - umi.mean()
S0 = W_std.sum()
numerator = z @ W_std @ z
denominator = (z**2).sum()
morans_I = (n / S0) * (numerator / denominator)

print(f"\nGlobal Moran's I (UMI, rook contiguity, row-standardized): {morans_I:.4f}")

# Permutation test (999 permutations), using only this dataset's own UMI values reshuffled
rng = np.random.default_rng(42)
n_perm = 999
perm_I = np.empty(n_perm)
for p in range(n_perm):
    z_perm = rng.permutation(z)
    perm_I[p] = (n / S0) * (z_perm @ W_std @ z_perm) / denominator

p_value = (np.sum(perm_I >= morans_I) + 1) / (n_perm + 1)
z_score = (morans_I - perm_I.mean()) / perm_I.std()

print(f"Permutation-test mean I (null, n={n_perm}): {perm_I.mean():.4f}")
print(f"Permutation-test std I (null):               {perm_I.std():.4f}")
print(f"Z-score (observed vs. null distribution):    {z_score:.4f}")
print(f"Pseudo p-value (one-sided, positive autocorrelation): {p_value:.4f}")

out_path = "/home/user/Research-and-Academic-work/Bhopal_Urban_Morphology_UMAP/validation/global_morans_i_summary.txt"
with open(out_path, "w") as f:
    f.write("Global Moran's I -- Urban Morphological Index (UMI), Bhopal\n")
    f.write("Computed from data/Local_Morans_I.zip only (own project data)\n")
    f.write("=" * 70 + "\n\n")
    f.write(f"n grid cells               : {n}\n")
    f.write(f"Spatial weights            : rook contiguity (4-neighbor), row-standardized\n")
    f.write(f"Isolated cells (0 neighbors): {isolated}\n\n")
    f.write(f"Global Moran's I            : {morans_I:.4f}\n")
    f.write(f"Permutation test (n=999)    :\n")
    f.write(f"  null mean I                : {perm_I.mean():.4f}\n")
    f.write(f"  null std I                  : {perm_I.std():.4f}\n")
    f.write(f"  Z-score                     : {z_score:.4f}\n")
    f.write(f"  pseudo p-value (one-sided)  : {p_value:.4f}\n")

print(f"\nWrote: {out_path}")
