import { DataSource } from 'typeorm';
import { Page } from '../models/Page';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'cms',
  synchronize: true,
  entities: [Page],
});

export async function initPostgres() {
  await AppDataSource.initialize();
  console.log('📦 PostgreSQL connected');
}
