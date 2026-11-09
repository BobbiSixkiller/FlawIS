import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));

export function requireNode() {
  const expected = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
  if (process.versions.node !== expected) {
    throw new Error(`Use Node ${expected} for this checkout (run nvm use). Current: ${process.versions.node}`);
  }
}

export function unitEnvironment(source = process.env) {
  // An exported opt-in variable must not silently turn unit tests into DB resets.
  return Object.fromEntries(Object.entries(source).filter(([key]) => !key.startsWith('REVIEW_TEST_')));
}

export function integrationEnvironment(source = process.env) {
  if (source.REVIEW_TEST_ENVIRONMENT !== 'staging') {
    throw new Error('Integration checks require REVIEW_TEST_ENVIRONMENT=staging. See docs/development.md.');
  }
  const mongo = new URL(source.REVIEW_TEST_MONGODB_URI || 'missing:');
  if (mongo.protocol !== 'mongodb:' || mongo.hostname !== '127.0.0.1' || mongo.port !== '27018') {
    throw new Error('Use the staging MongoDB endpoint at 127.0.0.1:27018 (on the VM or through a tunnel).');
  }
  const env = {
    REVIEW_TEST_ENVIRONMENT: 'staging',
    REVIEW_TEST_MONGODB_URI: source.REVIEW_TEST_MONGODB_URI,
  };
  if (source.REVIEW_TEST_RABBITMQ_URI) {
    const broker = new URL(source.REVIEW_TEST_RABBITMQ_URI);
    if (broker.protocol !== 'amqp:' || broker.hostname !== '127.0.0.1' || broker.port !== '5673'
      || broker.pathname !== '/flawis-review-tests') {
      throw new Error('Transport tests require staging RabbitMQ at 127.0.0.1:5673/flawis-review-tests.');
    }
    env.REVIEW_TEST_RABBITMQ_URI = source.REVIEW_TEST_RABBITMQ_URI;
  }
  if (source.REVIEW_TEST_RABBIT_CONTAINER) {
    if (!env.REVIEW_TEST_RABBITMQ_URI || source.REVIEW_TEST_RABBIT_CONTAINER !== 'flawis-staging-rabbitmq-1') {
      throw new Error('Broker restart tests must explicitly target flawis-staging-rabbitmq-1 on the staging VM.');
    }
    env.REVIEW_TEST_RABBIT_CONTAINER = source.REVIEW_TEST_RABBIT_CONTAINER;
  }
  return env;
}

export function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} failed (${signal || code}).`));
    });
  });
}
