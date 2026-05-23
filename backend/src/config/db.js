import mongoose from 'mongoose';

let memoryServer;

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Add MongoDB Atlas connection string in Render env vars.');
  }

  const useMemory = process.env.USE_MEMORY_DB === 'true';

  if (useMemory) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('team-task-manager');
    console.log('Using in-memory MongoDB (dev mode)');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: useMemory ? 30000 : 10000 });
    console.log('MongoDB connected');
  } catch (err) {
    if (!useMemory && process.env.NODE_ENV !== 'production') {
      console.warn('Local MongoDB unavailable, starting in-memory database...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri('team-task-manager');
      await mongoose.connect(uri);
      console.log('MongoDB connected (in-memory fallback)');
      return;
    }
    throw err;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};
