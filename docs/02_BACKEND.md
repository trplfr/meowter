# Meowter Backend Plan

Директория: `api/`
Фреймворк: NestJS + Fastify-адаптер
БД: PostgreSQL + pgvector + Drizzle ORM
Кеш: Redis

---

## Стек

### Фреймворк

- `@nestjs/core`, `@nestjs/common`, `@nestjs/config`
- `@nestjs/platform-fastify` (Fastify 5 под капотом)

### База данных

- `drizzle-orm`, `drizzle-kit` — ORM и миграции
- `pg` — драйвер PostgreSQL
- pgvector — расширение для семантического поиска (эмбеддинги мяутов)

### Кеширование

- `ioredis`, `@nestjs-modules/ioredis`
- Refresh-токены, кеш фида, rate limiting counters

### Аутентификация

- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- `@fastify/cookie` — JWT в httpOnly secure куках
- `bcrypt` — хеширование паролей
- Схема: access token (15 мин) + refresh token (30 дней), оба httpOnly, SameSite=Strict

### Валидация

- `class-validator`, `class-transformer` — DTO с декораторами

### Документация

- `@nestjs/swagger` — автогенерация Swagger из DTO и контроллеров, доступ `/api/docs`

### WebSocket

- `@nestjs/websockets` или `@fastify/websocket` — реалтайм нотификации

### Rate limiting

- `@nestjs/throttler`

### Логирование

- `pino-http`, `pino-nestjs`, `pino-pretty` (dev)

### HTTP-клиент

- `got` — внешние API (OpenAI Embeddings для pgvector)

### Утилиты

- `uuid`, `rxjs`

### Тесты

- `vitest`, `testcontainers`, `supertest` — бэкенд не на Rsbuild, поэтому vitest. testcontainers для интеграционных тестов с реальной PostgreSQL

### Компиляция

- `unplugin-swc`, `@swc/core`

### Линтинг

- `eslint@9` (flat config), `typescript-eslint`, `prettier`

---

## Структура директорий

```
api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── refresh-auth.guard.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── tokens.dto.ts
│   │   │
│   │   ├── cats/               # профили пользователей
│   │   │   ├── cats.module.ts
│   │   │   ├── cats.controller.ts
│   │   │   ├── cats.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── meows/              # мяуты (CRUD, фид, лайки)
│   │   │   ├── meows.module.ts
│   │   │   ├── meows.controller.ts
│   │   │   ├── meows.service.ts
│   │   │   ├── feed.service.ts         # семантический фид
│   │   │   ├── embedding.service.ts    # генерация эмбеддингов
│   │   │   └── dto/
│   │   │
│   │   ├── comments/
│   │   │   ├── comments.module.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts  # WebSocket
│   │   │   └── dto/
│   │   │
│   │   └── search/
│   │       ├── search.module.ts
│   │       ├── search.controller.ts
│   │       ├── search.service.ts
│   │       └── dto/
│   │
│   ├── db/
│   │   ├── schema.ts           # Drizzle схема всех таблиц
│   │   ├── migrate.ts
│   │   └── db.module.ts        # DatabaseModule (провайдер Drizzle)
│   │
│   ├── common/                 # общие утилиты
│   │   ├── guards/             # глобальные guards
│   │   ├── interceptors/       # логирование, таймауты
│   │   ├── pipes/              # валидация
│   │   ├── filters/            # обработка ошибок
│   │   └── decorators/         # @CurrentUser() и т.д.
│   │
│   ├── app.module.ts           # корневой модуль
│   └── main.ts                 # bootstrap: NestFactory + FastifyAdapter
│
├── drizzle/                    # миграции Drizzle
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## Схема базы данных (Drizzle)

### users

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid PK | |
| username | varchar unique | @surganov |
| display_name | varchar | Сергей Сурганов |
| email | varchar unique | |
| password_hash | varchar | bcrypt |
| bio | text nullable | Designer at @notion |
| avatar_url | varchar nullable | |
| created_at | timestamp | |

### meows

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid PK | |
| author_id | uuid FK → users | |
| content | text | текст мяута |
| embedding | vector(1536) | pgvector эмбеддинг тегов |
| created_at | timestamp | |
| updated_at | timestamp | |

### meow_tags

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid PK | |
| meow_id | uuid FK → meows | |
| tag | varchar | текст тильда-слова без ~ |
| position | int | позиция в тексте |

### comments

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid PK | |
| meow_id | uuid FK → meows | |
| author_id | uuid FK → users | |
| content | text | |
| parent_id | uuid FK → comments nullable | для вложенности |
| created_at | timestamp | |

### likes

| Поле | Тип | Описание |
|------|-----|----------|
| user_id | uuid FK → users | composite PK |
| meow_id | uuid FK → meows | composite PK |
| created_at | timestamp | |

### follows

| Поле | Тип | Описание |
|------|-----|----------|
| follower_id | uuid FK → users | composite PK |
| following_id | uuid FK → users | composite PK |
| created_at | timestamp | |

### notifications

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid PK | |
| user_id | uuid FK → users | кому |
| type | enum | like, comment, follow, remeow |
| actor_id | uuid FK → users | кто |
| meow_id | uuid FK → meows nullable | |
| read | boolean default false | |
| created_at | timestamp | |

---

## API эндпоинты

### Auth

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/logout` | Выход (инвалидация refresh в Redis) |
| POST | `/api/auth/refresh` | Обновление токенов |
| GET | `/api/auth/me` | Текущий пользователь |

### Cats (профили)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/cats/:username` | Профиль |
| PATCH | `/api/cats/me` | Обновить свой профиль |
| POST | `/api/cats/:username/follow` | Подписаться |
| DELETE | `/api/cats/:username/follow` | Отписаться |

### Meows

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/meows/feed` | Семантический фид |
| POST | `/api/meows` | Создать мяут |
| GET | `/api/meows/:id` | Один мяут |
| DELETE | `/api/meows/:id` | Удалить |

### Comments

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/meows/:id/comments` | Комментарии к мяуту |
| POST | `/api/meows/:id/comments` | Комментировать |

### Likes

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/meows/:id/like` | Лайкнуть |
| DELETE | `/api/meows/:id/like` | Убрать лайк |

### Notifications

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/notifications` | Список уведомлений |
| PATCH | `/api/notifications/read` | Пометить прочитанными |

### Search

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/search?q=...` | Поиск пользователей |

---

## Механика тильды и pgvector

### Создание мяута

1. Парсить контент, извлечь `~слова` (регулярка: `/~([\wа-яА-ЯёЁ]+)/g`)
2. Сохранить теги в `meow_tags`
3. Сгенерировать эмбеддинг для конкатенации тегов через OpenAI Embeddings API (или локальную модель)
4. Сохранить вектор в поле `embedding`

### Формирование фида

1. Взять последний мяут текущего пользователя
2. Извлечь его embedding
3. `SELECT * FROM meows ORDER BY embedding <=> $1 LIMIT 20` (cosine distance)
4. Исключить собственные мяуты
5. Пагинация через cursor (id последнего мяута)

### Кеширование

- Redis кеш фида: ключ `feed:{user_id}:{last_meow_id}`, TTL 30 секунд
- Инвалидация при создании нового мяута пользователем

---

## main.ts (bootstrap)

```typescript
const app = await NestFactory.create(
  AppModule,
  new FastifyAdapter({ logger: true })
)

app.register(fastifyCookie)
app.enableCors({ origin: ['https://meowter.app', 'https://meowter.ru'], credentials: true })
app.setGlobalPrefix('api')
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

const config = new DocumentBuilder()
  .setTitle('Meowter API')
  .setVersion('1.0')
  .build()
SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))

await app.listen(4000, '0.0.0.0')
```
