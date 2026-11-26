# Qadam Academy — CI/CD және DORA Metrics

Күні: 27.11.2026

## 1. CI/CD архитектурасы

Continuous Integration:
- GitHub Actions.
- Ubuntu Latest.
- Node.js 22.
- Жоба құрылымын тексеру.
- JavaScript синтаксисін тексеру.
- HTML Validation.

Continuous Deployment:
- GitHub Pages.
- Main тармағынан автоматты жариялау.
- Жеке deployment workflow.

## 2. Деректерді жинау

Дереккөз: GitHub REST API.

Бақылау кезеңі (UTC):
25.11.2026 14:03:26 —
26.11.2026 23:08:59.

Күнтізбелік күндер саны: 2.

Барлық 57 workflow жазбасы жүктелді.
Деректер Python арқылы автоматты өңделді.

## 3. CI/CD нәтижелері

| Көрсеткіш | Нақты нәтиже |
|---|---:|
| Барлық workflow | 57 |
| CI іске қосылуы | 28 |
| Сәтті CI | 27 |
| Сәтсіз CI | 1 |
| CI Success Rate | 96,43% |
| Deployment іске қосылуы | 29 |
| Сәтті deployment | 18 |
| Тоқтатылған deployment | 11 |
| Failure мәртебесіндегі deployment | 0 |
| Орташа CI ұзақтығы | 13,89 сек |
| Медианалық CI ұзақтығы | 12 сек |
| Орташа deployment ұзақтығы | 41,67 сек |

## 4. DORA Metrics

| Метрика | Нәтиже |
|---|---|
| Deployment Frequency | Күнтізбелік күніне 9 жариялау |
| Lead Time for Changes (median) | 43,5 сек |
| Lead Time for Changes (mean) | 50,61 сек |
| Change Failure Rate | Деректер жеткіліксіз |
| Failed Deployment Recovery Time | Деректер жеткіліксіз |

## 5. Есептеу әдістемесі

Deployment Frequency:
18 / 2 = 9 жариялау.

CI Success Rate:
27 / 28 * 100 = 96,43%.

Lead Time:
Workflow updated_at - Git commit timestamp.

Lead Time үшін 18 сәтті deployment
деректері пайдаланылды.

Workflow ұзақтығы:
updated_at - run_started_at.

Бұл уақыт көрсеткіштері жуық бағалар.

## 6. CI қатесін талдау

Бастапқы CI тексеруінде HTML void
элементтерінің жазылу стиліне байланысты
қателер анықталды.

Түзету:
- HTML элементтерінің синтаксисі өзгертілді.
- Өзгерістер Git арқылы тіркелді.
- CI қайта іске қосылды.
- Кейінгі тексеру сәтті аяқталды.

Түзету commit: a1dc593.

CI қатесі өндірістік жүйенің істен
шығуына теңестірілмейді.

## 7. SLO көрсеткішімен салыстыру

CI Success Rate мақсаты: >= 95%.
Нақты нәтиже: 96,43%.

Ағымдағы бақылау кезеңінде мақсат орындалды.
Айлық тұрақтылық әлі расталмаған.

## 8. Жақсарту жоспары

- Функционалдық автоматты тесттерді қосу.
- Backend API тесттерін енгізу.
- CI сәтті аяқталғаннан кейін ғана жариялау.
- Production мониторингін ұйымдастыру.
- Инциденттер журналын жүргізу.
- Rollback процедурасын дайындау.
- DORA көрсеткіштерін тұрақты өлшеу.

## 9. Дәлелдер

- .github/workflows/ci.yml
- devops/workflow-runs.json
- devops/calculate_metrics.py
- devops/dora-results.json
- GitHub Actions іске қосылу тарихы.

GitHub Actions:
https://github.com/raykhanur/QadamAcademy/actions

## 10. Шектеулер

Бақылау кезеңі екі күнтізбелік күнмен шектелген.

Жариялаулардың бір бөлігі құжаттама
өзгерістерінен туындаған.

11 тоқтатылған deployment өндірістік
инцидент ретінде есептелмейді.

Change Failure Rate және Failed Deployment
Recovery Time үшін өндірістік инциденттер
туралы нақты деректер қажет.

CI тексерулері толық функционалдық
тестілеуді алмастырмайды.

GitHub Pages жариялау workflow-ы CI
нәтижесіне тікелей тәуелді емес.

ЖИ backend жергілікті ортада жұмыс істейді.
DORA көрсеткіштері веб-сайттың жариялануына
қатысты есептелген.
