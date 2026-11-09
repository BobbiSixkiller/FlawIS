import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { root, requireNode } from './command.mjs';

const project = 'flawis-staging';
const compose = ['compose', '--env-file', '/dev/null', '-f', 'docker-compose.staging.yml', '-p', project];
const runtimeVolumes = {
  rabbitmq_data_staging: 'flawis-staging_rabbitmq_data_staging',
  redis_data_staging: 'flawis_staging_redis_data',
};
const testVhost = 'flawis-review-tests';

export function brokerConfiguration(env) {
  // Never include the original URI in errors; it can contain credentials.
  try {
    const uri = new URL(env.RMQ_URI);
    const redis = new URL(env.REDIS_URI || 'redis://redis:6379');
    if (uri.protocol !== 'amqp:' || uri.hostname !== 'rabbitmq' || (uri.port && uri.port !== '5672') || uri.hash
      || redis.protocol !== 'redis:' || redis.hostname !== 'redis' || (redis.port && redis.port !== '6379')) {
      throw new Error();
    }
    const explicitCredentials = uri.username || uri.password;
    const username = explicitCredentials ? decodeURIComponent(uri.username) : 'guest';
    const password = explicitCredentials ? decodeURIComponent(uri.password) : 'guest';
    const vhost = decodeURIComponent(uri.pathname.slice(1)) || '/';
    if (!username || !password || vhost === testVhost) throw new Error();
    return { username, password, vhost };
  } catch {
    throw new Error('Staging requires RMQ_URI at amqp://rabbitmq:5672 and REDIS_URI at redis://redis:6379; keep the application separate from the test vhost.');
  }
}

export function brokerDefinitions({ username, password, vhost }) {
  // RabbitMQ's documented salted SHA-256 format; only a hash goes over stdin.
  // https://www.rabbitmq.com/docs/passwords#computing-password-hashes
  const salt = randomBytes(4);
  const hash = createHash('sha256').update(salt).update(password, 'utf8').digest();
  return {
    users: [{ name: username, password_hash: Buffer.concat([salt, hash]).toString('base64'),
      hashing_algorithm: 'rabbit_password_hashing_sha256', tags: [] }],
    vhosts: [{ name: vhost }, { name: testVhost }],
    permissions: [vhost, testVhost].map((name) => ({ user: username, vhost: name, configure: '.*', write: '.*', read: '.*' })),
  };
}

export const cancelNotifications = `
if (db.getName() !== 'flawis') throw new Error('Unexpected staging database.');
const active = { state: { $in: ['PENDING', 'QUEUED', 'SENDING'] } };
const result = db.getCollection('notifications').updateMany(active, {
  $set: { state: 'CANCELLED', updatedAt: new Date(), lastError: 'Cancelled during staging snapshot refresh.' },
  $unset: { leaseUntil: '', nextAttemptAt: '' }
});
if (db.getCollection('notifications').countDocuments(active) !== 0) {
  throw new Error('Staging notification cancellation was incomplete.');
}
print(JSON.stringify({ cancelledNotifications: result.modifiedCount }));
`;

function docker(args, options = {}) {
  const result = spawnSync('docker', args, { cwd: root, encoding: 'utf8', timeout: 120_000,
    maxBuffer: 16 * 1024 * 1024, ...options });
  if (result.error || result.status !== 0) {
    // Docker inspect/config and broker errors can contain secrets. Fail closed
    // without copying command arguments, stdin or raw daemon output into CI logs.
    throw new Error(`Docker ${args[0]} failed (${result.signal || result.status || result.error?.code}). Check the staging service on the runner.`);
  }
  return result.stdout.trim();
}

export function stagingRuntime(command, { env = process.env, run = docker } = {}) {
  if (!['check', 'reset', 'cancel-notifications', 'bootstrap'].includes(command)) {
    throw new Error('Usage: node scripts/staging-runtime.mjs check|reset|cancel-notifications|bootstrap');
  }
  const broker = brokerConfiguration(env);
  const config = JSON.parse(run([...compose, 'config', '--format', 'json']));
  if (config.name !== project) throw new Error('Unexpected Compose project.');
  for (const [key, name] of Object.entries(runtimeVolumes)) {
    if (config.volumes?.[key]?.name !== name || config.volumes[key].external) {
      throw new Error(`Unexpected staging runtime volume configuration: ${key}`);
    }
  }
  for (const service of ['core', 'mail']) {
    if (config.services[service].environment.RMQ_URI !== env.RMQ_URI) {
      throw new Error('Application broker configuration differs from the staging reset configuration.');
    }
  }
  if ((config.services.core.environment.REDIS_URI || '') !== (env.REDIS_URI || '')) {
    throw new Error('Application Redis configuration differs from the staging reset configuration.');
  }
  if (command === 'check') return;

  if (command === 'reset') {
    const existing = new Set(run(['volume', 'ls', '--format', '{{.Name}}']).split('\n'));
    const remove = [];
    for (const [key, name] of Object.entries(runtimeVolumes)) {
      if (!existing.has(name)) continue;
      const [volume] = JSON.parse(run(['volume', 'inspect', name]));
      const labels = volume.Labels || {};
      // The previous workflow created this exact Redis volume without labels.
      const legacyRedis = key === 'redis_data_staging' && Object.keys(labels).length === 0;
      if (volume.Name !== name || (!legacyRedis && (labels['com.docker.compose.project'] !== project
        || labels['com.docker.compose.volume'] !== key))) {
        throw new Error(`Refusing to remove a volume without staging ownership: ${name}`);
      }
      remove.push(name);
    }
    run([...compose, 'down']);
    // No --volumes, wildcard, prune, or --force: mounted volumes must fail removal.
    for (const name of remove) run(['volume', 'rm', name]);
    return;
  }

  for (const service of ['core', 'client', 'mail']) {
    if (run(['ps', '-q', '--filter', `label=com.docker.compose.project=${project}`,
      '--filter', `label=com.docker.compose.service=${service}`])) {
      throw new Error(`Stop staging ${service} before preparing the snapshot or broker.`);
    }
  }
  const service = command === 'bootstrap' ? 'rabbitmq' : 'mongo';
  const name = `${project}-${service}-1`;
  const [container] = JSON.parse(run(['inspect', name]));
  const labels = container.Config?.Labels || {};
  if (container.Name !== `/${name}` || !container.State?.Running
    || labels['com.docker.compose.project'] !== project || labels['com.docker.compose.service'] !== service) {
    throw new Error(`Expected a running staging ${service} container.`);
  }
  if (command === 'cancel-notifications') {
    const output = run(['exec', '-i', name, 'mongosh', '--quiet', '--file', '/dev/stdin',
      'mongodb://127.0.0.1:27017/flawis?replicaSet=rs0&directConnection=true'], { input: cancelNotifications });
    const result = JSON.parse(output);
    if (!Number.isInteger(result.cancelledNotifications) || result.cancelledNotifications < 0) {
      throw new Error('Staging snapshot cancellation did not return a valid result.');
    }
    console.log(`Cancelled ${result.cancelledNotifications} copied notification jobs.`);
  } else {
    // RabbitMQ 4.1's import_definitions reads stdin when no file is supplied.
    run(['exec', '-i', name, 'rabbitmqctl', 'import_definitions'], {
      input: JSON.stringify(brokerDefinitions(broker)),
    });
    console.log('Initialized the staging broker account and application/test vhosts.');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    requireNode();
    stagingRuntime(process.argv[2]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
