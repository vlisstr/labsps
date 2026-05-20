# lab5 — Modular Monolith

Розщеплення системи на bounded contexts (модулі) в одному розгортуваному
артефакті. Три модулі: **Core** (users + items + auth), **Audit**
(append-only журнал), **Analytics** (агрегована статистика). Зв'язок —
через спільний in-process Event Bus, з ACL у модулях-споживачах.

## Архітектура

```
                ┌─────────────────────────────┐
                │   composition_root.js       │
                │   єдина точка склейки       │
                └────────────┬────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   ┌─────────┐         ┌──────────┐         ┌────────────┐
   │  Core   │ events  │  Audit   │ events  │ Analytics  │
   │ ─────── │ ──────▶ │ ──────── │ ──────▶ │ ────────── │
   │ users   │         │ AuditLog │         │ UserStats  │
   │ items   │         │   (ACL)  │         │  Daily     │
   │ auth    │         └──────────┘         │  Summary   │
   └─────────┘                              │   (ACL)    │
        ▲                                   └────────────┘
        │
   HTTP /auth, /items
                              HTTP /audit          HTTP /analytics/*
```

```
src/
├── shared/
│   ├── event_bus/                          # IEventBus + InProcessEventBus
│   └── contracts/                          # (зарезервовано)
├── modules/
│   ├── core/                               # bounded context: business
│   │   ├── domain/                         # User, Item, VOs, factories
│   │   ├── application/                    # Commands, Queries, Events
│   │   ├── infrastructure/                 # repos, security
│   │   └── module.js                       # ПУБЛІЧНИЙ КОНТРАКТ
│   ├── audit/                              # bounded context: журнал
│   │   ├── domain/AuditEntry.js
│   │   ├── application/
│   │   │   ├── IAuditLogger.js
│   │   │   └── subscribers/                # ACL: event → AuditEntry
│   │   ├── infrastructure/InMemoryAuditLogger.js
│   │   └── module.js
│   └── analytics/                          # bounded context: статистика
│       ├── domain/                         # UserStats, DailyMetric — ВЛАСНА модель
│       ├── application/
│       │   ├── handlers/                   # підписники
│       │   ├── queries/                    # GET /analytics/*
│       │   └── ports/                      # IUserStatsRepository, ...
│       ├── infrastructure/
│       │   ├── acl/CoreEventTranslator.js  # ACL: Core events → внутр. модель
│       │   └── persistence/                # in-memory stores
│       └── module.js
├── presentation/middleware/                # errorHandler (shared)
├── composition_root.js                     # склейка всіх модулів
└── server.js
```

## Правила ізоляції

1. **Жодний модуль не імпортує внутрішні класи іншого.** Лише `module.js`
   (публічний контракт) видимий ззовні. Перевіряється тестом
   `ModularIsolation.test.js`.
2. **Composition root — єдине місце, що знає про всі модулі.**
3. **Зв'язок — через події.** Core публікує `UserRegistered`, `ItemCreated` тощо.
   Audit і Analytics підписуються через свої ACL.
4. **ACL у споживачах.** Analytics має `CoreEventTranslator`, який мапить
   `ItemCreated` → виклик `UserStats.recordItemCreated()`. Зовнішні події
   не «протікають» далі ACL.

## Запуск

```bash
npm install
npm start                          # http://localhost:3000

# демо повного потоку:
curl -X POST localhost:3000/auth/register \
  -H 'Content-Type: application/json' -d '{"username":"alice","password":"secret123"}'
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' -d '{"username":"alice","password":"secret123"}' \
  | jq -r .token)
curl -X POST localhost:3000/items -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"Pen"}'

# 3 модулі бачать одну й ту саму подію:
curl localhost:3000/audit
curl localhost:3000/analytics/summary
curl localhost:3000/analytics/users
curl localhost:3000/analytics/daily
```

## Тести

```bash
npm test                  # 18 unit + 6 integration
npm run test:unit         # без express, ~400ms
npm run test:integration  # потребує express (npm install)
```

## Документи

- `docs/adr/004-modular-monolith.md` — обґрунтування меж контекстів
- `docs/analysis/lab5.md` — аналіз lab 5 + **ретроспектива курсу 1→5**
