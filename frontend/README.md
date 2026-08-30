# АгроМаркет — frontend

React/Vite клиент за огласникот АгроМаркет. Интерфејсот е на македонски и ги покрива јавниот каталог, автентикацијата, управувањето со сопствени огласи, оценувањето и администраторскиот панел.

## Локално стартување

```bash
cp .env.example .env
corepack enable
pnpm install
pnpm run dev
```

`VITE_API_URL` стандардно е `/api`. Vite во локален развој го проследува тој пат до `http://localhost:8000`, а приложената Nginx конфигурација го проследува до Docker сервисот `backend:8000`.

## Production проверка

```bash
pnpm run lint
pnpm run test
pnpm run build
```
