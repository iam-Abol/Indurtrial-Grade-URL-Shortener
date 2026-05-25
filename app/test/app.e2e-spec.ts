import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

describe('App E2E Integration Tests', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let authToken: string;
  let createdUrlId: number;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer(
      'mirror2.chabokan.net/postgres:16-alpine',
    ).start();

    process.env.DB_HOST = postgresContainer.getHost();
    process.env.DB_PORT = postgresContainer.getPort().toString();
    process.env.DB_USER = postgresContainer.getUsername();
    process.env.DB_PASS = postgresContainer.getPassword();
    process.env.DB_NAME = postgresContainer.getDatabase();
    process.env.REDIS_URL = 'redis://localhost:6379';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }, 60000 * 3); // زمان اضافه برای بالا آمدن کانتینر

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  it('1. POST /auth/signup -> 201', () => {
    const randomEmail = `test-${Math.random()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: randomEmail, password: 'password123' })
      .expect(201);
  });
});
