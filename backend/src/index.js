import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { autoSeedIfEmpty } from './utils/autoSeed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket/index.js';
import { upload } from './config/upload.js';
import { uploadAttachment } from './controllers/uploadController.js';
import { protect } from './middleware/auth.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: clientUrl.split(',').map((u) => u.trim()), credentials: true },
});

app.set('io', io);
initSocket(io);

app.use(
  cors({
    origin: clientUrl.split(',').map((u) => u.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadPath = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(process.cwd(), uploadPath)));

app.get('/', (_, res) => res.send('Ethra AI Backend Running Successfully'));

app.get('/api/health', (_, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.post('/api/tasks/:id/attachments', protect, upload.single('file'), uploadAttachment);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.MONGODB_URI?.trim()) {
    console.error('FATAL: MONGODB_URI is not set.');
    console.error('Render → open your BACKEND Web Service (Root Directory: backend) → Environment');
    console.error('Add key exactly: MONGODB_URI  (not MONGO_URI, not in frontend/static site)');
    console.error('Value: mongodb+srv://USER:PASSWORD@cluster0....mongodb.net/team-task-manager?...');
    console.error('Then Save Changes and wait for redeploy.');
    process.exit(1);
  }
  await connectDB();
  await autoSeedIfEmpty();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message || err);
  process.exit(1);
});
