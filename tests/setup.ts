import 'dotenv/config';

process.env.ENV = 'dev';
process.env.PORT = process.env.PORT || '4001';
process.env.DATABASE_URI_DEV = process.env.DATABASE_URI_DEV || 'postgres://postgres:postgres@localhost:5432/firewall_test';
process.env.DATABASE_URI_PROD = process.env.DATABASE_URI_PROD || 'postgres://postgres:postgres@localhost:5432/firewall_test';
process.env.DB_CONNECTION_INTERVAL = '200';
process.env.LOG_FILE = './logs/test.log';
