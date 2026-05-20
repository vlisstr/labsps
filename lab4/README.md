# lab4 — sync vs async communication

Виділення допоміжного компонента **Audit Log** і реалізація двох способів
комунікації з ним: синхронного (Command Handler напряму викликає
auditLogger) і асинхронного (handler публікує Integration Event, audit-модуль
підписується через in-process Event Bus). На базі lab 3.

## Що нового порівняно з lab 3

```
src/
├── audit/                                # NEW: окремий допоміжний модуль
│   ├── AuditEntry.js
│   ├── InMemoryAuditLogger.js
│   └── subscribers/
│       ├── auditEventHandlers.js         # event → AuditEntry
│       └── registerAuditSubscribers.js
├── application/
│   ├── events/                           # NEW: Integration Events
│   │   ├── UserRegistered.js
│   │   ├── ItemCreated.js
│   │   ├── ItemUpdated.js
│   │   └── ItemDeleted.js
│   └── ports/                            # NEW
│       ├── IEventBus.js
│       └── IAuditLogger.js
├── infrastructure/
│   └── event_bus/
│       └── InProcessEventBus.js          # NEW: in-process pub/sub
└── presentation/routes/auditRoutes.js    # NEW: GET /audit
```

Command Handlers тепер приймають `mode`, `auditLogger`, `eventBus` через
конструктор і мають дві гілки виконання — sync і async — обидві видимі
в коді одного класу.

## Запуск

```bash
npm install

COMMUNICATION_MODE=async npm start    # за замовчуванням async
COMMUNICATION_MODE=sync  npm start

npm test                              # 68 unit-тестів + integration
```

API:

| Method | Path                | Опис                       |
|--------|---------------------|----------------------------|
| POST   | `/auth/register`    | команда → publishes/audits |
| POST   | `/auth/login`       | без побічних ефектів       |
| POST   | `/items`            | команда → publishes/audits |
| PUT    | `/items/:id`        | команда → publishes/audits |
| DELETE | `/items/:id`        | команда → publishes/audits |
| GET    | `/items` `/items/:id` | запити (read-side, CQS) |
| GET    | `/audit`            | переглянути журнал аудиту  |

## Документи

- `docs/adr/003-sync-vs-async.md` — вибір async як режиму за замовчуванням
- `docs/analysis/lab4.md` — порівняльний аналіз з реальними числами
