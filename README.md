# Team Task Manager

A production-ready full-stack web application for teams to manage projects, assign tasks, and track work progress with role-based access control (RBAC).

![Screenshots placeholder](docs/screenshots/dashboard.png)
> Add screenshots to `docs/screenshots/` after deployment.

## Features

- **Authentication** — JWT signup/login, bcrypt password hashing, protected routes
- **RBAC** — Admin (full control) vs Member (view assigned work, update own task status, comment)
- **Projects** — CRUD, team members, deadlines, progress tracking
- **Tasks** — CRUD, assignment, priorities, Kanban drag-and-drop board, search/filter/sort
- **Dashboard** — Stats, productivity charts, project progress, activity timeline
- **Notifications** — Task assignment, status updates, comments, project invites (real-time via Socket.io)
- **UI** — Responsive SaaS layout, dark/light mode, toasts, modals, loading skeletons, error boundary
- **Bonus** — Socket.io real-time updates, file attachments, activity logs, analytics charts

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios, Recharts, @hello-pangea/dnd |
| Backend | Node.js, Express.js, Mongoose, JWT, bcrypt, express-validator, Socket.io, Multer |
| Database | MongoDB (MongoDB Atlas for production) |
| Deploy | Railway (frontend + backend), GitHub |

## Project Structure

```
Ethara.AI/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, upload
│   │   ├── controllers/  # MVC controllers
│   │   ├── middleware/   # Auth, RBAC, validation
│   │   ├── models/       # User, Project, Task, Comment, Notification
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── validators/
│   │   └── index.js
│   ├── package.json
│   └── railway.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── API.md
└── README.md
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin123! |
| Member | member@demo.com | Member123! |

Seed the database to load demo data:

```bash
cd backend && npm run seed
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm install
npm run seed   # optional demo data
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL(s), comma-separated for CORS |
| `UPLOAD_DIR` | File upload directory |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base (e.g. `https://api.example.com/api`) |
| `VITE_SOCKET_URL` | Socket.io server URL (backend root) |

## API Routes

See [API.md](./API.md) for full documentation.

## Railway Deployment

### MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add database user and whitelist IP `0.0.0.0/0` (or Railway IPs)
3. Copy connection string → `MONGODB_URI`

### Backend on Railway

1. Push repo to GitHub
2. New Project → Deploy from GitHub → select `backend` folder (or monorepo with root directory `backend`)
3. Set variables:
   - `MONGODB_URI`
   - `JWT_SECRET` (long random string)
   - `CLIENT_URL` = your frontend Railway URL
   - `NODE_ENV=production`
4. Deploy; note the public URL (e.g. `https://team-task-api.up.railway.app`)

### Frontend on Railway

1. New service → same repo → root directory `frontend`
2. Set variables:
   - `VITE_API_URL=https://<backend-url>/api`
   - `VITE_SOCKET_URL=https://<backend-url>`
3. Build uses `nixpacks.toml` / `npm run build` + `serve`
4. Update backend `CLIENT_URL` to include frontend URL

### Post-deploy

```bash
# Run seed on Railway (one-off command or local against Atlas URI)
MONGODB_URI=<atlas-uri> npm run seed
```

### CORS

Backend reads `CLIENT_URL` (comma-separated). Example:

```
CLIENT_URL=https://your-frontend.up.railway.app,http://localhost:5173
```

## GitHub

```bash
git init
git add .
git commit -m "Initial Team Task Manager"
git remote add origin https://github.com/<user>/team-task-manager.git
git push -u origin main
```

Connect both Railway services to this repository.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| backend | `npm run dev` | Dev server with watch |
| backend | `npm start` | Production server |
| backend | `npm run seed` | Demo data |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build |
| frontend | `npm start` | Serve `dist` |

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS on Railway (automatic)
- Restrict MongoDB network access when possible
- Do not commit `.env` files

## License

MIT
