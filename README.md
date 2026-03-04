# 🎓 Аналізатор методичок v2

API ключ схований на сервері — користувачі не мають до нього доступу.

---

## 🚀 Деплой на Vercel (покрокова інструкція)

### Крок 1 — Встанови Node.js
Завантаж з https://nodejs.org (версія LTS) → встанови як звичайну програму.

### Крок 2 — Встанови Vercel CLI
```
npm install -g vercel
```

### Крок 3 — Зайди в папку та встанови залежності
```
cd methodik-v2
npm install
```

### Крок 4 — Задеплой
```
npx vercel
```
- Увійди через GitHub або email
- На всі питання тисни Enter
- Отримаєш посилання типу: https://methodik-v2-xxx.vercel.app

⚠️ Сайт поки не працює — треба додати API ключ (Крок 5)

### Крок 5 — Додай API ключ на Vercel

1. Зайди на https://vercel.com → твій проєкт
2. Settings → Environment Variables
3. Додай нову змінну:
   - Name:  ANTHROPIC_API_KEY
   - Value: sk-ant-api03-... (твій ключ з console.anthropic.com)
   - Environments: ✅ Production ✅ Preview ✅ Development
4. Save

### Крок 6 — Передеплой щоб змінна підтягнулась
```
npx vercel --prod
```

### Готово! 🎉
Сайт працює, ключ схований, друг може користуватись без жодних налаштувань.

---

## 🔄 Як змінити API ключ пізніше

1. Vercel Dashboard → проєкт → Settings → Environment Variables
2. Знайди ANTHROPIC_API_KEY → Edit → нове значення → Save
3. Deployments → три крапки → Redeploy

Займає ~1 хвилину.

---

## 💻 Локальний запуск для тесту

Створи файл `.env.local` в папці проєкту:
```
ANTHROPIC_API_KEY=sk-ant-api03-твій-ключ
```

Потім:
```
npm run dev
```
Відкрий http://localhost:5173
