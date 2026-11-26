import random
import math
import json
from pathlib import Path
from datetime import date, timedelta

random.seed(42)

SIMULATIONS = 10000
START_DATE = date(2026, 11, 27)
DEADLINE = date(2026, 12, 15)

# Optimistic, most likely, pessimistic (days)
tasks = {
    "Project management documentation": (1, 2, 4),
    "Remaining laboratory work": (3, 5, 9),
    "Documentation reconciliation": (1, 2, 3),
    "Final testing": (1, 2, 4),
    "Final presentation": (1, 2, 3)
}

results = []

for _ in range(SIMULATIONS):
    duration = sum(
        random.triangular(low, high, mode)
        for low, mode, high in tasks.values()
    )
    results.append(duration)

results.sort()

def percentile(p):
    index = math.ceil(p / 100 * len(results)) - 1
    return results[index]

available_days = (DEADLINE - START_DATE).days

probability = sum(
    d <= available_days for d in results
) / SIMULATIONS * 100

report = {
    "simulations": SIMULATIONS,
    "seed": 42,
    "start_date": str(START_DATE),
    "deadline": str(DEADLINE),
    "available_days": available_days,
    "task_estimates_days": tasks,
    "mean_days": round(sum(results) / SIMULATIONS, 2),
    "deadline_probability_percent": round(probability, 2),
    "percentiles": {}
}

print("Qadam Academy - Monte Carlo")
print("Simulations:", SIMULATIONS)

for p in [50, 70, 85, 95]:
    days = percentile(p)
    finish = START_DATE + timedelta(days=math.ceil(days))

    report["percentiles"][f"P{p}"] = {
        "days": round(days, 2),
        "finish_date": str(finish)
    }

    print(f"P{p}: {days:.2f} days | {finish}")

print(f"Deadline probability: {probability:.2f}%")

output = Path(__file__).parent / "monte_carlo_results.json"
output.write_text(
    json.dumps(report, indent=2),
    encoding="utf-8"
)

print("Results saved:", output)
