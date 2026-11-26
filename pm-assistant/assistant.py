import json
import time
import requests
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
MODEL = "qwen2.5:7b"

data = json.loads(
    (ROOT / "project-data.json").read_text()
)

prompt = """
You are an IT Project Management Assistant.

Analyze the provided project data and prepare:

1. Project status report.
2. Task completion percentage.
3. Remaining story points.
4. Tasks due by December 1.
5. Top project risks.
6. Recommended action plan.
7. Next sprint recommendations.

Use only the supplied facts.
Do not invent completed tasks, costs or velocity.
Clearly distinguish facts from recommendations.
Write the report in English.

PROJECT DATA:
""" + json.dumps(data, indent=2)

payload = {
    "model": MODEL,
    "prompt": prompt,
    "stream": False,
    "options": {
        "temperature": 0
    }
}

start = time.perf_counter()

response = requests.post(
    "http://127.0.0.1:11434/api/generate",
    json=payload,
    timeout=300
)

response.raise_for_status()
raw = response.json()

elapsed = time.perf_counter() - start
report = raw["response"]

(ROOT / "status-report.md").write_text(
    report, encoding="utf-8"
)

evidence = {
    "date": datetime.now(timezone.utc).isoformat(),
    "model": MODEL,
    "generation_seconds": round(elapsed, 3),
    "request": payload,
    "raw_response": raw
}

(ROOT / "execution-log.json").write_text(
    json.dumps(evidence, indent=2, ensure_ascii=False)
)

print(report)
print("\nGeneration time:", round(elapsed, 3), "seconds")
print("Report and execution log saved.")
