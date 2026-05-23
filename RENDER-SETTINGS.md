# Exact Render Settings — Ethra.AI

## Project type detected

| App | Stack | Entry file | Port |
|-----|-------|------------|------|
| **backend/** | Express + Socket.io + MongoDB | `src/index.js` | `process.env.PORT` (Render sets this) |
| **frontend/** | Vite + React (SPA) | `dist/index.html` after build | Static or `serve` |

---

## Service 1: Backend API (Web Service)

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

### Environment variables

| Key | Required | Example |
|-----|----------|---------|
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/team-task-manager` |
| `JWT_SECRET` | Yes | random 32+ char string |
| `NODE_ENV` | Yes | `production` |
| `CLIENT_URL` | Yes (after frontend deploy) | `https://ethara-web.onrender.com` |

### package.json scripts (backend)

```json
"start": "node src/index.js",
"build": "echo Backend ready",
"dev": "node --watch src/index.js"
```

---

## Service 2: Frontend (Static Site) — recommended

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Start Command** | *(none — static site)* |

### Environment variables (build time)

| Key | Example |
|-----|---------|
| `VITE_API_URL` | `https://ethara-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://ethara-api.onrender.com` |

### package.json scripts (frontend)

```json
"build": "vite build",
"start": "node scripts/start.mjs",
"dev": "vite"
```

---

## Service 2 alt: Frontend (Web Service with Node)

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

---

## Monorepo root (if Root Directory is empty)

Only use if you deploy from repo root:

| Setting | Value |
|---------|--------|
| **Root Directory** | *(empty)* |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

Root `package.json` uses **npm workspaces** so `npm install` installs both `backend` and `frontend`.  
`npm start` runs the **Express API** (`backend`).

---

## Do NOT use

| Wrong | Why |
|-------|-----|
| Root Directory empty + only `npm install` on old commit | Only 1 package, no `start` |
| Frontend as Web Service without `start` in package.json | Missing script error |
| `npm start` on Static Site | Static sites use Publish Directory only |
