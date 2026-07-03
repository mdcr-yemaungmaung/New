# Payment Request Workflow Management

A full-stack web application designed for managing payment request workflows. It provides a robust backend API and a modern frontend interface with real-time updates.

## Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database**: PostgreSQL with [TypeORM](https://typeorm.io/)
- **Authentication**: Passport.js (JWT & Local strategy)
- **Real-time Communication**: WebSockets (Socket.IO)
- **Language**: TypeScript

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: React Router
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Real-time Client**: Socket.IO Client
- **Language**: TypeScript

---

## Project Structure

- `/src` - Backend source code (NestJS modules, controllers, services, etc.)
- `/frontend` - Frontend source code (React components, pages, hooks, etc.)
- `/docs` - Project documentation
- `/test` - Backend e2e tests

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher recommended)
- PostgreSQL
- npm or yarn

### 1. Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory based on your database configuration and JWT secrets.
   Example:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=your_db_name
   JWT_SECRET=your_super_secret_key
   PORT=3000
   ```

3. **Run Migrations (if applicable)**:
   ```bash
   npm run migration:run
   ```

4. **Start the Development Server**:
   ```bash
   npm run start:dev
   ```
   The backend will be available at `http://localhost:3000`.

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## Available Scripts

### Backend
- `npm run start:dev` - Starts the backend in development/watch mode.
- `npm run build` - Builds the backend for production.
- `npm run lint` - Lints the backend TypeScript code.
- `npm run test` - Runs backend unit tests.

### Frontend (inside `/frontend`)
- `npm run dev` - Starts the frontend development server.
- `npm run build` - Builds the frontend for production.
- `npm run lint` - Lints the frontend code.

## Deployment with Railway + Vercel

This project supports a split deployment:

1. **Backend** on Railway
2. **Frontend** on Vercel

### Railway backend service setup

1. Create a Railway project.
2. Add the PostgreSQL plugin.
3. Add the Redis plugin.
4. In the Railway project, add a new service and choose **Connect Repo**.
5. If your GitHub repo does not appear:
   - confirm Railway is authorized for your GitHub account
   - refresh Railway and GitHub permissions
   - ensure the repo is accessible from the GitHub account you connected
   - if needed, go to GitHub settings → Applications → Authorized OAuth Apps → Railway and grant repository access
   - then return to Railway and retry connecting the repo
6. If Railway still does not show the repo, use the Railway CLI as a fallback:
   - install Railway CLI: `npm install -g @railway/cli`
   - run `railway login`
   - run `railway init` in the repo root
   - run `railway link` and select your project
   - if the `railway` command still does not exist, use the CLI via npx:
     `npx @railway/cli login`

### Backend environment variables (Railway)

Set these in Railway for the backend service:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRATION=3600s`
- `JWT_REFRESH_EXPIRATION=7d`
- `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`
- `APP_URL=https://<your-vercel-app>.vercel.app`
- `DB_SYNCHRONIZE=true` (first deploy only, then set `false`)
- `DB_LOGGING=false`
- `DB_SSL=true` or `false` depending on Railway/Postgres settings
- `APP_PORT=3005`

Railway will provide PostgreSQL and Redis plugin variables. Map them to the above names.

### Frontend environment variables (Vercel)

In Vercel, set:

- `VITE_API_BASE_URL=https://<your-railway-backend-url>/api/v1`
- `VITE_WS_URL=https://<your-railway-backend-url>` (optional)

The frontend now reads `VITE_API_BASE_URL` and will connect to the backend on Vercel.

### Notes

- The frontend no longer hardcodes `/api/v1`.
- The Socket.IO client supports `VITE_WS_URL` and falls back from `VITE_API_BASE_URL`.
- If your backend and frontend are on different origins, be sure `CORS_ORIGINS` includes the Vercel app origin.

---

## License

This project is UNLICENSED.
