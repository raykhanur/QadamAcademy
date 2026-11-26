from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import requests
import json

app = FastAPI(title="Qadam Academy AI")

MODEL = "qwen2.5:3b"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


class Topic(BaseModel):
    topic_id: str
    correct: int = Field(ge=0)
    total: int = Field(gt=0)


class RecommendationRequest(BaseModel):
    topics: List[Topic]


@app.get("/api/health")
def health():
    return {"status": "ok", "model": MODEL}


@app.post("/api/recommend")
def recommend(data: RecommendationRequest):

    topics = data.topics

    if any(t.correct > t.total for t in topics):
        raise HTTPException(422, "Invalid score")

    if len({t.topic_id for t in topics}) != len(topics):
        raise HTTPException(422, "Duplicate topic IDs")

    if not topics:
        return {
            "source": "baseline",
            "topic_id": None,
            "message": "Алдымен тест тапсырыңыз."
        }

    baseline = sorted(
        topics,
        key=lambda t: (t.correct / t.total, t.topic_id)
    )[0]

    records = [t.model_dump() for t in topics]
    allowed = [t.topic_id for t in topics]

    prompt = (
        "Analyze these student test statistics. "
        "Select the topic with the lowest correct/total ratio. "
        "For ties choose the smallest topic_id alphabetically. "
        "Return only the selected topic_id as JSON. "
        "Data: " + json.dumps(records)
    )

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
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
                "options": {
                    "temperature": 0
                }
            },
            timeout=90
        )

        response.raise_for_status()
        result = json.loads(response.json()["response"])
        selected = result["topic_id"]

        if selected not in allowed:
            raise ValueError("Invalid topic")

        return {
            "source": "ai",
            "model": MODEL,
            "topic_id": selected,
            "baseline_topic_id": baseline.topic_id,
            "message": "Осы тақырыпты қайталау ұсынылады."
        }

    except (requests.RequestException, ValueError, KeyError, TypeError):
        return {
            "source": "baseline",
            "topic_id": baseline.topic_id,
            "message": "Осы тақырыпты қайталау ұсынылады."
        }


ROOT = Path(__file__).resolve().parent.parent

for folder in ("css", "js", "data"):
    app.mount(
        "/" + folder,
        StaticFiles(directory=str(ROOT / folder)),
        name=folder
    )


# Serve root-level static files (images, etc.)
@app.get("/academy.png")
def academy_png():
    img = ROOT / "academy.png"
    if not img.exists():
        raise HTTPException(404, "academy.png not found")
    return FileResponse(str(img), media_type="image/png")


@app.get("/")
def index():
    return FileResponse(str(ROOT / "index.html"))
