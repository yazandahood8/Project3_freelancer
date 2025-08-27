import request from 'supertest';
import { config } from '../src/config/env.js';
import '../src/app.js'; // start server
import { Pool } from 'pg';

const base = `http://localhost:${config.port}`;

async function clearDb() {
  const pool = new Pool({ connectionString: config.dbUri });
  await pool.query('DELETE FROM rules;');
  await pool.end();
}

describe('Rules API - unit-ish via supertest', () => {
  beforeAll(async () => { await clearDb(); });

  test('create rule - success #1', async () => {
    const res = await request(base).post('/api/rules').send({
      source_ip: '10.0.0.1',
      dest_ip: '10.0.0.2',
      port: 80,
      protocol: 'tcp',
      action: 'allow'
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('create rule - success #2 different params', async () => {
    const res = await request(base).post('/api/rules').send({
      source_ip: '192.168.1.5',
      dest_ip: '8.8.8.8',
      port: 53,
      protocol: 'udp',
      action: 'deny'
    });
    expect(res.status).toBe(201);
  });

  test('edge case - invalid port (0)', async () => {
    const res = await request(base).post('/api/rules').send({
      source_ip: '10.0.0.1',
      dest_ip: '10.0.0.3',
      port: 0,
      protocol: 'tcp',
      action: 'allow'
    });
    expect(res.status).toBe(400);
  });

  test('edge case - invalid ip', async () => {
    const res = await request(base).post('/api/rules').send({
      source_ip: '999.999.999.999',
      dest_ip: '1.1.1.1',
      port: 22,
      protocol: 'tcp',
      action: 'allow'
    });
    expect(res.status).toBe(400);
  });

  test('duplicate rule - 409', async () => {
    const body = {
      source_ip: '172.16.0.10',
      dest_ip: '172.16.0.11',
      port: 443,
      protocol: 'tcp',
      action: 'allow'
    };
    const r1 = await request(base).post('/api/rules').send(body);
    expect(r1.status).toBe(201);
    const r2 = await request(base).post('/api/rules').send(body);
    expect(r2.status).toBe(409);
  });

  test('list rules', async () => {
    const res = await request(base).get('/api/rules');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
