import json
from pathlib import Path

path = Path("evals/dataset.json")
data = json.loads(path.read_text())

for case in data:
    if case["expected"] is not None:
        continue

    print("\n" + case["id"])

    for topic in case["topics"]:
        print(topic["topic_id"], topic["correct"], "/", topic["total"])

    while True:
        answer = input("Choose A, B or C: ").strip().lower()
        if answer in ("a", "b", "c"):
            case["expected"] = "topic_" + answer
            break

    path.write_text(json.dumps(data, indent=2))

print("\nAll 30 answers saved!")
