const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave_management_db';
  const allowFallback = process.env.USE_MEMORY_DB_FALLBACK !== 'false';

  try {
    console.log(`[DB] Attempting to connect to MongoDB at: ${uri}`);
    // Connect with a 3.5s serverSelectionTimeoutMS so we fail fast to memory server if not installed
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    console.log(`[DB] MongoDB Connected Successfully: ${conn.connection.host}`);
    const { seedDemoData } = require('../seed/seedData');
    await seedDemoData();
    return conn;
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB (${err.message}).`);

    if (allowFallback) {
      console.log('[DB] Starting Embedded MongoDB Server on port 27017 for Compass & App...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        try {
          memoryServerInstance = await MongoMemoryServer.create({
            instance: {
              port: 27017,
              dbName: 'leave_management_db',
              ip: '127.0.0.1',
            },
          });
        } catch (bindErr) {
          console.warn(`[DB] Could not bind to port 27017 directly (${bindErr.message}), selecting dynamic port...`);
          memoryServerInstance = await MongoMemoryServer.create({
            instance: {
              dbName: 'leave_management_db',
            },
          });
        }

        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`====================================================`);
        console.log(`[DB] MONGODB ACTIVE ON: ${memUri}`);
        console.log(`[DB] USE THIS CONNECTION STRING IN MONGODB COMPASS:`);
        console.log(`mongodb://127.0.0.1:27017/leave_management_db`);
        console.log(`====================================================`);

        // Automatically seed demo data in memory mode so user doesn't have an empty app
        const { seedDemoData } = require('../seed/seedData');
        await seedDemoData();
        return conn;
      } catch (memErr) {
        console.error('[DB] Failed to start In-Memory MongoDB server:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
