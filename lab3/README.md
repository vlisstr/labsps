# lab3 — CQS refactor of lab 2

Розщеплення Application Layer на **Commands** (запис) і **Queries** (читання)
з окремими Handler-ами для кожної операції. На основі шарової архітектури
з lab 2; домен і інфраструктура майже не змінилися — змінився Application Layer.

## Стек

- Node.js ≥ 20, Express 4, JWT, bcryptjs
- `better-sqlite3` для опціонального SQLite
- Тести: вбудований `node:test`

## Структура

```
src/
├── domain/                # без змін з lab 2
├── application/
│   ├── commands/                            # ПИСЬМОВА сторона
│   │   ├── register_user/
│   │   │   ├── RegisterUserCommand.js       # DTO-намір
│   │   │   └── RegisterUserCommandHandler.js
│   │   ├── login_user/                      # Login — теж команда (видає токен)
│   │   ├── create_item/
│   │   ├── update_item/
│   │   └── delete_item/
│   ├── queries/                             # ЧИТАЛЬНА сторона
│   │   ├── list_items/
│   │   │   ├── ListItemsQuery.js
│   │   │   └── ListItemsQueryHandler.js
│   │   ├── get_item/
│   │   └── read_repositories/
│   │       └── IItemReadRepository.js       # порт для read-сторони
│   └── dto/
│       └── ItemReadModels.js                # ItemListItemDTO, ItemDetailDTO
├── infrastructure/
│   └── persistence/
│       ├── memory/InMemoryItemReadRepository.js
│       └── sqlite/SqliteItemReadRepository.js   # SQL з JOIN на users
└── presentation/          # тонкі контролери: HTTP → Command/Query
tests/
├── unit/commands/         # тести команд через fake-репозиторії, без БД
├── unit/queries/          # тести запитів через fake read-репозиторій
├── unit/domain/           # доменні тести з lab 2
└── integration/           # повний HTTP-цикл
docs/
├── adr/001-rich-domain-model.md
├── adr/002-cqs-application-layer.md
└── analysis/lab3.md
```

## Що змінилося порівняно з lab 2

| Концепція | lab 2 | lab 3 |
|---|---|---|
| Application | `RegisterUserUseCase`, …, `UpdateItemUseCase`, … | `RegisterUserCommandHandler`, `ListItemsQueryHandler`, … |
| Метод | `execute({...})` повертає DTO | Команди: `handle(cmd)` → `id`, або void. Запити: `handle(query)` → DTO |
| List/Get | той самий `IItemRepository` | окремий `IItemReadRepository` + read-моделі |
| `POST /items` | `201` + повний об'єкт | `201` + `{ id }` (CQS: команда повертає лише ID) |
| `PUT /items/:id` | `200` + об'єкт | `204` (команда нічого не повертає) |
| `GET /items` | список доменно-схожих DTO | `ItemListItemDTO[]` з `ownerUsername` (денормалізовано) |
| SQL для читання | той самий repo + map | окремий read-repo з `JOIN items × users` |

## Запуск

```bash
npm install

npm start              # in-memory
npm run start:sqlite   # SQLite з JOIN-проєкцією для read

npm test               # 50 unit + integration
npm run test:unit
npm run test:integration
```

## Документи

- `docs/adr/001-rich-domain-model.md` — рішення з lab 2.
- `docs/adr/002-cqs-application-layer.md` — обґрунтування CQS на рівні Application.
- `docs/analysis/lab3.md` — порівняльний аналіз з lab 2.
