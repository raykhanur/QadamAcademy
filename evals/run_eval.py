import json
import time
import requests
from pathlib import Path
from datetime import datetime, timezone
from statistics import mean, median

MODEL = "qwen2.5:3b"
URL = "http://127.0.0.1:11434/api/generate"

data = json.loads(Path("evals/dataset.json").read_text())

assert len(data) >= 30
assert all(c["expected"] for c in data)

results = []
labels = ["topic_a", "topic_b", "topic_c"]

for case in data:
    topics = case["topics"]
    expected = case["expected"]

    baseline = min(
        topics,
        key=lambda t: (
            t["correct"] / t["total"],
            t["topic_id"]
        )
    )["topic_id"]

    allowed = [t["topic_id"] for t in topics]

    prompt = (
        "Analyze these student test statistics. "
        "Select the topic with the lowest correct/total ratio. "
        "For ties choose the smallest topic_id alphabetically. "
        "Return only the selected topic_id as JSON. "
        "Data: " + json.dumps(topics)
    )

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "format": {
            "type": "object",
            "properties": {
                "topic_id": {
                    "type": "string",
                    "enum": allowed
                }
            },
            "required": ["topic_id"],
            "additionalProperties": False
        },
        "options": {"temperature": 0}
    }

    start = time.perf_counter()
    prediction = None
    raw = None
    error = None
    response = None

    try:
        response = requests.post(
            URL, json=payload, timeout=90
        )
        response.raise_for_status()
        raw = response.json()

        prediction = json.loads(
            raw["response"]
        )["topic_id"]

        if prediction not in allowed:
            raise ValueError("Invalid topic")

    except Exception as e:
        error = str(e)
        prediction = None
        if raw is None and response is not None:
            raw = response.text

    elapsed = time.perf_counter() - start

    result = {
        "id": case["id"],
        "date": datetime.now(timezone.utc).isoformat(),
        "model": MODEL,
        "expected": expected,
        "baseline": baseline,
        "prediction": prediction,
        "ai_correct": prediction == expected,
        "baseline_correct": baseline == expected,
        "latency_seconds": round(elapsed, 3),
        "request": payload,
        "raw_response": raw,
        "error": error
    }

    results.append(result)

    Path("evals/results.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False)
    )

    status = "PASS" if prediction == expected else "FAIL"

    print(
        case["id"],
        status,
        "Expected:", expected,
        "AI:", prediction,
        "Time:", round(elapsed, 2), "s",
        flush=True
    )

def macro_f1(key):
    scores = []

    for label in labels:
        tp = sum(
            r[key] == label and r["expected"] == label
            for r in results
        )
        fp = sum(
            r[key] == label and r["expected"] != label
            for r in results
        )
        fn = sum(
            r[key] != label and r["expected"] == label
            for r in results
        )

        denominator = 2 * tp + fp + fn
        scores.append(
            2 * tp / denominator if denominator else 0
        )

    return mean(scores)

metrics = {
    "model": MODEL,
    "total_cases": len(results),
    "ai_correct": sum(r["ai_correct"] for r in results),
    "ai_accuracy": mean(r["ai_correct"] for r in results),
    "baseline_accuracy": mean(
        r["baseline_correct"] for r in results
    ),
    "ai_macro_f1": macro_f1("prediction"),
    "baseline_macro_f1": macro_f1("baseline"),
    "average_latency_seconds": mean(
        r["latency_seconds"] for r in results
    ),
    "median_latency_seconds": median(
        r["latency_seconds"] for r in results
    ),
    "errors": sum(r["error"] is not None for r in results),
    "input_tokens": sum(
        r["raw_response"].get("prompt_eval_count", 0)
        for r in results
        if isinstance(r["raw_response"], dict)
    ),
    "output_tokens": sum(
        r["raw_response"].get("eval_count", 0)
        for r in results
        if isinstance(r["raw_response"], dict)
    )
}

Path("evals/metrics.json").write_text(
    json.dumps(metrics, indent=2)
)

print("\nFINAL METRICS")
print(json.dumps(metrics, indent=2))
