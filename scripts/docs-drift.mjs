import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Advisory ownership map: a changed document still needs its claims checked.
const rules = [
  {
    document: 'docs/development.md',
    matches: [
      /^(?:\.nvmrc|\.env\.example|docker-compose[^/]*\.yml)$/,
      /^\.github\/workflows\//,
      /^(?:client|core|mail)\/(?:Dockerfile|\.nvmrc|package(?:-lock)?\.json)$/,
      /^scripts\/(?:verify|command|staging-runtime)[^/]*\.mjs$/,
      /^client\/(?:e2e\/|playwright\.config\.ts$|\.env\.e2e\.example$)/,
    ],
  },
  {
    document: 'docs/conference-reviews.md',
    matches: [
      /^core\/src\/services\/(?:reviews\/|(?:form|rmq|submission)\.service\.ts$)/,
      /^core\/src\/resolvers\/(?:reviews\/|types\/form\/)/,
      /^core\/src\/entitites\/(?:Review|Form|Notification|Submission|StoredObject)\.ts$/,
      /^core\/src\/(?:repositories\/form\.repository|routes\/reviews|middlewares\/activity\.middleware|util\/formValidation)\.ts$/,
      /^client\/src\/components\/(?:reviews\/|(?:conference-review-workspace|reviewer-[^/]+|review-settings|review-controls|revision-portal|form-library|answer-fields|author-review-feedback|activity-timeline)\.tsx$)/,
      /^client\/src\/lib\/(?:reviews\/|graphql\/Review\.graphql$)/,
      /^client\/src\/app\/.+\/(?:reviews?|review-settings|reviewers|forms|revise|activity)(?:\/|$)/,
      /^mail\/src\/(?:email\/|rmq\/|config\.ts$)/,
    ],
  },
  {
    document: 'docs/agent-workflow.md',
    matches: [
      /^(?:(?:client|core|mail)\/)?AGENTS\.md$/,
      /^\.codex\/(?:agents\/|config\.example\.toml$)/,
      /^\.agents\/skills\/(?:README\.md$|[^/]+\/agents\/openai\.yaml$)/,
      /^scripts\/docs-drift(?:\.test)?\.mjs$/,
    ],
  },
  {
    document: 'README.md',
    matches: [
      /^(?:\.nvmrc|docker-compose[^/]*\.yml)$/,
      /^(?:client|core|mail)\/package\.json$/,
    ],
  },
  {
    document: 'client/README.md',
    matches: [
      /^client\/(?:package(?:-lock)?\.json|Dockerfile|components\.json|codegen\.yml|playwright\.config\.ts)$/,
      /^client\/(?:e2e\/environment\.mjs|src\/proxy\.ts|src\/lib\/reachWebhookProxy\.ts)$/,
      /^client\/src\/app\/api\//,
    ],
  },
  {
    document: 'core/README.md',
    matches: [
      /^core\/(?:package(?:-lock)?\.json|Dockerfile|src\/index\.ts)$/,
      /^core\/scripts\/(?:schema\.cjs|reset-courses\.ts)$/,
      /^core\/src\/services\/(?:redis|minio|reach360|rmq)\.service\.ts$/,
      /^core\/src\/routes\/(?:reviews|reach360Webhook)\.ts$/,
    ],
  },
  {
    document: 'mail/README.md',
    matches: [
      /^mail\/(?:package(?:-lock)?\.json|Dockerfile|test\/app\.e2e-spec\.ts)$/,
      /^mail\/src\/(?:main|config|app\.module|email\/email\.service|rmq\/rmq\.module)\.ts$/,
    ],
  },
];

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Lists both sides of renames and includes untracked work, except in index-only mode. */
export function changedPaths(cwd, { staged = false, base } = {}) {
  if (staged && base) throw new Error('Use either --staged or --base, not both.');
  let reference = 'HEAD';
  if (base) {
    const commit = git(cwd, ['rev-parse', '--verify', '--end-of-options', `${base}^{commit}`]).trim();
    reference = git(cwd, ['merge-base', 'HEAD', commit]).trim();
  }
  const diff = git(cwd, ['diff', '--name-only', '-z', '--no-renames', ...(staged ? ['--cached'] : []), reference, '--']);
  const untracked = staged ? '' : git(cwd, ['ls-files', '--others', '--exclude-standard', '-z']);
  return [...new Set((diff + untracked).split('\0').filter(Boolean))].sort();
}

/** Suggests document reviews by path; it cannot determine whether prose is accurate. */
export function documentationReviews(paths) {
  const changed = new Set(paths);
  return rules.flatMap(({ document, matches }) => {
    const causes = paths.filter((path) => matches.some((pattern) => pattern.test(path)));
    return causes.length || changed.has(document)
      ? [{ document, causes, documentChanged: changed.has(document) }]
      : [];
  });
}

function main(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help') {
      console.log('Usage: node scripts/docs-drift.mjs [--staged | --base <ref>]\nAdvisory only: check current documentation claims against the changed code.');
      return;
    }
    if (argument === '--staged') options.staged = true;
    else if (argument === '--base' && args[index + 1] && !args[index + 1].startsWith('-')) options.base = args[++index];
    else throw new Error(`Unknown or incomplete argument: ${argument}`);
  }
  const cwd = git(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
  const reviews = documentationReviews(changedPaths(cwd, options));
  console.log('Documentation review reminders (not a semantic drift check):');
  if (!reviews.length) console.log('No mapped paths changed. Check other affected documentation as needed.');
  for (const { document, causes, documentChanged } of reviews) {
    console.log(`- ${document}: ${documentChanged ? 'also changed; verify current claims' : 'unchanged; review affected claims'}`);
    for (const path of causes.slice(0, 4)) console.log(`  ${path}`);
    if (causes.length > 4) console.log(`  ... and ${causes.length - 4} more paths`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
