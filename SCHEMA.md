# Database Schema (ER Diagram)

The application utilizes a PostgreSQL database. Below is the simplified Entity-Relationship representation.

## ER Diagram

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Task : creates
    Project ||--o{ Task : contains

    User {
        String id PK "UUID"
        String email "Unique"
        String password "Hashed"
        String fullName
        DateTime createdAt
        DateTime updatedAt
    }

    Project {
        String id PK "UUID"
        String name
        String description "Nullable"
        ProjectStatus status "Default: PLANNING"
        DateTime startDate "Default: now()"
        DateTime endDate "Nullable"
        DateTime createdAt
        DateTime updatedAt
        String userId FK "Ref -> User"
    }

    Task {
        String id PK "UUID"
        String name
        String description "Nullable"
        TaskStatus status "Default: PENDING"
        TaskPriority priority "Default: MEDIUM"
        DateTime createdAt
        DateTime updatedAt
        String projectId FK "Ref -> Project"
        String userId FK "Ref -> User"
    }
```

## Enums
- **ProjectStatus**: `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`
- **TaskStatus**: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- **TaskPriority**: `LOW`, `MEDIUM`, `HIGH`

## Security Notes
- The `userId` on the `Task` model is derived server-side from the authenticated user during creation and is validated against the `Project`'s owner. Frontend attempts to forge ownership are blocked.
