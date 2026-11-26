import json
import subprocess
from datetime import datetime
from collections import Counter
from statistics import mean, median
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def dt(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))

with open(ROOT / "workflow-runs.json") as f:
    data = json.load(f)

runs = data["workflow_runs"]

ci = [r for r in runs if r["name"] == "Qadam Academy CI"]
pages = [r for r in runs if r["name"] == "pages build and deployment"]

ci_ok = [r for r in ci if r["conclusion"] == "success"]
deploy_ok = [r for r in pages if r["conclusion"] == "success"]

ci_times = [
    (dt(r["updated_at"]) - dt(r["run_started_at"])).total_seconds()
    for r in ci_ok
]

deploy_times = [
    (dt(r["updated_at"]) - dt(r["run_started_at"])).total_seconds()
    for r in deploy_ok
]

lead_times = []

for r in deploy_ok:
    try:
        commit_time = subprocess.check_output(
            ["git", "show", "-s", "--format=%cI", r["head_sha"]],
            text=True,
            stderr=subprocess.DEVNULL
        ).strip()

        seconds = (
            dt(r["updated_at"]) - dt(commit_time)
        ).total_seconds()

        if seconds >= 0:
            lead_times.append(seconds)

    except subprocess.CalledProcessError:
        pass

start = min(dt(r["created_at"]) for r in runs)
end = max(dt(r["updated_at"]) for r in runs)

days = (end.date() - start.date()).days + 1

metrics = {
    "period_start_utc": start.isoformat(),
    "period_end_utc": end.isoformat(),
    "calendar_days": days,
    "total_workflow_runs": len(runs),
    "ci_results": dict(Counter(r["conclusion"] for r in ci)),
    "deployment_results": dict(
        Counter(r["conclusion"] for r in pages)
    ),
    "ci_success_rate_pct": round(
        len(ci_ok) / len(ci) * 100, 2
    ),
    "successful_deployments": len(deploy_ok),
    "deployments_per_calendar_day": round(
        len(deploy_ok) / days, 2
    ),
    "mean_ci_duration_sec": round(mean(ci_times), 2),
    "median_ci_duration_sec": round(median(ci_times), 2),
    "mean_deployment_duration_sec": round(
        mean(deploy_times), 2
    ),
    "lead_time_sample_size": len(lead_times),
    "mean_lead_time_sec": round(
        mean(lead_times), 2
    ) if lead_times else None,
    "median_lead_time_sec": round(
        median(lead_times), 2
    ) if lead_times else None,
    "change_failure_rate": None,
    "failed_deployment_recovery_time": None
}

with open(ROOT / "dora-results.json", "w") as f:
    json.dump(metrics, f, indent=2)

print(json.dumps(metrics, indent=2))
