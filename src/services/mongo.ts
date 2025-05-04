import mongoose from 'mongoose';

export async function initMongo() {
  await mongoose.connect('mongodb://localhost:27017/cms_sync');
  console.log('📂 MongoDB connected');
}
