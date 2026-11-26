import random
import json
import matplotlib.pyplot as plt
from pathlib import Path

root = Path(__file__).parent
report = json.loads(
    (root / "monte_carlo_results.json").read_text()
)

random.seed(report["seed"])

tasks = report["task_estimates_days"]

results = [
    sum(
        random.triangular(low, high, mode)
        for low, mode, high in tasks.values()
    )
    for _ in range(report["simulations"])
]

plt.figure(figsize=(12, 6))

plt.hist(
    results,
    bins=45,
    color="#6366F1",
    edgecolor="white",
    alpha=0.85
)

colors = ["green", "blue", "orange", "red"]

for (name, value), color in zip(
    report["percentiles"].items(), colors
):
    days = value["days"]
    plt.axvline(
        days,
        color=color,
        linestyle="--",
        label=f"{name}: {days} days"
    )

plt.axvline(
    report["available_days"],
    color="black",
    linewidth=2,
    label="Deadline: 18 days"
)

plt.title("Qadam Academy - Monte Carlo Simulation")
plt.xlabel("Project duration (days)")
plt.ylabel("Frequency")
plt.legend()
plt.grid(axis="y", alpha=0.2)
plt.tight_layout()
plt.savefig(root / "monte_carlo.png", dpi=200)
plt.close()

print("Chart saved: planning/monte_carlo.png")
