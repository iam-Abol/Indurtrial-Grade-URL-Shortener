import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'Abolz',
  password: '123456',
  database: 'url_shortener',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
