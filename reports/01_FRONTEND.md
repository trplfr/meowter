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
│   ├── App.tsx                 # корневой компонент (RouterProvider + RoutesView)
│   ├── index.tsx               # client entry (гидрация / SPA)
│   ├── server.tsx              # server entry (SSR render)
│   │
│   ├── core/                   # инфраструктура приложения
│   │   ├── router/             # atomic-router
│   │   │   ├── router.ts       # routes, routesMap, router
│   │   │   ├── types.ts        # IRouteConfig
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── pages/                  # страницы (привязаны к роутам)
│   │   ├── Welcome/            # /
│   │   ├── Login/              # /login
│   │   ├── Register/           # /register
│   │   ├── Feed/               # /feed
│   │   ├── CatProfile/         # /cat/:username
│   │   ├── MeowThread/         # /cat/:username/meow/:meowId
│   │   ├── Search/             # /search
│   │   ├── Notifications/      # /notifications
│   │   ├── Settings/           # /settings
│   │   ├── CreateMeow/         # /meow
│   │   ├── NotFound/
│   │   └── index.ts            # pages[] для createRoutesView
│   │
│   ├── modules/                # логические модули (компонент + models)
│   │   ├── Auth/               # PascalCase!
│   │   │   ├── Auth.tsx
│   │   │   ├── Auth.module.scss
│   │   │   ├── models/         # Effector модель (паттерн)
│   │   │   └── index.ts
│   │   ├── Meow/
│   │   ├── Feed/
│   │   ├── Profile/
│   │   ├── Search/
│   │   └── Notifications/
│   │
│   ├── ui/                     # глупый UI-кит, без логики
│   │   ├── icons/              # SVG-иконки из Figma
│   │   ├── theme/              # SCSS переменные, миксины, глобальные стили
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _reset.scss
│   │   │   └── global.scss
│   │   └── index.ts
│   │
│   ├── lib/                    # утилиты
│   │   └── index.ts
│   │
│   ├── logic/                  # Effector-модели без UI
│   │   ├── session/            # effector-паттерн (types/models/init)
│   │   └── index.ts            # import всех init-слоев
│   │
│   └── assets/                 # статика (лого, картинки котов)
│
├── locales/                    # lingui каталоги
│   ├── ru/
│   └── en/
│
├── package.json
├── tsconfig.json
└── rsbuild.config.ts
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

Алиасы из tsconfig дублируются в `resolve.alias`:
```typescript
export default {
  resolve: {
    alias: {
      '@pages': './src/pages',
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

SSR реализован через `dev.setupMiddlewares` в rsbuild.config.ts. Два environments: `web` (target: web) и `node` (target: node). Dev-сервер перехватывает HTML-запросы, вызывает `render()` из серверного бандла и вставляет результат в HTML-шаблон.

### server.tsx (серверный entry)

1. `fork()` — создать изолированный Effector scope
2. Определить locale по домену (meowter.ru -> ru, meowter.app -> en)
3. `createMemoryHistory({ initialEntries: [url] })` — серверный history
4. `allSettled(router.setHistory, { scope, params: history })` — определить роут
5. `renderToString(<Provider value={scope}><App /></Provider>)` — рендер в HTML
6. `serialize(scope)` — сериализовать стейт
7. Вернуть `{ html, scopeData, locale }`

### index.tsx (клиентский entry)

1. Прочитать `__SSR_STATE__` из `globalThis`
2. `fork({ values: serverState })` — восстановить серверный scope
3. `allSettled(router.setHistory, { scope, params: browserHistory })` — запустить роутинг
4. `hydrateRoot` (если есть серверный стейт) или `createRoot` (dev без SSR)

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
