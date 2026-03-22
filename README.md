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

- Node.js
- Express.js
- PostgreSQL (NeonDB)
- Prisma ORM
- Cloudflare R2 (file storage)
- REST API

---

## Future Improvements

- Admin panel
- Advanced permissions

---

## 🇵🇱 Opis

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

- Node.js
- Express.js
- PostgreSQL (NeonDB)
- Prisma ORM
- Cloudflare R2
- REST API

---

## Plany rozwoju

- Panel admina
- Rozbudowany system uprawnień

---

## License & Copyright

© 2026 **Mikołaj Melnyk**

---

## Contact

- https://mikolajmelnyk.pl/
- https://www.linkedin.com/in/miko%C5%82aj-melnyk-634213335/
