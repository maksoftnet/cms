import 'reflect-metadata';
import express from 'express';
import { initPostgres } from './services/postgres';
import { initMongo } from './services/mongo';
import { pageRouter } from './transport/rest/page';

const app = express();
app.use(express.json());
app.use('/api/page', pageRouter);

(async () => {
  await initPostgres();
  await initMongo();

  app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
})();
