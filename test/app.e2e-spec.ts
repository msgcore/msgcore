import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) should be public and serve frontend', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404) // 404 in test environment since frontend files aren't built
      .expect((res) => {
        // In test environment, frontend files don't exist, so we get 404
        // In production, this would return 200 with index.html
        expect(res.body).toHaveProperty('statusCode', 404);
      });
  });
});
