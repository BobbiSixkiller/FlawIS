import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { brokerConfiguration, brokerDefinitions, cancelNotifications, stagingRuntime } from './staging-runtime.mjs';

const env = { RMQ_URI: 'amqp://tester:p%40ss%2Fword@rabbitmq:5672/staging%2Fapp?frameMax=131072', REDIS_URI: 'redis://redis:6379' };
const rabbitVolume = 'flawis-staging_rabbitmq_data_staging';
const redisVolume = 'flawis_staging_redis_data';
const labels = (key) => ({ 'com.docker.compose.project': 'flawis-staging', 'com.docker.compose.volume': key });

function fixture(options = {}) {
  const calls = [];
  const config = {
    name: 'flawis-staging',
    volumes: {
      rabbitmq_data_staging: { name: rabbitVolume },
      redis_data_staging: { name: redisVolume },
    },
    services: { core: { environment: env }, mail: { environment: env } },
  };
  const run = (args, input) => {
    calls.push({ args, input: input?.input });
    if (args.includes('config')) return JSON.stringify(options.config || config);
    if (args[0] === 'compose' && args.at(-1) === 'down') {
      if (options.downFails) throw new Error('Stop failed');
      return '';
    }
    if (args[0] === 'volume') {
      if (args[1] === 'ls') return options.missingVolumes ? '' : `${rabbitVolume}\n${redisVolume}\nflawis_redis_data\nflawis-staging_mongo_data_staging`;
      if (args[1] === 'inspect') return JSON.stringify([{
        Name: args[2],
        Labels: args[2] === redisVolume ? (options.redisLabels ?? {}) : (options.rabbitLabels ?? labels('rabbitmq_data_staging')),
      }]);
      if (options.removalFails) throw new Error('Volume is still in use');
      return '';
    }
    if (args[0] === 'ps') return options.runningApp ? 'running-app-id' : '';
    if (args[0] === 'inspect') return JSON.stringify([{
      Name: `/${args[1]}`, State: { Running: true }, Config: { Labels: {
        'com.docker.compose.project': options.foreignContainer ? 'flawis' : 'flawis-staging',
        'com.docker.compose.service': args[1].includes('rabbitmq') ? 'rabbitmq' : 'mongo',
      } },
    }]);
    if (args[0] === 'exec') {
      if (options.execFails) throw new Error('Maintenance failed');
      return args.includes('mongosh') ? '{"cancelledNotifications":3}' : '';
    }
    throw new Error(`Unexpected test command: ${args.join(' ')}`);
  };
  return { run, calls, config };
}

test('broker initialization matches AMQP defaults and decodes explicit credentials/vhosts', () => {
  assert.deepEqual(brokerConfiguration(env), { username: 'tester', password: 'p@ss/word', vhost: 'staging/app' });
  assert.deepEqual(brokerConfiguration({ ...env, RMQ_URI: 'amqp://rabbitmq:5672?frameMax=131072' }),
    { username: 'guest', password: 'guest', vhost: '/' });
  assert.deepEqual(brokerConfiguration({ RMQ_URI: 'amqp://rabbitmq' }),
    { username: 'guest', password: 'guest', vhost: '/' });
});

test('external endpoints, malformed secrets and application use of the test vhost fail before Docker', () => {
  for (const value of ['amqp://secret@production:5672', 'amqp://rabbitmq:5673', 'amqp://rabbitmq/flawis-review-tests', 'amqp://user:%XX@rabbitmq', 'not-a-url-secret']) {
    const f = fixture();
    assert.throws(() => stagingRuntime('reset', { env: { ...env, RMQ_URI: value }, run: f.run }), (error) => {
      assert.ok(!error.message.includes(value));
      return true;
    });
    assert.equal(f.calls.length, 0);
  }
  assert.throws(() => brokerConfiguration({ ...env, REDIS_URI: 'redis://production:6379' }));
});

test('reset stops staging before removing exactly the two runtime volumes, including legacy unlabeled Redis', () => {
  const f = fixture();
  stagingRuntime('reset', { env, run: f.run });
  const mutations = f.calls.filter(({ args }) => args.at(-1) === 'down' || args[1] === 'rm').map(({ args }) => args);
  assert.deepEqual(mutations, [
    ['compose', '--env-file', '/dev/null', '-f', 'docker-compose.staging.yml', '-p', 'flawis-staging', 'down'],
    ['volume', 'rm', rabbitVolume], ['volume', 'rm', redisVolume],
  ]);
});

test('first deployment and repeated teardown tolerate absent runtime volumes', () => {
  const f = fixture({ missingVolumes: true });
  stagingRuntime('reset', { env, run: f.run });
  assert.equal(f.calls.filter(({ args }) => args.at(-1) === 'down').length, 1);
  assert.equal(f.calls.filter(({ args }) => args[1] === 'rm').length, 0);
});

test('foreign volume ownership or changed volume configuration aborts before stopping services', () => {
  for (const options of [
    { rabbitLabels: { ...labels('rabbitmq_data_staging'), 'com.docker.compose.project': 'flawis' } },
    { rabbitLabels: {} },
    { redisLabels: { ...labels('redis_data_staging'), 'com.docker.compose.project': 'flawis' } },
  ]) {
    const f = fixture(options);
    assert.throws(() => stagingRuntime('reset', { env, run: f.run }), /ownership/);
    assert.ok(!f.calls.some(({ args }) => args.at(-1) === 'down' || args[1] === 'rm'));
  }
  const { config } = fixture();
  config.volumes.redis_data_staging.name = 'flawis_redis_data';
  const f = fixture({ config });
  assert.throws(() => stagingRuntime('reset', { env, run: f.run }), /volume configuration/);
  assert.equal(f.calls.length, 1);
});

test('failed shutdown or volume removal stops deployment without forcing deletion', () => {
  const f = fixture({ downFails: true });
  assert.throws(() => stagingRuntime('reset', { env, run: f.run }), /Stop failed/);
  assert.ok(!f.calls.some(({ args }) => args[1] === 'rm'));
  const g = fixture({ removalFails: true });
  assert.throws(() => stagingRuntime('reset', { env, run: g.run }), /still in use/);
  assert.equal(g.calls.filter(({ args }) => args[1] === 'rm').length, 1);
});

test('snapshot and broker maintenance refuse running writers or a production container', () => {
  for (const command of ['cancel-notifications', 'bootstrap']) {
    for (const options of [{ runningApp: true }, { foreignContainer: true }]) {
      const f = fixture(options);
      assert.throws(() => stagingRuntime(command, { env, run: f.run }));
      assert.ok(!f.calls.some(({ args }) => args[0] === 'exec'));
    }
  }
});

test('broker bootstrap runs as the service user, imports credentials through stdin, and recreates separate permissions', () => {
  const f = fixture();
  stagingRuntime('bootstrap', { env, run: f.run });
  const call = f.calls.find(({ args }) => args[0] === 'exec');
  assert.deepEqual(call.args, ['exec', '--user', 'rabbitmq', '-i', 'flawis-staging-rabbitmq-1', 'rabbitmqctl', 'import_definitions']);
  const definitions = JSON.parse(call.input);
  assert.deepEqual(definitions.vhosts, [{ name: 'staging/app' }, { name: 'flawis-review-tests' }]);
  assert.deepEqual(definitions.permissions.map(({ user, vhost }) => [user, vhost]),
    [['tester', 'staging/app'], ['tester', 'flawis-review-tests']]);
  assert.ok(!JSON.stringify(call).includes('p@ss/word'));
  const hash = Buffer.from(definitions.users[0].password_hash, 'base64');
  assert.equal(hash.length, 36);
  assert.deepEqual(hash.subarray(4), createHash('sha256').update(hash.subarray(0, 4)).update('p@ss/word').digest());
  assert.notEqual(definitions.users[0].password_hash, brokerDefinitions(brokerConfiguration(env)).users[0].password_hash);
});

test('snapshot preparation targets the validated staging container and propagates cancellation failure', () => {
  const f = fixture();
  stagingRuntime('cancel-notifications', { env, run: f.run });
  const call = f.calls.find(({ args }) => args[0] === 'exec');
  assert.equal(call.args[2], 'flawis-staging-mongo-1');
  assert.equal(call.args.at(-1), 'mongodb://127.0.0.1:27017/flawis?replicaSet=rs0&directConnection=true');
  assert.equal(call.input, cancelNotifications);
  const g = fixture({ execFails: true });
  assert.throws(() => stagingRuntime('cancel-notifications', { env, run: g.run }), /Maintenance failed/);
});

test('snapshot cancellation selects only unfinished jobs and preserves their payload/history', () => {
  let writes = 0;
  const collection = {
    updateMany(filter, update) {
      assert.deepEqual(Array.from(filter.state.$in), ['PENDING', 'QUEUED', 'SENDING']);
      assert.deepEqual(Object.keys(update).sort(), ['$set', '$unset']);
      assert.deepEqual(Object.keys(update.$set).sort(), ['lastError', 'state', 'updatedAt']);
      assert.equal(update.$set.state, 'CANCELLED');
      assert.deepEqual(Object.keys(update.$unset).sort(), ['leaseUntil', 'nextAttemptAt']);
      writes++;
      return { modifiedCount: 3 };
    },
    countDocuments() { return 0; },
  };
  const output = [];
  const db = { getName: () => 'flawis', getCollection: (name) => {
    assert.equal(name, 'notifications');
    return collection;
  } };
  runInNewContext(cancelNotifications, { db, print: (value) => output.push(value) });
  assert.equal(writes, 1);
  assert.deepEqual(JSON.parse(output[0]), { cancelledNotifications: 3 });
  assert.throws(() => runInNewContext(cancelNotifications, { db: { ...db, getName: () => 'admin' } }), /Unexpected staging database/);
  assert.equal(writes, 1);
  assert.throws(() => runInNewContext(cancelNotifications, { db: { ...db, getCollection: () => ({ ...collection, countDocuments: () => 1 }) } }), /incomplete/);
});
