# Database Schema (ER Diagram)

The application utilizes a PostgreSQL database managed via Prisma ORM. Below is the simplified Entity-Relationship representation.

## ER Diagram

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Task : creates
    User ||--o{ RefreshToken : has
    Project ||--o{ Task : contains

    User {
        String id PK "UUID"
        String fullName
        String email "Unique"
        String passwordHash
        String pushToken "Nullable"
        Role role "Default: USER"
        DateTime createdAt
        DateTime updatedAt
    }
    
    RefreshToken {
        String id PK "UUID"
        String token "Unique"
        String userId FK "Ref -> User, Cascade"
        DateTime expiresAt
        DateTime createdAt
    }

    Project {
        String id PK "UUID"
        String name
        String description "Nullable"
        ProjectStatus status "Default: NOT_STARTED"
        DateTime startDate "Nullable"
        DateTime endDate "Nullable"
        DateTime createdAt
        DateTime updatedAt
        String userId FK "Ref -> User, Cascade"
    }

    Task {
        String id PK "UUID"
        String name
        String description "Nullable"
        Priority priority "Default: MEDIUM"
        TaskStatus status "Default: PENDING"
        DateTime dueDate "Nullable"
        DateTime createdAt
        DateTime updatedAt
        String projectId FK "Ref -> Project, Cascade"
        String userId FK "Ref -> User, Cascade"
    }
```

## Enums
- **Role**: `USER`, `ADMIN`
- **ProjectStatus**: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- **TaskStatus**: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- **Priority**: `LOW`, `MEDIUM`, `HIGH`

## Security Notes
- The `userId` on the `Project` and `Task` models is derived server-side from the authenticated user during creation and is validated against the `Project`'s owner. Frontend attempts to forge ownership are blocked.
- Cascade deletion is enabled so deleting a `User` removes their `Project`s, `Task`s, and `RefreshToken`s, and deleting a `Project` removes its `Task`s.
