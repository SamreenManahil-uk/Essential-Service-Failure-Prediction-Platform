from ucimlrepo import fetch_ucirepo
import pandas as pd
from pathlib import Path

dataset = fetch_ucirepo(id=601)

X = dataset.data.features
y = dataset.data.targets

df = pd.concat([X, y], axis=1)

output = Path("data/raw/ai4i2020.csv")
output.parent.mkdir(parents=True, exist_ok=True)

df.to_csv(output, index=False)

print("Dataset saved:", output)
print("Shape:", df.shape)
print("\nColumns:")
for column in df.columns:
    print("-", column)

print("\nTarget distribution:")
print(df["Machine failure"].value_counts())
