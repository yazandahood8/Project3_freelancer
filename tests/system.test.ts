import request from 'supertest';
import { config } from '../src/config/env.js';
import '../src/app.js';

const base = `http://localhost:${config.port}`;

describe('System flow', () => {
  test('create -> list (filtered) -> toggle -> delete', async () => {
    const create = await request(base).post('/api/rules').send({
      type: 'cidr', value: '192.168.1.0/24', mode: 'blacklist'
    });
    expect(create.status).toBe(201);

    const list = await request(base).get('/api/rules?type=cidr&mode=blacklist');
    expect(list.status).toBe(200);
    const found = list.body.find((r: any) => r.id === create.body.id);
    expect(found).toBeTruthy();

    const toggle = await request(base).patch(`/api/rules/${create.body.id}/active`).send({ active: false });
    expect(toggle.status).toBe(200);
    expect(toggle.body.active).toBe(false);

    const del = await request(base).delete(`/api/rules/${create.body.id}`);
    expect(del.status).toBe(204);
  });
});
