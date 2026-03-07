# Meowter Monorepo & Infrastructure

Репозиторий: `https://github.com/trplfr/meowter`
Текущая ветка: `dev` (старый код)
Новая ветка: `v2`
Домены: `meowter.app` (en), `meowter.ru` (ru)

---

## Монорепо

### Корень проекта

```
meowter/
├── web/                        # см. 01_FRONTEND.md
├── api/                        # см. 02_BACKEND.md
│
├── shared/                     # общие типы и контракты
│   ├── types/
│   │   ├── user.ts             # interface User
│   │   ├── meow.ts             # interface Meow, MeowTag
│   │   ├── comment.ts
│   │   ├── notification.ts
│   │   ├── api.ts              # API request/response контракты
│   │   └── index.ts
│   └── index.ts
│
├── docker/
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   └── nginx.conf
│
├── reports/
│   ├── screens/                # PNG скриншоты из Figma
│   └── legacy/                 # полезные артефакты из старого кода
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── package.json                # workspaces: web, api, shared
├── .yarnrc.yml                 # Yarn 4.13.0, nodeLinker: node-modules
├── tsconfig.base.json          # strict, shared paths
├── lingui.config.ts            # locales: ru, en; sourceLocale: ru
├── .editorconfig
├── .gitignore
├── LICENSE                     # проприетарная лицензия
├── CLAUDE.md                   # инструкции для Claude Code CLI
├── README.md
├── docker-compose.yml          # dev
└── docker-compose.prod.yml     # production
```

### package.json (корень)

```json
{
  "name": "meowter",
  "private": true,
  "workspaces": ["web", "api", "shared"],
  "packageManager": "yarn@4.13.0",
  "scripts": {
    "dev": "concurrently \"yarn workspace api dev\" \"yarn workspace web dev\"",
    "dev:api": "yarn workspace api dev",
    "dev:web": "yarn workspace web dev",
    "build": "yarn workspaces foreach -A run build",
    "lint": "yarn workspaces foreach -A run lint",
    "test": "yarn workspaces foreach -A run test",
    "lingui:extract": "yarn workspace web lingui extract",
    "db:migrate": "yarn workspace api drizzle-kit migrate",
    "db:generate": "yarn workspace api drizzle-kit generate",
    "prepare": "husky"
  }
}
```

### Именование воркспейсов

Каждый workspace использует короткий алиас:

| Воркспейс | package.json `name` | Импорт |
|-----------|---------------------|--------|
| `web` | `web` | алиасы через tsconfig paths (`@pages/*`, `@ui/*`, ...) |
| `api` | `api` | алиасы через tsconfig paths (`@shared/*`) |
| `shared` | `shared` | `import { type IUser } from '@shared/types'` (через tsconfig alias) |

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/src/*"]
    }
  }
}
```

Каждый app расширяет базовый конфиг и добавляет свои paths:

```json
// web/tsconfig.json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/src/*"],
      "@pages/*": ["src/pages/*"],
      "@modules/*": ["src/modules/*"],
      "@ui/*": ["src/ui/*"],
      "@logic/*": ["src/logic/*"],
      "@lib/*": ["src/lib/*"],
      "@core/*": ["src/core/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

Примеры импортов:
- `import { type User } from '@shared/types'`
- `import { Button } from '@ui/Button'`
- `import { Feed } from '@modules/Feed'`
- `import { $session } from '@logic/session'`
- `import { parseTildes } from '@lib/parseTildes'`
- `import { feedRoute } from '@logic/router'`

---

## Docker

### docker-compose.yml (dev — только сервисы)

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: meowter
      POSTGRES_USER: meowter
      POSTGRES_PASSWORD: meowter_dev

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

Для dev: БД и Redis в Docker, web и api запускаются нативно через `yarn dev`.

### docker-compose.prod.yml (production — всё)

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    restart: always
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: meowter
      POSTGRES_USER: meowter
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: always

  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    restart: always
    depends_on: [db, redis]
    environment:
      DATABASE_URL: postgres://meowter:${DB_PASSWORD}@db:5432/meowter
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production

  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    restart: always
    depends_on: [api]
    environment:
      API_URL: http://api:4000
      NODE_ENV: production

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on: [web, api]

volumes:
  pgdata:
```

### docker/api.Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY shared ./shared
COPY api ./api
RUN corepack enable && yarn install
RUN yarn workspace @api build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```

### docker/web.Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY shared ./shared
COPY web ./web
RUN corepack enable && yarn install
RUN yarn workspace @web build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/web/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server/index.js"]
```

### docker/nginx.conf

```nginx
upstream web { server web:3000; }
upstream api { server api:4000; }

server {
    listen 80;
    server_name meowter.app meowter.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name meowter.app meowter.ru;

    ssl_certificate /etc/letsencrypt/live/meowter.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meowter.app/privkey.pem;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location /api/ {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Язык определяется по домену: SSR-сервер читает Host заголовок → meowter.ru → ru, meowter.app → en.

---

## GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy
on:
  push:
    branches: [v2]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/meowter
            git pull origin v2
            docker compose -f docker-compose.prod.yml up -d --build
```

Секреты в GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

---

## Настройка VPS (один раз)

VPS: 2 core, 2 GB RAM, 40 GB, Ubuntu (переустановить на 24.04)

1. Установить Docker + Docker Compose
2. Установить certbot
3. `certbot certonly --standalone -d meowter.app -d meowter.ru` (SSL бесплатно)
4. `git clone git@github.com:trplfr/meowter.git /opt/meowter`
5. `cd /opt/meowter && git checkout v2`
6. Создать `/opt/meowter/.env`:
   ```
   DB_PASSWORD=<сгенерировать>
   JWT_SECRET=<сгенерировать>
   ```
7. `docker compose -f docker-compose.prod.yml up -d`
8. Настроить DNS: A-записи для обоих доменов → IP сервера

---

## Порядок работы в Claude Code CLI

1. `git checkout -b v2` — новая ветка
2. Изучить старый код (`client/`, `server/`), сохранить полезное в `reports/legacy/`
3. Очистить всё кроме `.git/`, `.gitignore`, `reports/legacy/`
4. Инициализировать монорепо: корневой `package.json`, `tsconfig.base.json`, `.yarnrc.yml`
5. Создать `CLAUDE.md`, `LICENSE`, `README.md`
6. Создать `shared/` — общие типы и контракты, настроить path alias `@shared/*` в tsconfig обоих apps
7. Настроить `api` — NestJS + Fastify-адаптер, Drizzle, схема БД, AuthModule
8. Настроить `web` — React 19 + Effector + atomic-router + Rsbuild SSR, заглушки экранов
9. Docker-compose для dev (PostgreSQL + Redis)
10. Проверить: `yarn dev` поднимает фронт + бэк, регистрация/логин работает
11. Docker-compose.prod + Dockerfiles + nginx.conf
12. GitHub Actions deploy
13. Настроить VPS, первый деплой
14. Начать верстать UI по скриншотам из `reports/screens/`

---

## Удобства для соло-разработки

- **Swagger** — `/api/docs`, тестирование API из браузера, заменяет Postman
- **lingui** — пишешь на русском, `yarn lingui:extract` генерирует каталог для перевода
- **husky + lint-staged** — pre-commit авто-форматирование
- **Rstest** (фронт) / **vitest** (бэк) — тесты в единой экосистеме, `yarn test` из корня
- **docker compose** — `docker compose up db redis` и локальная инфра готова
- **CLAUDE.md** — инструкция для Claude Code CLI
- **concurrently** — один `yarn dev` поднимает и фронт и бэк
