# Лабораторна робота №3 — аналіз

## 1. Що змінилося в структурі проєкту порівняно з lab 2

Зміни локалізовані переважно в Application Layer і частково в Presentation.
Domain і Infrastructure залишилися майже такими ж, як у lab 2.

**Було (lab 2):**
```
application/
├── dto/views.js                    # itemToView, userToView
└── use_cases/
    ├── RegisterUserUseCase.js
    ├── LoginUserUseCase.js
    ├── CreateItemUseCase.js
    ├── UpdateItemUseCase.js
    ├── DeleteItemUseCase.js
    ├── GetItemUseCase.js
    └── ListItemsUseCase.js
```

**Стало (lab 3):**
```
application/
├── commands/
│   ├── register_user/{Command, CommandHandler}
│   ├── login_user/{Command, CommandHandler}
│   ├── create_item/{Command, CommandHandler}
│   ├── update_item/{Command, CommandHandler}
│   └── delete_item/{Command, CommandHandler}
├── queries/
│   ├── list_items/{Query, QueryHandler}
│   ├── get_item/{Query, QueryHandler}
│   └── read_repositories/IItemReadRepository.js
└── dto/ItemReadModels.js           # ItemListItemDTO, ItemDetailDTO
```

Інші точкові зміни:

- `IItemRepository.findAll()` — **видалено з домену**, бо це read-операція.
  Доменний репозиторій тепер обслуговує лише команди.
- `infrastructure/persistence/memory/InMemoryItemReadRepository.js` — нова
  реалізація read-репозиторію, яка ділить in-memory stores з write-репозиторіями
  через `repo.store` getter.
- `infrastructure/persistence/sqlite/SqliteItemReadRepository.js` — нова
  реалізація з реальним SQL `LEFT JOIN items × users`, що повертає
  `ItemListItemDTO` з полем `ownerUsername`.
- Контролери стали тонкими: `req.body` → `new XCommand(...)` → `handler.handle(cmd)`.
- `POST /items` повертає `201 { id }` (а не повну модель), `PUT /items/:id` і
  `DELETE /items/:id` повертають `204 No Content`.

## 2. Переваги CQS

**Чіткіша семантика API.** Раніше POST повертав повну модель, і клієнтська
сторона мала спокусу не робити GET, а використовувати ці поля напряму.
Тепер `Command → { id }` робить очевидним, що клієнт має зробити окремий
запит, якщо потрібні актуальні дані. Не змішуємо ефект і результат у одному
HTTP-виклику.

**Read-моделі можуть денормалізуватися без шкоди для домену.**
`ItemListItemDTO` тепер містить `ownerUsername` — на write-стороні це поле
не існує (там лише `ownerId`), а SQL-репозиторій підмішує його через JOIN.
Це класичний випадок, коли read-схема відрізняється від write-схеми, і CQS
це дозволяє чисто, без хаків.

**Маленькі handler-и з мінімумом залежностей.** `ListItemsQueryHandler`
залежить лише від `IItemReadRepository` — йому не потрібен ані хешер, ані
токени, ані доменна фабрика. Якщо в Service-підході такий клас отримував
би 6 залежностей через конструктор, тут — рівно одна.

**Розширюваність через додавання, а не зміну.** Нова операція =
нова папка з Command/Handler. Існуючі handler-и не змінюються. Це Open/Closed
у дії. Один файл (`container.js`) — єдине місце, де реєструється новий handler.

**Різний підхід до тестування природно випливає з розділення.**
- Тести команд — unit, через fake-репозиторії, без БД, перевіряють поведінку
  (`UpdateItem` чужого item-а кидає `ForbiddenError`).
- Тести запитів — або unit через fake read-repo (перевіряємо що handler
  повертає DTO, а не доменну модель), або integration через реальний SQL
  (перевіряємо що `JOIN` справді віддає `ownerUsername`).
- 50 unit-тестів виконуються ~700 мс без жодних зовнішніх залежностей.

## 3. Недоліки CQS

**Більше файлів.** Кожна операція тепер це окрема папка з двома файлами
(Command + Handler), плюс реєстрація в контейнері. На пʼять команд і
два запити — це 14 файлів проти 7 use case-ів у lab 2.

**Дублювання структур даних на межі.** `RegisterUserCommand` і `LoginUserCommand`
обидва містять `{ username, password }`. Спокуса об'єднати — псевдо-економія:
ці DTO мають різні життєві цикли і різну валідність, спільний клас рано чи
пізно отримає поле, що потрібне одному, але не іншому.

**Складніше для новачка зрозуміти, де що шукати.** «Де код реєстрації?» —
тепер це `commands/register_user/`, а не «той метод у `UserService`».
ADR і README допомагають, але крива входу справді трохи стрімкіша.

**Read-сторона з більш складними запитами поки що не виправдана.** Поки в нас
лише `findAll` та `findById`, окремий `IItemReadRepository` виглядає як
дублювання. Він виправдовує себе тоді, коли з'являються фільтри, пагінація,
агрегації, або коли read-сторона переїздить в read-репліку / Elasticsearch /
кешовану view-таблицю — а це і є шлях від CQS до CQRS, якщо знадобиться.

## 4. Чим Command/Query Handler відрізняється від Service «що робить усе»

| Властивість | `BookingService.all_methods()` | `XCommandHandler.handle(cmd)` |
|---|---|---|
| Відповідальність | багато операцій | одна операція |
| Залежності | всі мислимі (repos, hashers, tokens, mailers, logger…) | тільки те, що потрібно для саме цієї операції |
| Як додати нову операцію | новий метод у тому самому класі | новий клас (Open/Closed) |
| Тест | мокаємо всі залежності, навіть непотрібні | мокаємо 1–3 залежності |
| Read vs write | в одному класі, плутаються | фізично в різних папках |
| Точка перетину з доменом | один великий клас знає про все | handler — тонкий клей |

Service був зручний у лабі-2 (7 use case-ів = 7 класів — теж непогано), але
зливав читання й запис в одному реєстрі. CQS жорстко розділяє ці категорії
у файловій структурі.

## 5. Як CQS впливає на розширюваність

**Додати команду «забути пароль» (`POST /auth/forgot-password`):**
- Створюємо `commands/forgot_password/{Command, Handler}`.
- Додаємо порт `IEmailSender` у `domain/ports/`, реалізацію в `infrastructure/security/`.
- Реєструємо в `container.js`. Один маршрут у `authRoutes.js`.
- **Нуль змін** в існуючих handler-ах і моделях.

**Додати запит «мої items»:**
- Створюємо `queries/list_my_items/{Query, Handler}`.
- Розширюємо `IItemReadRepository` методом `findByOwnerId(userId)`.
- Додаємо SQL з `WHERE owner_id = ?` у `SqliteItemReadRepository`.
- **Нуль змін** на write-стороні.

У lab 2 з use case-ами це теж було б нескладно, але повинні були б писати
ще й мапер у `views.js` і нічого не заважало переплутати read- і write-методи
в одному репозиторії.

## 6. Чим Read DTO відрізняється від доменної моделі

| Поле / спосіб роботи | `Item` (доменна модель) | `ItemDetailDTO` (read-модель) |
|---|---|---|
| `id` | `number` | `number` |
| `name` | `ItemName` VO (валідація, equals) | `string` |
| `description` | `ItemDescription` VO | `string` |
| `ownerId` | `number` (приватний доступ через геттер) | `number` |
| `ownerUsername` | — *не існує в домені* | `string` (денормалізовано з JOIN) |
| Методи | `rename()`, `changeDescription()`, `ensureCanBeDeletedBy()` | жодного |
| Призначення | захист інваріантів при записі | віддача на клієнт |
| Незмінність | поля private, мутації через методи | `Object.freeze()` |

**Чому це важливо**, як вимагає лаба:

1. **Контракт API не зав'язаний на домен.** Якщо завтра в домені з'явиться
   ще одне поле (наприклад, `internalScore`), воно не з'явиться автоматично
   у відповіді — поки ми явно не додамо його в `ItemDetailDTO`.
2. **Можна додавати UI-зручні поля без шкоди для моделі.** `ownerUsername`
   потрібен клієнту, але в домені його тримати нема сенсу — це призвело б до
   подвійної правди (а раптом username змінився після збереження?).
3. **DTO неможливо випадково мутувати у відповіді.** `Object.freeze()` ловить
   `dto.name = '...'` у момент написання коду — баг не доїде до продакшну.
4. **Read-модель може агрегувати кілька агрегатів.** Зараз ми joinім users.
   Завтра можемо join-ити статистику переглядів. Доменна модель `Item`
   залишається сфокусованою на власних інваріантах.

## 7. Висновки

CQS виявився найдешевшою з трьох лабораторних змін: домен з lab 2 не зачеплений,
інфраструктура отримала плюс один файл на read-сторону. Натомість архітектурно
з'явилося чітке правило: «команди — write, запити — read, не змішуються».

Реальний виграш — у двох речах: можливість денормалізувати read-схему
(`ownerUsername` через JOIN) без шкоди для write-моделі; та різні стилі
тестування для двох сторін (логіка vs SQL). На реальному CRUD-API з 5+
сутностями ця економія була б значною.

Перехід на повний CQRS (різні БД, проєкції через події) тут зайвий — поки
read і write працюють з тією ж SQLite, eventual consistency й event sourcing
не виправдовують своєї ціни.
