import assert from 'node:assert/strict';
import test from 'node:test';
import { run, unitEnvironment, integrationEnvironment } from './command.mjs';

test('unit checks cannot inherit destructive integration-test opt-ins', () => {
  const original = { PATH: '/bin', REVIEW_TEST_MONGODB_URI: 'mongodb://shared', REVIEW_TEST_RABBIT_CONTAINER: 'staff-broker' };
  assert.deepEqual(unitEnvironment(original), { PATH: '/bin' });
  assert.equal(original.REVIEW_TEST_RABBIT_CONTAINER, 'staff-broker');
});

const staging = {
  REVIEW_TEST_ENVIRONMENT: 'staging',
  REVIEW_TEST_MONGODB_URI: 'mongodb://127.0.0.1:27018/flawis_reviews_test?directConnection=true',
};

test('integration checks require an explicit staging target and reject the production port', () => {
  assert.throws(() => integrationEnvironment({}));
  assert.throws(() => integrationEnvironment({ ...staging, REVIEW_TEST_ENVIRONMENT: 'production' }));
  assert.throws(() => integrationEnvironment({ ...staging, REVIEW_TEST_MONGODB_URI: 'mongodb://127.0.0.1:27017/flawis' }));
  assert.deepEqual(integrationEnvironment(staging), staging);
});

test('transport tests use a separate vhost and cannot restart a production broker', () => {
  assert.throws(() => integrationEnvironment({ ...staging, REVIEW_TEST_RABBITMQ_URI: 'amqp://127.0.0.1:5673/' }));
  const broker = { ...staging, REVIEW_TEST_RABBITMQ_URI: 'amqp://127.0.0.1:5673/flawis-review-tests' };
  assert.deepEqual(integrationEnvironment(broker), broker);
  assert.throws(() => integrationEnvironment({ ...broker, REVIEW_TEST_RABBIT_CONTAINER: 'flawis-rabbitmq-1' }));
  assert.equal(integrationEnvironment({ ...broker, REVIEW_TEST_RABBIT_CONTAINER: 'flawis-staging-rabbitmq-1' }).REVIEW_TEST_RABBIT_CONTAINER, 'flawis-staging-rabbitmq-1');
});

test('a failing verification subprocess is not reported as successful', async () => {
  await assert.rejects(run(process.execPath, ['-e', 'process.exit(7)'], { stdio: 'ignore' }), /failed \(7\)/);
});
