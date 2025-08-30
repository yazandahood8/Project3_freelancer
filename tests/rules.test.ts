import request from 'supertest';
import { config } from '../src/config/env.js';
import '../src/app.js';
import { Pool } from 'pg';

const base = `http://localhost:${config.port}`;

async function clearDb() {
  const pool = new Pool({ connectionString: config.dbUri });
  await pool.query('DELETE FROM rules;');
  await pool.end();
}

describe('Rules API', () => {
  beforeAll(async () => { await clearDb(); });

  test('create domain rule', async () => {
    const res = await request(base).post('/api/rules').send({
      type: 'domain', value: 'example.com', mode: 'whitelist', active: true
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('create url rule (https only)', async () => {
    const res = await request(base).post('/api/rules').send({
      type: 'url', value: 'https://example.com/path', mode: 'blacklist'
    });
    expect(res.status).toBe(201);
  });

  test('reject invalid url (ftp)', async () => {
    const res = await request(base).post('/api/rules').send({
      type: 'url', value: 'ftp://foo.bar', mode: 'blacklist'
    });
    expect(res.status).toBe(400);
  });

  test('batch create (with duplicate ignored)', async () => {
    const body = [
      { type: 'ip', value: '10.0.0.1', mode: 'whitelist' },
      { type: 'ip', value: '10.0.0.1', mode: 'blacklist' }, // duplicate on (value,type) => ignored
      { type: 'port', value: 443, mode: 'whitelist' }
    ];
    const res = await request(base).post('/api/rules/batch').send(body);
    expect(res.status).toBe(201);
    expect(res.body.created.length).toBeGreaterThan(0);
    expect(res.body.duplicates).toBeGreaterThanOrEqual(1);
  });

  test('toggle active (single)', async () => {
    const list = await request(base).get('/api/rules');
    const id = list.body[0].id;
    const res = await request(base).patch(`/api/rules/${id}/active`).send({ active: false });
    expect(res.status).toBe(200);
    expect(res.body.active).toBe(false);
  });

  test('toggle active (batch)', async () => {
    const list = await request(base).get('/api/rules');
    const ids = list.body.slice(0, 2).map((r: any) => r.id);
    const res = await request(base).patch('/api/rules/batch/active').send({ ids, active: true });
    expect(res.status).toBe(200);
    expect(res.body.affected).toBeGreaterThan(0);
  });

  test('filter by type & mode & active', async () => {
    const res = await request(base).get('/api/rules?type=domain&mode=whitelist&active=true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('batch delete', async () => {
    const list = await request(base).get('/api/rules');
    const ids = list.body.slice(0, 2).map((r: any) => r.id);
    const res = await request(base).post('/api/rules/batch/delete').send({ ids });
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(ids.length);
  });
});
