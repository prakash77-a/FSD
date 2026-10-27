import mongoose from 'mongoose';

export interface DbStatusInfo {
  connected: boolean;
  type: 'mongodb-atlas' | 'mongodb-local' | 'in-memory-store';
  uriPreview?: string;
  error?: string;
}

let dbStatus: DbStatusInfo = {
  connected: false,
  type: 'in-memory-store',
};

export async function connectDB(): Promise<DbStatusInfo> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ No MONGODB_URI provided. Initialized with high-performance in-memory database engine.');
    dbStatus = {
      connected: true,
      type: 'in-memory-store',
    };
    return dbStatus;
  }

  try {
    const isAtlas = uri.includes('mongodb.net') || uri.startsWith('mongodb+srv://');
    const type = isAtlas ? 'mongodb-atlas' : 'mongodb-local';
    
    // Mask password in URI preview for security
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    });

    dbStatus = {
      connected: true,
      type,
      uriPreview: maskedUri,
    };
    console.log(`✅ Successfully connected to MongoDB (${type}): ${maskedUri}`);
    return dbStatus;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection attempt failed (${err.message}). Using fallback in-memory database engine for seamless operation.`);
    dbStatus = {
      connected: true,
      type: 'in-memory-store',
      error: `External MongoDB unreachable: ${err.message}`,
    };
    return dbStatus;
  }
}

export function getDbStatus(): DbStatusInfo {
  return dbStatus;
}
