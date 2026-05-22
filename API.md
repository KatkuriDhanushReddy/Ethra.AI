# Team Task Manager — API Documentation

Base URL: `http://localhost:5000/api` (development) or your Railway backend URL.

All protected routes require header: `Authorization: Bearer <token>`

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register user |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Current user |
| PATCH | `/auth/profile` | Yes | Update name/avatar |

### Signup body
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret123", "role": "member" }
```

### Login body
```json
{ "email": "admin@demo.com", "password": "Admin123!" }
```

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Yes | List users (`?search=&page=&limit=`) |
| GET | `/users/:id` | Yes | Get user by ID |

## Projects

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/projects` | Yes | All | List projects |
| GET | `/projects/:id` | Yes | Member+ | Project detail + tasks |
| POST | `/projects` | Yes | Admin | Create project |
| PATCH | `/projects/:id` | Yes | Admin/Creator | Update project |
| DELETE | `/projects/:id` | Yes | Admin/Creator | Delete project |
| POST | `/projects/:id/members` | Yes | Admin | Add member `{ userId }` |
| DELETE | `/projects/:id/members/:userId` | Yes | Admin | Remove member |

## Tasks

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/tasks` | Yes | All | List (`?project=&status=&priority=&search=&sort=&page=&limit=`) |
| GET | `/tasks/:id` | Yes | All | Task detail |
| POST | `/tasks` | Yes | Admin | Create task |
| PATCH | `/tasks/:id` | Yes | Admin/Assignee | Update task |
| DELETE | `/tasks/:id` | Yes | Admin | Delete task |
| PATCH | `/tasks/reorder/status` | Yes | All* | Kanban drag `{ taskId, status }` |
| POST | `/tasks/:id/attachments` | Yes | All | Upload file (multipart `file`) |

\* Members can reorder only their assigned tasks.

## Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks/:taskId/comments` | Yes | List comments |
| POST | `/tasks/:taskId/comments` | Yes | Create `{ content }` |
| DELETE | `/tasks/comments/:id` | Yes | Delete own/admin |

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | List (`?unread=true`) |
| PATCH | `/notifications/:id/read` | Yes | Mark one read |
| PATCH | `/notifications/read-all` | Yes | Mark all read |

## Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | Yes | Stats, charts, activity |

## Health

| GET | `/api/health` | No | Server status |

## Socket.io Events

Connect with `auth: { token: '<jwt>' }`.

**Client → Server**
- `join:project` (projectId)
- `leave:project` (projectId)
- `join:task` (taskId)

**Server → Client**
- `notification` — new notification
- `task:created` | `task:updated` | `task:deleted`
- `project:created` | `project:updated` | `project:deleted`
- `comment:created`

## Response format

```json
{ "success": true, "data": {}, "pagination": {} }
```

Errors:
```json
{ "success": false, "message": "Error description" }
```
