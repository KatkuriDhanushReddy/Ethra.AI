# Deploy on Render — Step by Step

Repository: [github.com/KatkuriDhanushReddy/Ethra.AI](https://github.com/KatkuriDhanushReddy/Ethra.AI)

---

## Before you start

1. Push latest code to GitHub (`PUSH-TO-GITHUB.bat` or `git push`)
2. Create [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster
3. You will create **two** Render services: **API** + **Frontend**

---

## Step 1 — Deploy backend API

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect **Ethra.AI** repository
3. Configure:

| Field | Value |
|-------|--------|
| Name | `ethara-api` |
| Region | closest to you |
| Branch | `main` |
| **Root Directory** | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

4. **Environment Variables** → Add:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | `mongodb+srv://USER:PASS@cluster.mongodb.net/team-task-manager` |
| `JWT_SECRET` | long random string (32+ chars) |
| `NODE_ENV` | `production` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | *(add after Step 2)* |

5. Click **Create Web Service**
6. Wait for deploy → copy URL e.g. `https://ethara-api.onrender.com`
7. Test: open `https://ethara-api.onrender.com/api/health` → should show `"success":true`

### Seed demo data (optional)

On your PC:

```cmd
cd backend
set MONGODB_URI=your-atlas-uri
npm run seed
```

---

## Step 2 — Deploy frontend

### Option A — Static Site (recommended, free)

1. **New +** → **Static Site** → same repo
2. Configure:

| Field | Value |
|-------|--------|
| **Root Directory** | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

3. **Environment Variables** (required for Vite at build time):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://ethara-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://ethara-api.onrender.com` |

Replace with your real API URL from Step 1.

4. **Create Static Site**
5. Copy frontend URL e.g. `https://ethara-web.onrender.com`

### Option B — Web Service (Node + serve)

| Field | Value |
|-------|--------|
| **Root Directory** | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Same `VITE_*` env vars as Option A.

---

## Step 3 — Connect frontend and backend

1. Render → **ethara-api** → **Environment**
2. Set `CLIENT_URL` = your frontend URL (no trailing slash):

```text
https://ethara-web.onrender.com
```

3. Save → API redeploys automatically

---

## Step 4 — Test live app

1. Open frontend URL
2. Login:
   - Admin: `admin@demo.com` / `Admin123!`
   - Member: `member@demo.com` / `Member123!`

---

## Blueprint (deploy both at once)

1. **New +** → **Blueprint**
2. Select **Ethra.AI** repo
3. Render reads `render.yaml` and creates both services
4. Enter `MONGODB_URI`, `VITE_API_URL`, `VITE_SOCKET_URL`, `CLIENT_URL` when prompted

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing script: "start"` | Set **Root Directory** to `backend` or `frontend` |
| Build OK, login fails | Check `VITE_API_URL` ends with `/api` |
| CORS error | Set `CLIENT_URL` on backend to exact frontend URL |
| API crash on start | Set `MONGODB_URI` in Render env vars |
| 404 on page refresh | Static site: rewrite `/*` → `/index.html` (in `render.yaml`) |

---

## Also deploying on Vercel?

Use Vercel for frontend + Render for API:

- Vercel: see README → Frontend on Vercel
- Render: backend only (Step 1 above)
- Set `CLIENT_URL` to your Vercel URL
