# Meowter Frontend Plan

Директория: `web/`
Фреймворк: React 19 + TypeScript 5.9 strict
SSR: Rsbuild SSR (ручная настройка, два entry)

---

## Стек

### Ядро

- `react@19`, `react-dom@19`
- `typescript@~5.9`
- `effector@23`, `patronum`

### Роутинг и данные

- `atomic-router`, `atomic-router-react`
- `@farfetched/core`, `@farfetched/atomic-router`

### i18n

- `@lingui/core`, `@lingui/react`, `@lingui/cli`, `@lingui/swc-plugin`
- Русский — исходный язык, пишешь в коде через `<Trans>` и `` t` ` ``
- `yarn lingui extract` → генерирует каталог для английского перевода
- Домен определяет дефолтный язык: `meowter.ru` → ru, `meowter.app` → en

### UI

- `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-tabs` (добавлять по мере необходимости)
- Иконки: собственные SVG из Figma → `ui/icons/`

### Стили

- `sass` (SCSS Modules), `clsx`
- Импорт стилей: `import s from './Component.module.scss'`
- Несколько классов: `className={clsx(s.root, s.active)}`

### SSR

- Rsbuild SSR — два entry (client + server), rspack под капотом
- `rsbuild.config.ts` с двумя environments

### Мета-теги

- `react-helmet-async` — og:title, og:image, og:description для шаринга ссылок в Telegram/Twitter/Discord. SSR-safe

### Даты

- `date-fns` + русская локаль — «5 минут назад», форматирование дат. Tree-shakeable

### Загрузка файлов

- `react-dropzone` — загрузка аватара и картинок в мяуты. Headless, drag-and-drop

### Уведомления UI

- `sonner` — toast-нотификации («Meow опубликован», «Ошибка сети»)

### Бесконечный скролл

- `react-intersection-observer` — хук `useInView()` для подгрузки фида и lazy load картинок

### Виртуализация (позже, не на старте)

- `@tanstack/react-virtual` — рендер только видимых элементов в длинных списках

### Безопасность

- `isomorphic-dompurify` — санитизация пользовательского контента (ссылки в мяутах), SSR-safe

### Тесты

- `@rstest/core`, `@rstest/adapter-rsbuild` — тестовый фреймворк из экосистемы Rspack. Jest-совместимый API, наследует конфиг из `rsbuild.config.ts` через адаптер

### Линтинг

- `eslint@9` (flat config), `typescript-eslint`, `prettier`

### Pre-commit

- `husky` + `lint-staged`

---

## Структура директорий

```
web/
├── src/
│   ├── App.tsx                 # корневой компонент
│   ├── index.ts                # client entry
│   ├── server.ts               # server entry (SSR)
│   │
│   ├── core/                   # инициализация, провайдеры, конфиги
│   │   ├── providers.tsx       # LinguiProvider, RouterProvider, etc.
│   │   ├── helmet.tsx          # дефолтные мета-теги
│   │   └── index.ts
│   │
│   ├── screens/                # экраны (привязаны к роутам)
│   │   ├── Feed/
│   │   ├── CatProfile/         # /cat/:username
│   │   ├── MeowThread/         # /cat/:username/meow/:meowId
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Search/
│   │   ├── Notifications/
│   │   ├── Settings/
│   │   ├── CreateMeow/         # /meow
│   │   ├── Welcome/            # / (неавторизован)
│   │   ├── NotFound/
│   │   └── Error/
│   │
│   ├── modules/                # логические модули (компонент + models)
│   │   ├── Auth/               # PascalCase!
│   │   │   ├── Auth.tsx
│   │   │   ├── Auth.module.scss
│   │   │   ├── models/         # Effector модель (паттерн ниже)
│   │   │   └── index.ts
│   │   ├── Meow/
│   │   ├── Feed/
│   │   ├── Profile/
│   │   ├── Search/
│   │   └── Notifications/
│   │
│   ├── ui/                     # глупый UI-кит, без логики
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Avatar/
│   │   ├── Spinner/
│   │   ├── Toast/              # обёртка над sonner
│   │   ├── icons/              # SVG-иконки из Figma
│   │   ├── theme/              # SCSS переменные, миксины, глобальные стили
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _reset.scss
│   │   │   └── _global.scss
│   │   └── index.ts
│   │
│   ├── lib/                    # утилиты
│   │   ├── parseTildes.ts      # парсинг ~слов из текста
│   │   ├── formatDate.ts       # обёртка над date-fns
│   │   └── index.ts
│   │
│   ├── logic/                  # агностичная логика (Effector без привязки к UI)
│   │   ├── session/            # текущий пользователь, токен, refresh
│   │   └── router/             # atomic-router конфиг, все роуты
│   │
│   └── assets/                 # статика (лого, картинки котов)
│
├── locales/                    # lingui каталоги
│   ├── ru/
│   │   └── messages.po
│   └── en/
│       └── messages.po
│
├── public/
├── package.json
├── tsconfig.json
├── rsbuild.config.ts
└── rstest.config.ts            # extends withRsbuildConfig()
```

---

## Effector паттерн модели

Каждый модуль с Effector следует единой структуре:

```
models/{layer}/
├── types/
│   ├── {layer}.ts
│   └── index.ts
├── models/              # только декларации, без логики
│   ├── {layer}.ts       # stores, events
│   ├── fx.ts            # createEffect
│   └── index.ts         # реэкспорт (включая '../types')
├── init/                # только логика (sample, patronum, attach)
│   ├── {layer}.ts       # sample-связи
│   ├── fx.ts            # fx.use() / attach()
│   └── index.ts         # import-only (не export!)
├── lib/                 # утилиты слоя (если нужны)
├── constants/           # константы (если нужны)
├── __tests__/
│   └── {layer}.test.ts
└── index.ts             # export * from './models', './types', './lib'
```

Правила:
- `types/` — все типы слоя, никогда inline
- `models/` — только декларации, ноль логики
- `init/` — только логика, import-only
- Тесты через `fork` + `allSettled`

---

## SSR-настройка (Rsbuild)

### rsbuild.config.ts

Два environments: `client` и `server`. Rspack под капотом.

Алиасы из tsconfig дублируются в `source.alias`:
```typescript
export default {
  source: {
    alias: {
      '@screens': './src/screens',
      '@modules': './src/modules',
      '@ui': './src/ui',
      '@logic': './src/logic',
      '@lib': './src/lib',
      '@core': './src/core',
      '@assets': './src/assets',
    },
  },
}
```

### server.ts (серверный entry)

1. Получить запрос (URL + Host заголовок)
2. Определить locale по домену (meowter.ru → ru, meowter.app → en)
3. Создать Effector scope через `fork()`
4. Определить роут через atomic-router
5. Загрузить данные через `allSettled` (farfetched queries)
6. Рендер React в HTML через `renderToString` (или `renderToReadableStream`)
7. Собрать мета-теги через `react-helmet-async`
8. Сериализовать scope для клиента
9. Вставить всё в HTML-шаблон, отдать

### index.ts (клиентский entry)

1. Десериализовать scope из HTML
2. Определить locale
3. Гидрировать React через `hydrateRoot`
4. Дальше работает как SPA (клиентская навигация)

---

## Роуты

| Путь | Экран | Доступ |
|------|-------|--------|
| `/` | Welcome / Feed | публичный / авторизованный |
| `/login` | Login | только гости |
| `/register` | Register | только гости |
| `/feed` | Feed | авторизованный |
| `/cat/:username` | CatProfile | публичный |
| `/cat/:username/meow/:meowId` | MeowThread | публичный |
| `/search` | Search | авторизованный |
| `/notifications` | Notifications | авторизованный |
| `/settings` | Settings | авторизованный |
| `/meow` | CreateMeow | авторизованный |

---

## Формы

Ванильный Effector — сторы для полей, события для изменений, sample для валидации и сабмита. Никаких внешних библиотек. ~15-20 строк на форму.

---

## Дизайн-токены

```scss
// ui/theme/_variables.scss

// цвета
$color-primary: #F5A623;       // оранжевый акцент
$color-bg: #FFFFFF;
$color-separator: #EEEEEE;
$color-text: #333333;
$color-text-secondary: #999999;
$color-error: #E53935;
$color-success: #43A047;

// типографика
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 17px;
$font-size-lg: 19px;
$font-size-title: 28px;

// размеры
$avatar-sm: 35px;
$avatar-md: 45px;
$avatar-lg: 60px;
$avatar-xl: 118px;             // настройки
$avatar-profile: 140px;        // регистрация

// отступы
$spacing-xs: 5px;
$spacing-sm: 10px;
$spacing-md: 15px;
$spacing-lg: 20px;
$spacing-xl: 30px;

// layout
$content-width: 320px;         // mobile-first base
$header-height: 55px;
$bottom-nav-height: 60px;
$separator-height: 1px;

// border-radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 18px;
$radius-round: 50%;
$radius-button: 25px;          // скруглённые кнопки
```
