import mongoose from 'mongoose';

export async function initMongo() {
  await mongoose.connect('mongodb://localhost:27017/cms');
  console.log('📂 MongoDB connected');
}
