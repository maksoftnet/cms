import mongoose from 'mongoose';

const PlatformExtensionSchema = new mongoose.Schema({
  pageId: String,
  platform: String,
  data: mongoose.Schema.Types.Mixed,
  syncedAt: Date,
});

export const PlatformExtension = mongoose.model('PlatformExtension', PlatformExtensionSchema);
