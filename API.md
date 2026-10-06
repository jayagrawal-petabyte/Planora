# API Documentation

The REST API is strictly typed and validates all payloads using Zod.
All protected routes require an `Authorization: Bearer <token>` header.

## Authentication Routes

### `POST /api/auth/register`
- **Body**: `{ fullName, email, password }`
- **Response**: `{ success: true, data: { user, token } }`

### `POST /api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ success: true, data: { user, token } }`

### `GET /api/auth/me`
- **Headers**: `Authorization`
- **Response**: `{ success: true, data: { user } }`

### `POST /api/auth/logout`
- **Headers**: `Authorization`
- **Response**: `{ success: true, data: null }`

---

## Project Routes
*All project routes require Authentication.*

### `GET /api/projects`
- **Query Params**: 
  - `search` (string): Search by project name or description
  - `status` (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD)
- **Response**: `{ success: true, data: { projects } }`

### `GET /api/projects/:id`
- **Response**: `{ success: true, data: { project } }`

### `POST /api/projects`
- **Body**: `{ name, description?, status? }`
- **Response**: `{ success: true, data: { project } }`

### `PUT /api/projects/:id`
- **Body**: `{ name?, description?, status? }`
- **Response**: `{ success: true, data: { project } }`

### `DELETE /api/projects/:id`
- **Response**: `{ success: true, data: null }`

---

## Task Routes
*All task routes require Authentication. Users can only fetch/modify tasks belonging to projects they own.*

### `GET /api/tasks`
- **Query Params**: 
  - `projectId` (Required string)
  - `search` (Optional string)
  - `status` (Optional: PENDING, IN_PROGRESS, COMPLETED)
  - `priority` (Optional: LOW, MEDIUM, HIGH)
- **Response**: `{ success: true, data: { tasks } }`

### `POST /api/tasks`
- **Body**: `{ name, description?, projectId, status?, priority? }`
- **Response**: `{ success: true, data: { task } }`

### `PUT /api/tasks/:id`
- **Body**: `{ name?, description?, status?, priority? }`
- **Response**: `{ success: true, data: { task } }`

### `DELETE /api/tasks/:id`
- **Response**: `{ success: true, data: null }`

---

## Dashboard Route

### `GET /api/dashboard`
- **Headers**: `Authorization`
- **Description**: Returns aggregated metrics (Total Projects, In-Progress Projects, Total Tasks, Completed Tasks, Pending Tasks).
- **Response**: `{ success: true, data: { stats: { ... } } }`
