import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { changedPaths, documentationReviews } from './docs-drift.mjs';

test('reviews changed documents too; a prose edit does not prove factual accuracy', () => {
  const reviews = documentationReviews(['mail/src/config.ts', 'docs/conference-reviews.md']);
  assert.deepEqual(reviews.map(({ document, documentChanged }) => ({ document, documentChanged })), [
    { document: 'docs/conference-reviews.md', documentChanged: true },
    { document: 'mail/README.md', documentChanged: false },
  ]);
  assert.equal(documentationReviews(['docs/development.md'])[0].documentChanged, true);
});

test('service setup changes flag their own README without unrelated service guides', () => {
  const documents = documentationReviews(['core/scripts/schema.cjs']).map(({ document }) => document);
  assert.deepEqual(documents, ['core/README.md']);
  assert.deepEqual(documentationReviews(['client/README.md']), [
    { document: 'client/README.md', causes: [], documentChanged: true },
  ]);
  const runtime = documentationReviews(['.nvmrc']).map(({ document }) => document);
  assert.ok(runtime.includes('README.md'));
  assert.ok(runtime.includes('docs/development.md'));
});

test('unrelated UI, generated contracts, and vendored reference changes do not trigger broad doc reviews', () => {
  assert.deepEqual(documentationReviews([
    'client/src/components/ui/button.tsx',
    'client/src/lib/graphql/generated/graphql.ts',
    '.agents/skills/react-best-practices/rules/async-parallel.md',
  ]), []);
  assert.deepEqual(documentationReviews(['.github/workflows/staging.yml']).map(({ document }) => document), ['docs/development.md']);
});

test('Git scopes retain deletions, both rename paths, untracked files, and changes since the branch point', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'flawis-docs-drift-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const write = (path, value) => writeFileSync(join(cwd, path), value);
  git('init', '-q');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', '/dev/null');
  mkdirSync(join(cwd, 'docs'));
  write('old name.txt', 'rename me');
  write('delete.txt', 'delete me');
  write('.gitignore', 'ignored.txt\n');
  git('add', '.');
  git('commit', '-qm', 'base');
  git('branch', 'reference');
  write('committed.txt', 'branch change');
  git('add', '.');
  git('commit', '-qm', 'branch change');
  renameSync(join(cwd, 'old name.txt'), join(cwd, 'new name.txt'));
  git('add', '-A');
  rmSync(join(cwd, 'delete.txt'));
  write('docs/new.md', 'untracked');
  write('ignored.txt', 'not input');
  assert.deepEqual(changedPaths(cwd, { staged: true }), ['new name.txt', 'old name.txt']);
  assert.deepEqual(changedPaths(cwd), ['delete.txt', 'docs/new.md', 'new name.txt', 'old name.txt']);
  // Advance the reference independently: its unrelated file is not our change.
  git('checkout', '-q', 'reference');
  write('other-branch.txt', 'not our change');
  git('add', 'other-branch.txt');
  git('commit', '--only', '-qm', 'other branch', 'other-branch.txt');
  git('checkout', '-q', '-');
  assert.deepEqual(changedPaths(cwd, { base: 'reference' }), ['committed.txt', 'delete.txt', 'docs/new.md', 'new name.txt', 'old name.txt']);
  assert.throws(() => changedPaths(cwd, { base: 'missing-reference' }));
  assert.throws(() => changedPaths(cwd, { staged: true, base: 'HEAD' }), /either/);
});
