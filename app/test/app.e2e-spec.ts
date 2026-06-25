import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

describe('App E2E Tests', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let authToken: string;
  let createdUrlId: number;
  let randomEmail: string;
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
  }, 60000 * 3);

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
    randomEmail = `test-${crypto.randomUUID()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: randomEmail, password: 'password123' })
      .expect(201);
  });

  it('2. POST /auth/login -> token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: randomEmail, password: 'password123' })
      .expect(201);

    authToken = res.body.access_token;
    expect(authToken).toBeDefined();
  });
  it('3. POST /shorten without token -> 401', () => {
    return request(app.getHttpServer())
      .post('/shorten')
      .send({ longUrl: 'https://google.com' })
      .expect(401);
  });

  it('4. POST /shorten with token -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ longUrl: 'https://google.com' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.shortUrl).toBeDefined();
    createdUrlId = res.body.id;
  });

  it('5. GET /urls/my -> list with URL', async () => {
    const res = await request(app.getHttpServer())
      .get('/urls/my')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].longUrl).toBe('https://google.com');
  });

  it('6. DELETE /urls/:id -> 200', async () => {
    await request(app.getHttpServer())
      .delete(`/urls/${createdUrlId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const res = await request(app.getHttpServer())
      .get('/urls/my')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.find((item) => item.id === createdUrlId)).toBeUndefined();
  });

  it('POST /auth/login with wrong password -> 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: randomEmail, password: 'wrong-password' })
      .expect(401);
  });
});
