# lab2 — Layered architecture + DDD refactor of lab 1

Рефакторинг лабораторної №1 (Express + JWT CRUD на in-memory масивах) у
**чотиришарову архітектуру** з тактичними патернами Domain-Driven Design.

## Стек

- Node.js ≥ 20, Express 4, JWT, bcryptjs
- `better-sqlite3` для опціонального SQLite-сховища
- Тести: вбудований `node:test` (без зовнішніх раннерів)

## Структура

```
src/
├── domain/                # Шар домену — не залежить ні від чого
│   ├── errors/            # DomainError + підтипи
│   ├── user/              # User entity, Username/PasswordHash VO,
│   │                      # IUserRepository, UserFactory
│   ├── item/              # Item entity, ItemName/ItemDescription VO,
│   │                      # IItemRepository, ItemFactory
│   └── ports/             # IPasswordHasher, ITokenService
├── application/           # Use cases та DTO. Імпортує тільки з domain/
│   ├── dto/
│   └── use_cases/
├── infrastructure/        # Адаптери для портів домену
│   ├── persistence/
│   │   ├── orm/           # UserRecord, ItemRecord (рядки таблиць)
│   │   ├── mappers/       # Domain ↔ Record
│   │   ├── memory/        # InMemory*Repository
│   │   └── sqlite/        # Sqlite*Repository + SqliteClient
│   ├── security/          # BcryptPasswordHasher, JwtTokenService
│   └── config/container.js  # Composition root (DI)
└── presentation/
    ├── routes/            # Express маршрути (тонкі: парсинг → use case)
    ├── middleware/        # auth + error handler (мапінг доменних помилок у HTTP)
    └── app.js             # Збирач Express-додатку
tests/
├── _helpers/              # Фейкові реалізації портів, http-клієнт
├── unit/
│   ├── domain/            # Тести VO, Entity, Factory (без БД, без HTTP)
│   ├── application/       # Use cases з fake-репозиторіями
│   └── infrastructure/    # Маппери
└── integration/           # Повний цикл HTTP → application → domain
docs/
├── adr/001-rich-domain-model.md
└── analysis/lab2.md
```

## Правило залежностей

```
Presentation → Application → Domain ← Infrastructure
```

Жоден файл у `src/domain/` не імпортує нічого з інших шарів і нічого
з npm-пакетів — це інваріант, який легко перевірити:

```bash
grep -rE "require\('(?!\.{1,2}/)" src/domain && echo "BROKEN" || echo "OK"
```

## Запуск

```bash
npm install

# in-memory (за замовчуванням)
npm start

# з SQLite (створить lab2.db)
npm run start:sqlite
```

API ідентичний lab 1:

| Method | Path                | Auth | Тіло запиту                          |
|--------|---------------------|------|---------------------------------------|
| POST   | `/auth/register`    | —    | `{ username, password }`              |
| POST   | `/auth/login`       | —    | `{ username, password }` → `{ token }`|
| GET    | `/items`            | —    | —                                     |
| GET    | `/items/:id`        | —    | —                                     |
| POST   | `/items`            | JWT  | `{ name, description? }`              |
| PUT    | `/items/:id`        | JWT  | `{ name?, description? }`             |
| DELETE | `/items/:id`        | JWT  | —                                     |

## Тести

```bash
npm test                 # всі
npm run test:unit        # лише доменні + application (без БД, без HTTP)
npm run test:integration # повний цикл через Express
```

Unit-тести **не вимагають** ні Express, ні bcrypt, ні SQLite — вони
запускаються через фейкові реалізації портів і чистий `node:test`.

## ADR і аналіз

- `docs/adr/001-rich-domain-model.md` — рішення на користь Rich Model.
- `docs/analysis/lab2.md` — порівняльний аналіз з лабою 1.
