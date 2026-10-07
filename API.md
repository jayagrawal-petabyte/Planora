# API Documentation

The REST API is strictly typed and validates all payloads using Zod (shared types).
All protected routes require an `Authorization: Bearer <token>` header.

## Authentication Routes

### `POST /api/auth/register`
- **Authentication**: None
- **Purpose**: Registers a new user account.
- **Body**: `{ fullName, email, password }`
- **Success Response**: `201 Created` with `{ success: true, data: { token, refreshToken, user } }`
- **Error Responses**: `400 Bad Request` if validation fails or email is already registered.

### `POST /api/auth/login`
- **Authentication**: None
- **Purpose**: Authenticates a user and returns tokens.
- **Body**: `{ email, password }`
- **Success Response**: `200 OK` with `{ success: true, data: { token, refreshToken, user } }`
- **Error Responses**: `401 Unauthorized` for invalid credentials.

### `POST /api/auth/refresh`
- **Authentication**: None (uses refresh token from body)
- **Purpose**: Refreshes an expired access token using a valid refresh token.
- **Body**: `{ refreshToken }`
- **Success Response**: `200 OK` with `{ success: true, data: { token } }`
- **Error Responses**: `401 Unauthorized` for invalid/expired refresh token.

### `GET /api/auth/me`
- **Authentication**: Required
- **Purpose**: Retrieves the currently authenticated user's profile.
- **Success Response**: `200 OK` with `{ success: true, data: { user } }`
- **Error Responses**: `401 Unauthorized` if token is missing or invalid.

### `POST /api/auth/logout`
- **Authentication**: None
- **Purpose**: Logs out a user (can invalidate refresh tokens if implemented).
- **Body**: `{ refreshToken }` (Optional)
- **Success Response**: `200 OK` with `{ success: true, data: null }`

### `POST /api/auth/push-token`
- **Authentication**: Required
- **Purpose**: Saves the user's Expo push notification token.
- **Body**: `{ pushToken }`
- **Success Response**: `200 OK` with `{ success: true, data: null }`

---

## Project Routes
*All project routes require Authentication.*

### `GET /api/projects`
- **Authentication**: Required
- **Purpose**: Retrieves a list of projects belonging to the authenticated user.
- **Query Params**: 
  - `search` (Optional string): Search by project name or description
  - `status` (Optional enum): `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- **Success Response**: `200 OK` with `{ success: true, data: { projects } }`

### `GET /api/projects/:id`
- **Authentication**: Required
- **Purpose**: Retrieves details for a specific project. User must own the project.
- **Success Response**: `200 OK` with `{ success: true, data: { project } }`
- **Error Responses**: `404 Not Found` if project doesn't exist or doesn't belong to user.

### `POST /api/projects`
- **Authentication**: Required
- **Purpose**: Creates a new project owned by the authenticated user.
- **Body**: `{ name, description?, status?, startDate?, endDate? }`
- **Success Response**: `201 Created` with `{ success: true, data: { project } }`

### `PUT /api/projects/:id`
- **Authentication**: Required
- **Purpose**: Updates an existing project. User must own the project.
- **Body**: `{ name?, description?, status?, startDate?, endDate? }`
- **Success Response**: `200 OK` with `{ success: true, data: { project } }`
- **Error Responses**: `404 Not Found` if project doesn't exist or doesn't belong to user.

### `DELETE /api/projects/:id`
- **Authentication**: Required
- **Purpose**: Deletes a project. 
- **Success Response**: `200 OK` with `{ success: true, data: null }`
- **Error Responses**: `403 Forbidden` if user is not an ADMIN.

---

## Task Routes
*All task routes require Authentication.*

### `GET /api/tasks`
- **Authentication**: Required
- **Purpose**: Retrieves a list of tasks belonging to the user's projects.
- **Query Params**: 
  - `projectId` (Required string): Filter tasks by a specific project.
  - `search` (Optional string): Search by task name or description.
  - `status` (Optional enum): `PENDING`, `IN_PROGRESS`, `COMPLETED`
  - `priority` (Optional enum): `LOW`, `MEDIUM`, `HIGH`
- **Success Response**: `200 OK` with `{ success: true, data: { tasks } }`

### `GET /api/tasks/:id`
- **Authentication**: Required
- **Purpose**: Retrieves details for a specific task.
- **Success Response**: `200 OK` with `{ success: true, data: { task } }`
- **Error Responses**: `404 Not Found` if task doesn't exist or doesn't belong to user.

### `POST /api/tasks`
- **Authentication**: Required
- **Purpose**: Creates a new task within a specific project.
- **Body**: `{ name, description?, projectId, status?, priority?, dueDate? }`
- **Success Response**: `201 Created` with `{ success: true, data: { task } }`
- **Error Responses**: `404 Not Found` if the specified `projectId` does not belong to the user.

### `PUT /api/tasks/:id`
- **Authentication**: Required
- **Purpose**: Updates an existing task.
- **Body**: `{ name?, description?, status?, priority?, dueDate? }`
- **Success Response**: `200 OK` with `{ success: true, data: { task } }`
- **Error Responses**: `404 Not Found` if task doesn't exist or doesn't belong to user.

### `DELETE /api/tasks/:id`
- **Authentication**: Required
- **Purpose**: Deletes a task.
- **Success Response**: `200 OK` with `{ success: true, data: null }`
- **Error Responses**: `403 Forbidden` if user is not an ADMIN.

---

## Dashboard Routes

### `GET /api/dashboard`
- **Authentication**: Required
- **Purpose**: Retrieves aggregated metrics for the authenticated user's projects and tasks.
- **Success Response**: `200 OK` with `{ success: true, data: { stats: { totalProjects, totalTasks, completedTasks, pendingTasks, inProgressProjects } } }`
