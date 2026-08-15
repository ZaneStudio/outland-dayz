# UKRAINE DAYZ

## Запуск

1. Скопіюйте `.env.example` у `.env` і вкажіть PostgreSQL `DATABASE_URL`.
2. `npm install`
3. `npm run db:generate && npm run db:push && npm run db:seed`
4. `npm run dev`

Демо-адміністратор: `admin@ukraine-dayz.com` / `Admin2026!`.

Налаштування сервера знаходяться у `lib/config.ts`. Інтеграції платежів та реального статусу сервера зарезервовані у `.env` і мають mock-реалізації в `app/api`.

## Steam на Render

У **Render Dashboard → Web Service → Environment** додайте `STEAM_API_KEY` зі свого Steam Web API key. `STEAM_SESSION_SECRET` Render згенерує з `render.yaml` автоматично. Потім виконайте **Manual Deploy → Deploy latest commit**. Файл `.env.local` навмисно не деплоїться з міркувань безпеки.
