// tools/import-csv.ts
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cms';
const COLLECTION_NAME = 'serpdata';

const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ Моля, подайте път до .csv.gz файла: npx ts-node tools/import-csv.ts ./data/serp/0.data.csv.gz');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Свързано с MongoDB');

  const SerpModel = mongoose.connection.collection(COLLECTION_NAME);

  let count = 0;
  const batchSize = 1000;
  let batch: any[] = [];

  const stream = fs.createReadStream(filePath)
    .pipe(zlib.createGunzip())
    .pipe(csv());

  stream.on('data', async (row) => {
    try {
      // Преобразуване на JSON полета ако има нужда
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
      if (batch.length >= batchSize) {
        stream.pause();
        await SerpModel.insertMany(batch, { ordered: false }).catch(() => {});
        count += batch.length;
        console.log(`📦 Импортирани ${count} реда...`);
        batch = [];
        stream.resume();
      }
    } catch (e) {
      console.error('❗ Грешка при обработка на ред:', e);
    }
  });

  stream.on('end', async () => {
    if (batch.length > 0) {
      await SerpModel.insertMany(batch, { ordered: false }).catch(() => {});
      count += batch.length;
    }
    console.log(`✅ Импортът завършен. Общо редове: ${count}`);
    await mongoose.disconnect();
  });
}

main().catch(err => {
  console.error('❌ Грешка в main():', err);
  process.exit(1);
});
