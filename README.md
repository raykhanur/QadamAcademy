# Qadam Academy

ҰБТ-ға дайындалуға арналған білім беру веб-платформасы.

## Жобаның мақсаты

Оқушыларға оқу материалдарын меңгеруге, тест тапсыруға,
нәтижелерін бақылауға және жеке оқу ұсыныстарын алуға
мүмкіндік беру.

## Негізгі мүмкіндіктер

- 10 оқу пәні
- 100 сабақ
- 44 тест және 440 сұрақ
- Оқушының жеке кабинеті
- Оқу нәтижелерін бақылау
- Алгоритмдік оқу ұсыныстары
- Эксперименттік жасанды интеллект
- AI Project Management Assistant

## Технологиялар

- HTML, CSS, JavaScript
- LocalStorage
- Python, FastAPI
- Ollama, Qwen2.5:3B
- GitHub Actions
- GitHub Projects
- GitHub Pages

## Жобаны басқару

- Agile
- Scrum элементтері
- Kanban
- Story Points
- WSJF
- Risk Management
- Change Management
- CI/CD

## Жасанды интеллект сапасын бағалау

- Модель: qwen2.5:3b
- Бағалау мысалдары: 30
- AI Accuracy: 90%
- Baseline Accuracy: 100%
- AI Macro F1: 0.896

Базалық алгоритм негізгі ұсыныс беру механизмі
ретінде пайдаланылады. ЖИ эксперименттік режимде
жұмыс істейді.

## Репозиторий құрылымы

- backend/ — жергілікті AI сервері
- css/ — веб-сайт стильдері
- js/ — қолданба логикасы
- data/ — оқу материалдары
- docs/ — жобалық құжаттар
- evals/ — ЖИ бағалау нәтижелері
- pm-assistant/ — жобаны басқару ассистенті
- .github/workflows/ — CI/CD

## Жергілікті іске қосу

Python 3.9+ және Ollama қажет.

    ollama pull qwen2.5:3b
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --host 127.0.0.1 --port 8000

Мекенжай: http://127.0.0.1:8000

## Шектеулер

GitHub Pages нұсқасында базалық алгоритм жұмыс істейді.
ЖИ функциясы жергілікті серверді қажет етеді.
LocalStorage өндірістік деректер базасы болып саналмайды.

## Веб-сайт

https://raykhanur.github.io/QadamAcademy/

