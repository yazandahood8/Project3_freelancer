import request from 'supertest';
import { config } from '../src/config/env.js';
import '../src/app.js';

const base = `http://localhost:${config.port}`;

describe('System happy flow', () => {
  test('create -> list -> delete', async () => {
    const create = await request(base).post('/api/rules').send({
      source_ip: '1.1.1.1',
      dest_ip: '8.8.4.4',
      port: 8080,
      protocol: 'tcp',
      action: 'allow'
    });
    expect(create.status).toBe(201);

    const list = await request(base).get('/api/rules');
    const found = list.body.find((r: any) => r.id === create.body.id);
    expect(found).toBeTruthy();

    const del = await request(base).delete(`/api/rules/${create.body.id}`);
    expect(del.status).toBe(204);
  });
});
