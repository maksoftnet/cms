// tools/import-csv.ts (с прогрес и таймер)
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const prettyBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
};

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cms';
const COLLECTION_NAME = 'serpdata';

const filePath = process.argv[2];
const MAX_ROWS = Number(process.env.MAX_ROWS || 100);
if (!filePath) {
  console.error('❌ Моля, подайте път до .csv или .csv.gz файла: npx ts-node tools/import-csv.ts ./data/serp/0.data.csv(.gz)');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Свързано с MongoDB');

  const SerpModel = mongoose.connection.collection(COLLECTION_NAME);

  let count = 0;
  const batchSize = 1000;
  let batch: any[] = [];
  let bytesRead = 0;
  let lastTime = Date.now();

  let fileStream: NodeJS.ReadableStream = fs.createReadStream(filePath);
  if (filePath.endsWith('.gz')) {
    fileStream = fileStream.pipe(zlib.createGunzip());
    console.log('📂 Разархивиране на .gz файл...');
  }

  console.log('▶️ Поток стартиран...');

  const stream = fileStream.pipe(csv());

  stream.on('data', async (row) => {
    try {
      const rowSize = JSON.stringify(row).length;
      bytesRead += rowSize;

      if (count < 5) {
        console.log('🔎 row:', row);
      }

      if (count >= MAX_ROWS) {
        stream.destroy();
        return;
      }

      if (row['keyword_info.history']) {
        try {
          row['keyword_info.history'] = JSON.parse(row['keyword_info.history']);
        } catch (e) {}
      }
      if (row['keyword_info.categories']) {
        try {
          row['keyword_info.categories'] = JSON.parse(row['keyword_info.categories']);
        } catch (e) {}
      }
      if (row['search_intent_info.foreign_intent']) {
        try {
          row['search_intent_info.foreign_intent'] = JSON.parse(row['search_intent_info.foreign_intent']);
        } catch (e) {}
      }

      batch.push(row);
      count++;

      if (batch.length >= batchSize) {
        stream.pause();
        const now = Date.now();
        const duration = ((now - lastTime) / 1000).toFixed(2);
        lastTime = now;
        await SerpModel.insertMany(batch, { ordered: false }).catch((err) => {
          console.error('❌ insertMany() error:', err.message);
        });
        console.log(`📦 Импортирани ${count} реда – ${prettyBytes(bytesRead)} общо (${duration}s)`);
        batch = [];
        stream.resume();
      }
    } catch (e) {
      console.error('❗ Грешка при обработка на ред:', e);
    }
  });

  stream.on('end', async () => {
    if (batch.length > 0) {
      await SerpModel.insertMany(batch, { ordered: false }).catch((err) => {
        console.error('❌ insertMany() error:', err.message);
      });
      console.log(`📦 Импортирани ${count} реда (финална партида)`);
    }
    console.log(`✅ Импортът завършен. Общо редове: ${count}, общ размер: ${prettyBytes(bytesRead)}`);
    await mongoose.disconnect();
  });
}

main().catch(err => {
  console.error('❌ Грешка в main():', err);
  process.exit(1);
});
