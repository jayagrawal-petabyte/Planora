# Project Management System (Full Stack)

A comprehensive Project Management system built with Node.js/Express (Backend), React/Vite (Web Frontend), and React Native/Expo (Mobile App). All clients synchronize in real-time through a centralized PostgreSQL database hosted on Supabase.

## Deliverables Included
- **Backend API**: Node.js + Express + Prisma + Supabase
- **Web App**: React + Vite + TypeScript
- **Mobile App**: React Native + Expo + TypeScript
- **API Documentation**: See `API.md`
- **Database Schema**: See `SCHEMA.md`

## Architecture Highlights
- **Security**: Custom JWT implementation (does *not* use Supabase Auth) with `bcrypt` password hashing.
- **Data Protection**: Strict backend ownership enforcement. Users can only CRUD their own projects and tasks. User IDs cannot be spoofed from the frontend.
- **Mobile Security**: Uses `expo-secure-store` to safely encrypt tokens on mobile devices.
- **Validation**: All API inputs are rigorously typed and sanitized using `Zod`.
- **Global Error Handling**: Both Web and Mobile feature Axios interceptors for handling network disconnections and token expirations gracefully.

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the Backend
The backend runs on `http://localhost:5000`.

```bash
cd web/backend
npm install
# The .env file with Supabase connection is already provided
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

---

## 📱 Building the Android APK (Submission Requirement)

To generate the `.apk` file for the Android submission:
1. Ensure you have an Expo account and the EAS CLI installed globally (`npm install -g eas-cli`).
2. Run the build command:
```bash
cd app
eas login
eas build -p android --profile preview
```
3. Expo will generate an installable `.apk` file you can download from your Expo Dashboard and submit.
