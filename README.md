# infoNest Backend

## Overview

**infoNest** is a modern, scalable platform designed for organizing, storing, and collaborating on structured information such as documents, workspaces, and knowledge resources. The goal of the project is to provide users with a flexible environment to manage content, collaborate with others, and securely store both lightweight and heavy data (files).

This repository contains the **backend layer** of the application, responsible for handling business logic, data management, and communication between the frontend and external services.

---

## Backend Responsibilities

The backend is built as a **RESTful API** and is responsible for:

### Authentication & Authorization

- User registration and login
- Secure password handling
- Role-based access control (RBAC)
- Workspace-level permissions (Owner, Admin, Editor, Viewer, Guest)

### Workspace & Content Management

- Creating and managing workspaces
- Assigning users to workspaces with different roles
- Managing categories and documents
- Supporting private and public visibility

### Document System

- Creating, updating, and deleting documents
- Organizing documents into categories
- Tracking ownership
- Supporting version control (revisions)

### File Handling

- Storing file metadata in the database
- Integrating with cloud storage (e.g. Cloudflare R2)
- Linking files to documents
- Keeping heavy data outside the database (URL-based storage)

### Versioning System

- Tracking document changes
- Storing revision history
- Future support for rollback and comparison

### Data Layer

- Prisma ORM for schema and queries
- Strong typing and validation
- PostgreSQL (NeonDB) as database

### Security

- Input validation
- Protection against SQL Injection (via ORM)
- Structured error handling

---

## Architecture Overview

- **Routes** – API endpoints
- **Controllers** – request handling
- **Services** – business logic
- **Config** – environment and database setup
- **Prisma** – schema and database client

---

## Technology Stack

- Runtime: Node.js (v20+)
- Framework: Express.js (v5.2.1)
- Language: JavaScript / TypeScript (for Prisma types)
- Database: PostgreSQL (NeonDB)
- ORM: Prisma
- Storage: Cloudflare R2 (S3-compatible)
- Security: Helmet.js, CORS, Bcrypt.js, JSON Web Tokens (JWT)
- Validation: Zod
- Code Quality: ESLint (v10), Prettier, Husky, lint-staged, Commitlint
- Dev Tools: Nodemon, Morgan (logging)

---

## Future Improvements

- Admin panel
- Advanced permissions

---

## pl: Opis

**infoNest** to nowoczesna, skalowalna platforma służąca do organizowania, przechowywania oraz współdzielenia uporządkowanych informacji, takich jak dokumenty, workspace’y oraz zasoby wiedzy. Celem projektu jest zapewnienie użytkownikom elastycznego środowiska do zarządzania treścią, współpracy oraz bezpiecznego przechowywania danych (w tym plików).

To repozytorium zawiera **warstwę backendową**, odpowiedzialną za logikę biznesową, zarządzanie danymi oraz komunikację z frontendem i usługami zewnętrznymi.

---

## Odpowiedzialności Backendu

Backend został zaprojektowany jako **REST API** i odpowiada za:

### Autoryzacja i uwierzytelnianie

- Rejestracja i logowanie użytkowników
- Bezpieczne przechowywanie haseł
- System ról (RBAC)
- Uprawnienia na poziomie workspace

### Zarządzanie Workspace i Treścią

- Tworzenie i zarządzanie workspace’ami
- Przypisywanie użytkowników do workspace
- Kategorie i dokumenty
- Widoczność prywatna/publiczna

### System Dokumentów

- Tworzenie, edycja i usuwanie dokumentów
- Organizacja w kategorie
- Śledzenie właściciela
- System wersjonowania (revisions)

### Obsługa Plików

- Przechowywanie metadanych w bazie
- Integracja z chmurą (Cloudflare R2)
- Powiązanie plików z dokumentami
- Przechowywanie plików poza bazą (URL)

### Wersjonowanie

- Historia zmian dokumentów
- Możliwość rozbudowy (rollback, diff)

### Warstwa danych

- Prisma ORM
- Typowanie i walidacja danych
- PostgreSQL (NeonDB)

### Bezpieczeństwo

- Walidacja danych wejściowych
- Ochrona przed SQL Injection
- Obsługa błędów

---

## Architektura

- **Routes** – endpointy API
- **Controllers** – obsługa requestów
- **Services** – logika biznesowa
- **Config** – konfiguracja
- **Prisma** – schema i ORM

---

## Technologie

- Runtime: Node.js (v20+)
- Framework: Express.js (v5.2.1)
- Język: JavaScript / TypeScript (dla typów Prisma)
- Baza danych: PostgreSQL (NeonDB)
- ORM: Prisma
- Storage: Cloudflare R2
- Bezpieczeństwo: Helmet.js, CORS, Bcrypt.js, JWT
- Walidacja: Zod
- Jakość kodu(lintery): ESLint (v10), Prettier, Husky, lint-staged, Commitlint
- Narzędzia: Nodemon, Morgan (logowanie)

---

## Plany rozwoju

- Panel admina
- Rozbudowany system uprawnień

---

# ua: Огляд

**infoNest** — це сучасна, масштабована платформа для організації, зберігання та спільної роботи над структурованою інформацією, такою як документи, робочі простори (workspaces) та бази знань. Мета проєкту — надати користувачам гнучке середовище для управління контентом, співпраці та безпечного зберігання як легких, так і важких даних (файлів).

Цей репозиторій містить **бекенд-шар** застосунку, який відповідає за бізнес-логіку, управління даними та взаємодію з фронтендом і зовнішніми сервісами.

---

## Обов'язки бекенду

Бекенд побудований як **REST API** і відповідає за:

### Автентифікація та авторизація

- Реєстрація та вхід користувачів
- Безпечне хешування паролів
- Контроль доступу на основі ролей (RBAC)
- Дозволи на рівні workspace (Owner, Admin, Editor, Viewer, Guest)

### Управління workspace та контентом

- Створення та управління workspace
- Призначення користувачів з різними ролями
- Управління категоріями та документами
- Підтримка приватної та публічної видимості

### Система документів

- Створення, редагування та видалення документів
- Організація документів за категоріями
- Відстеження власника
- Підтримка версійності (revisions)

### Робота з файлами

- Зберігання метаданих у базі даних
- Інтеграція з хмарним сховищем (Cloudflare R2)
- Прив'язка файлів до документів
- Зберігання важких даних поза БД (через URL)

### Система версійності

- Відстеження змін документів
- Зберігання історії ревізій
- Можливість розширення (rollback, порівняння версій)

### Шар даних

- Prisma ORM для схем і запитів
- Валідація та типізація
- PostgreSQL (NeonDB)

### Безпека

- Валідація вхідних даних
- Захист від SQL-ін’єкцій (через ORM)
- Структурована обробка помилок

---

## Архітектура

- **Routes** – API ендпоінти
- **Controllers** – обробка запитів
- **Services** – бізнес-логіка
- **Config** – конфігурація середовища та БД
- **Prisma** – схема та клієнт БД

---

## Технології

- Runtime: Node.js (v20+)
- Framework: Express.js (v5.2.1)
- Мова: JavaScript / TypeScript (для Prisma)
- База даних: PostgreSQL (NeonDB)
- ORM: Prisma
- Storage: Cloudflare R2
- Безпека: Helmet.js, CORS, Bcrypt.js, JWT
- Валідація: Zod
- Якість коду: ESLint, Prettier, Husky, lint-staged, Commitlint
- Інструменти: Nodemon, Morgan

---

## Плани розвитку

- Адмін-панель
- Розширена система прав доступу

---

## License & Copyright

© 2026 **Mikołaj Melnyk**

---

## Contact

- https://mikolajmelnyk.pl/
- https://www.linkedin.com/in/miko%C5%82aj-melnyk-634213335/
