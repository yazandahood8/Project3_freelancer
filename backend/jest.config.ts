import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/schema.ts'],
  coverageThreshold: {
    global: { statements: 100, branches: 90, functions: 100, lines: 100 }
  }
};
export default config;
