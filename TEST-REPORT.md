# Team Task Manager — Real-World Test Report

**Date:** Automated audit  
**Environment:** Local dev (in-memory MongoDB fallback)

---

## Demo accounts (all verified login ✅)

| Account | Email | Password | Role | Purpose |
|---------|-------|----------|------|---------|
| **Demo Admin** | `admin@demo.com` | `Admin123!` | admin | Full system control |
| **Demo Member** | `member@demo.com` | `Member123!` | member | Typical team member |
| **Alex Johnson** | `alex@demo.com` | `Member123!` | member | Second member, partial project access |

---

## Login page quick-fill

| Button | Fills |
|--------|--------|
| **Admin demo** | admin@demo.com / Admin123! |
| **Member demo** | member@demo.com / Member123! |

---

## API test results (automated)

Run anytime: `cd backend && node src/test-all-accounts.js` (backend must be running)

| Test | Admin | Member | Alex |
|------|-------|--------|------|
| Login | ✅ | ✅ | ✅ |
| Dashboard stats | ✅ (3 tasks) | ✅ | ✅ |
| List projects | ✅ (2 projects) | ✅ (2) | ✅ (1 — correct) |
| Create project | ✅ allowed | ✅ blocked (403) | — |
| List tasks | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ blocked | — |
| Update own task status | ✅ | ✅ | ✅ (assigned tasks) |
| Notifications | — | ✅ (2) | — |
| List users | ✅ | ✅ | — |

### Alex — project scope (real-world)

- Sees **1 project**: Website Redesign (member of that project only)
- Does **not** see Mobile App Launch (not a member) ✅
- Can still appear in **3 tasks** on dashboard filter (project tasks visible to members)

### Security

| Test | Result |
|------|--------|
| Wrong password | ✅ Rejected |
| No JWT on `/dashboard` | ✅ HTTP 401 |
| Member POST `/projects` | ✅ Insufficient permissions |

---

## Feature checklist by role

### Admin (`admin@demo.com`)

| Feature | UI | API | Notes |
|---------|----|-----|-------|
| Dashboard + charts | ✅ | ✅ | Stats, productivity, project progress |
| Create project | ✅ | ✅ | Modal on Projects page |
| Edit/delete project | ✅ | ✅ | Project detail |
| Add/remove members | ✅ | ✅ | Admin only routes |
| Create/edit/delete tasks | ✅ | ✅ | |
| Assign tasks | ✅ | ✅ | Sends notification |
| Kanban drag all cards | ✅ | ✅ | |
| Admin Panel (`/admin`) | ✅ | — | User list + counts |
| Notifications | ✅ | ✅ | |
| Settings / profile | ✅ | ✅ | |
| File upload on task | ✅ | ✅ | Local `uploads/` folder |

### Member (`member@demo.com`)

| Feature | UI | API | Notes |
|---------|----|-----|-------|
| Dashboard | ✅ | ✅ | Scoped to assigned projects |
| View projects | ✅ | ✅ | Both seeded projects |
| Create project | Hidden | Blocked | Correct RBAC |
| Create task | Hidden | Blocked | Correct RBAC |
| Update **own** task status | ✅ | ✅ | Kanban + PATCH |
| Comment on tasks | ✅ | ✅ | |
| Admin Panel | Hidden | N/A | Redirects to dashboard |
| Delete project | Hidden | Blocked | |

### Member — Alex (`alex@demo.com`)

| Feature | Expected | Actual |
|---------|----------|--------|
| Projects visible | 1 | ✅ Website Redesign only |
| Assigned task | CI/CD pipeline | ✅ Can update if assignee |
| Mobile App project | No access | ✅ Not listed |

---

## Real-world concerns & limitations

### Critical for production

1. **Database** — Dev uses in-memory MongoDB when local MongoDB is off. **Data is lost on restart.** Use MongoDB Atlas + `MONGODB_URI` for production.
2. **JWT in localStorage** — Standard for SPAs but vulnerable to XSS. Use HTTPS, short expiry, Content-Security-Policy in production.
3. **Admin signup** — Fixed: production signup forces `member` role; admin role only in dev UI / `ALLOW_ADMIN_SIGNUP=true`.
4. **Secrets** — Change `JWT_SECRET` in production; never commit `.env`.

### Medium

5. **OneDrive + `node_modules`** — Can break packages (e.g. `lucide-react`). Move repo outside OneDrive or run `fix-frontend.bat`.
6. **File uploads** — Stored on server disk; not suitable for multi-instance Railway without S3/cloud storage.
7. **Email notifications** — Not implemented (in-app + Socket.io only).
8. **Rate limiting** — Not on auth routes (brute-force risk in production).

### Low / UX

9. **Kanban** — Members can drag any card in UI; API rejects if not assignee/admin (may show error toast).
10. **Signup role dropdown** — Hidden in production build; dev only.
11. **No password reset** — Expected for MVP; add for production.
12. **Screenshots in README** — Placeholder paths only.

---

## Environment variables (keys)

### Backend (`backend/.env`)

| Key | Required | Example |
|-----|----------|---------|
| `PORT` | No | `5000` |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/team-task-manager` |
| `JWT_SECRET` | Yes | Long random string |
| `JWT_EXPIRES_IN` | No | `7d` |
| `CLIENT_URL` | Yes (prod) | `http://localhost:5173` |
| `NODE_ENV` | No | `development` |
| `USE_MEMORY_DB` | No | `true` (optional force in-memory) |
| `ALLOW_ADMIN_SIGNUP` | No | `true` to allow admin via API signup in prod |

### Frontend (`frontend/.env`)

| Key | Required | Example |
|-----|----------|---------|
| `VITE_API_URL` | Prod | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Prod | `http://localhost:5000` |

---

## How to re-run full audit

```cmd
cd backend
npm run dev
```

New terminal:

```cmd
cd backend
node src/test-all-accounts.js
```

Manual UI: log in as each account and walk through Dashboard → Projects → Task board → Notifications → Settings → Admin (admin only).

---

## Fixes applied during this audit

- `lucide-react` reinstall (OneDrive install corruption)
- `canDrag={isAdmin || true}` → `canDrag` (dead code removed)
- Production signup: cannot self-assign admin role
- Signup UI: role selector dev-only

---

## Verdict

**Core flows work** for all three demo accounts with correct RBAC on the API. **Ready for local demo**; before real production deploy: persistent MongoDB, strong secrets, HTTPS, and address security items above.
