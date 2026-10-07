# Planora: Full Stack Project Management System

Planora is a comprehensive Project Management system built to help users seamlessly manage projects and tasks across Web and Mobile platforms. Both platforms synchronize in real-time through a centralized Node.js API and a PostgreSQL database.

## 🌟 Features
- **Authentication**: Secure registration, login, and logout. Sessions managed via JWT and Refresh tokens.
- **Project Management**: Create, read, update, and delete projects.
- **Task Management**: Create tasks within projects, assign priorities (LOW, MEDIUM, HIGH), and track status (PENDING, IN_PROGRESS, COMPLETED).
- **Dashboard**: Aggregated statistics tracking total projects, tasks, and their statuses.
- **Search & Filtering**: Search projects and tasks by name; filter by status and priority.
- **Real-time Synchronization**: Unified backend guarantees that changes on mobile immediately reflect on the web and vice versa.

## 🏗 Web + Mobile Architecture
Planora utilizes a single monorepo structure. Both the **React Web App** and the **React Native Mobile App** communicate with the exact same **Node.js/Express Backend API**, ensuring absolute data consistency without maintaining separate backend logic. Shared TypeScript types and validation schemas are hoisted in the `@planora/shared` workspace, ensuring strict typing between all clients and the server.

## 💻 Technology Stack
- **Backend API**: Node.js, Express, Prisma ORM, Zod, JWT
- **Web App**: React, Vite, React Router, CSS Art / Vanilla CSS
- **Mobile App**: React Native, Expo, React Navigation, Expo Secure Store
- **Database**: PostgreSQL (hosted on Supabase)
- **Monorepo Management**: NPM Workspaces

## 📁 Project Structure
- `app/` - React Native (Expo) Mobile application
- `packages/shared/` - Shared TypeScript definitions and Zod validation schemas
- `web/backend/` - Node.js Express API and Prisma schema
- `web/frontend/` - React Web application (Vite)
- `docker-compose.yml` - Docker setup for web and backend
- `vercel.json`, `render.yaml` - Production deployment configurations

## 🔒 Authentication and Security Approach
- **Security**: Custom JWT implementation (does *not* use Supabase Auth). Passwords are hashed using `bcrypt` and never stored in plain text.
- **Authorization**: Strict backend ownership enforcement. Users can only CRUD their own projects and tasks. Attempts to forge ownership from the frontend are blocked. Role-Based Access Control (RBAC) ensures only ADMINs can delete records.
- **Mobile Security**: Uses `expo-secure-store` to safely encrypt tokens on mobile devices.
- **Validation**: All API inputs are rigorously typed and sanitized using `Zod`.
- **Global Error Handling**: Both Web and Mobile feature Axios interceptors for handling network disconnections and expired tokens, routing users back to login when necessary.

## 🗄 Database (Supabase) Setup
Planora uses PostgreSQL managed via Prisma. The database is hosted on **Supabase**.
- Supabase is used strictly for PostgreSQL database hosting.
- The backend connects via the **Session Pooler** (IPv4 compatibility for deployment on Render).

## 🔑 Environment Variables
You need to set up a `.env` file in `web/backend/` containing:
```
DATABASE_URL="postgresql://postgres.[project-ref]:[encoded-password]@aws-0-[region].pooler.supabase.com:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```
On Vercel (Web frontend), you need to configure:
`VITE_API_URL="https://planora-sux9.onrender.com/api"`

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the Backend
The backend runs on `http://localhost:5000`.

```bash
cd web/backend
npm install
npm run dev
```

### 2. Start the Web App
The web app runs on `http://localhost:5173`.

```bash
cd web/frontend
npm install
npm run dev
```

### 3. Start the Mobile App
The mobile app connects to `10.0.2.2:5000` (Android emulator's pointer to the host machine's localhost). 

```bash
cd app
npm install
npm run android
```
*(Note: You need an Android emulator running, such as Android Studio)*

## 🔄 Client-Server Communication
- **Web & Mobile**: Both the React App and React Native App use `axios` to make REST API calls to the same backend.
- **Mobile Connection to Deployed Backend**: The deployed mobile APK/Expo build targets the deployed Render URL as its base API URL, seamlessly interacting with the live PostgreSQL database.

## 🌍 Production Deployment
The application is fully deployed and accessible:
- **Web App (Vercel)**: `https://planora-bice.vercel.app`
- **Backend API (Render)**: `https://planora-sux9.onrender.com`
- **Database (Supabase)**: Live PostgreSQL Instance

## 📚 Documentation References
- **API Documentation**: See [`API.md`](./API.md) for full endpoint specifications.
- **Database ER Diagram**: See [`SCHEMA.md`](./SCHEMA.md) for the entity-relationship model and schema design.

## ✅ Testing & Build Verification
The repository contains a `test-api.js` script demonstrating integration tests executing full Register -> Create Project -> Create Task -> Search flows. The build process for both Docker and Expo is verified to pass successfully.

## 🐳 Docker Information (Bonus)
The project includes fully configured Docker Support:
- Both `web-frontend` and `web-backend` are containerized using `node:24-bookworm-slim`.
- Run locally via Docker Compose:
  ```bash
  cd web
  docker compose up --build
  ```

## 🎁 Implemented Bonus Features
The following optional bonus features from the assignment were successfully implemented:
- **Docker Support**: Full `Dockerfile` and `docker-compose.yml` configurations.
- **Integration Tests**: Minimal `test-api.js` flow script.
- **Role-Based Access Control**: `ADMIN` roles required to perform DELETE operations.
- **Refresh Tokens**: Database schema and `/api/auth/refresh` endpoints strictly implemented to maintain long-lived sessions securely.
- **Push Notifications**: Expo Server SDK integration configured with a `/api/auth/push-token` endpoint.
- **Shared Types / Validation**: A dedicated `@planora/shared` workspace guarantees exact Zod typings across backend API routes, web clients, and mobile clients.

## 📋 Assignment Compliance
This final implementation fully satisfies the mandatory requirements:
- **Authentication**: JWT, bcrypt hashing, unique emails.
- **Project & Task Management**: Full CRUD capabilities mapped correctly to database entities.
- **Dashboard & Search**: Operational dashboard stats and filtering capabilities enabled in routes.
- **Web & Mobile Integration**: Unified backend serving both platforms without discrepancy.
- **Database & Security**: Relational PostgreSQL via Prisma ORM protected against SQL injection; protected API routes via middleware, input validation.
- **Documentation & Deployment**: README, API, SCHEMA files comprehensively provided. Live URL environments properly configured.

## 📝 Final Submission & Demo Instructions
- Use **Test Data Only**: Do not use real personal data when registering accounts or creating projects.
- **Demo Scenario**: 
  1. Open the Vercel web URL and the Mobile App.
  2. Register on the Web App, and then use the same credentials to log into the Mobile App.
  3. Create a Project and a Task on the Web App.
  4. Pull-to-refresh on the Mobile App to instantly see the synchronized data.
