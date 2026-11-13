import { requireNode, run, unitEnvironment, integrationEnvironment } from './command.mjs';

const usage = 'Usage: node scripts/verify.mjs client|core|mail [--build] [--integration (core)] [--browser (client)]';
async function main() {
  const [service, ...flags] = process.argv.slice(2);
  if (service === '--help') { console.log(usage); return; }
  if (!['client', 'core', 'mail'].includes(service) || flags.some((flag) => !['--build', '--integration', '--browser'].includes(flag))
      || (flags.includes('--integration') && service !== 'core') || (flags.includes('--browser') && service !== 'client')) {
    throw new Error(usage);
  }
  requireNode();
  const env = unitEnvironment();
  const npm = (script, args = []) => run('npm', ['--prefix', service, 'run', script, ...args], { env });
  if (flags.includes('--integration')) {
    Object.assign(env, integrationEnvironment());
  }
  if (service === 'client') {
    await npm('lint');
    await npm('typecheck');
    await npm('test');
    if (flags.includes('--browser')) await npm('test:browser');
  } else if (service === 'core') {
    await npm('test');
  } else {
    await npm('lint');
    await npm('typecheck');
    await npm('test', ['--', '--runInBand']);
    await npm('test:e2e', ['--', '--runInBand']);
  }
  if (flags.includes('--build')) {
    const tag = `flawis-${service}-check`;
    // Builds happen inside the image, never in the running dev server's .next/dist.
    await run('docker', ['build', '--target', 'production', '-t', tag, service]);
    await run('docker', ['run', '--rm', '--network', 'none', tag, 'node', '--version']);
  }
  console.log(`${service}: requested checks passed.`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
