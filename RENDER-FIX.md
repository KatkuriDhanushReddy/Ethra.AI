# Fix Render "Exited with status 1"

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
