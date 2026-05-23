# Fix Render deploy errors

## Error: `package.json` does not contain a valid "start" script

Your repo **already has** correct `start` scripts. Render fails when the **wrong service type** or **wrong Root Directory** is used.

| Folder | Type on Render | Start command |
|--------|----------------|---------------|
| `backend/` | **Web Service** | `npm start` → `node src/index.js` |
| `frontend/` | **Static Site** | *(none — use Publish Directory `dist`)* |
| repo root | **Web Service** (optional) | `npm start` → runs backend via workspaces |

**Do not** deploy `frontend/` as a Web Service unless you intentionally use `npm start` (serves `dist/`). Prefer **Static Site** for Vite.

### Your exact scripts (already in GitHub)

**`backend/package.json`**

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "node --watch src/index.js",
  "build": "echo Backend ready",
  "seed": "node src/seed.js"
}
```

**`frontend/package.json`** — use Static Site on Render; no `npm start` required:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

**Root `package.json`** (only if Root Directory is empty):

```json
"scripts": {
  "start": "npm run start --workspace=backend"
}
```

---

## Error: "Exited with status 1" / `audited 1 package`

Your logs show `audited 1 package` — Render is building from the **repo root** without installing `backend/` dependencies.

## Fix in Render Dashboard (choose ONE)

### Option A — Recommended: set Root Directory

1. Render → your Web Service → **Settings**
2. **Root Directory** → `backend`
3. **Build Command** → `npm install`
4. **Start Command** → `npm start`
5. **Environment** → add `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`
6. **Save** → **Manual Deploy**

### Option B — Keep root empty (after pushing latest code)

Latest `package.json` auto-installs backend on Render during `npm install`.

| Field | Value |
|-------|--------|
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

**Required environment variables:**

| Key | Required |
|-----|----------|
| `MONGODB_URI` | Yes — MongoDB Atlas URL |
| `JWT_SECRET` | Yes — random secret |
| `NODE_ENV` | `production` |

Without `MONGODB_URI`, the server exits immediately with status 1.

## Verify deploy

Open: `https://YOUR-SERVICE.onrender.com/api/health`

Expected: `{"success":true,"message":"API is running"}`

## Push latest code first

```cmd
git add .
git commit -m "Fix Render: install backend deps and startup checks"
git push origin main
```

Then **Manual Deploy** on Render.
