import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const artifactsDir = path.join(repoRoot, 'artifacts', 'release-gates');
const summaryFile = path.join(artifactsDir, 'summary.json');
const markdownFile = path.join(artifactsDir, 'summary.md');

await fs.mkdir(artifactsDir, { recursive: true });

const steps = [
  { name: 'validate:citations', command: ['npm', 'run', 'validate:citations'] },
  { name: 'validate:content', command: ['npm', 'run', 'validate:content'] },
  { name: 'validate:routes', command: ['npm', 'run', 'validate:routes'] },
  { name: 'validate:legal', command: ['npm', 'run', 'validate:legal'] },
  { name: 'validate:crawl', command: ['npm', 'run', 'validate:crawl'] },
  { name: 'validate:design', command: ['npm', 'run', 'validate:design'] },
  { name: 'validate:analytics', command: ['npm', 'run', 'validate:analytics'] },
  { name: 'validate:workflows', command: ['npm', 'run', 'validate:workflows'] },
  { name: 'test', command: ['npm', 'test'] },
  { name: 'build', command: ['npm', 'run', 'build'] },
  { name: 'validate:prerender', command: ['npm', 'run', 'validate:prerender'] },
  { name: 'validate:links', command: ['npm', 'run', 'validate:links'] },
  { name: 'validate:performance', command: ['npm', 'run', 'validate:performance'] },
  { name: 'smoke:routes', command: ['npm', 'run', 'smoke:routes'] },
  { name: 'test:a11y', command: ['npm', 'run', 'test:a11y'] },
  { name: 'test:release', command: ['npm', 'run', 'test:release'] },
];

function runCommand(command, { cwd = repoRoot } = {}) {
  return new Promise((resolve) => {
    const [cmd, ...args] = command;
    const child = spawn(cmd, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
      });
    });
  });
}

const startedAt = new Date().toISOString();
const results = [];
let failed = false;

for (const step of steps) {
  const stepStarted = Date.now();
  console.log(`\n>>> ${step.name}`);
  const result = await runCommand(step.command);
  const durationMs = Date.now() - stepStarted;
  const logFile = path.join(artifactsDir, `${step.name.replace(/[:/]/g, '_')}.log`);
  await fs.writeFile(
    logFile,
    `# ${step.name}\n\nCommand: ${step.command.join(' ')}\nExit code: ${result.code}\nDuration ms: ${durationMs}\n\n## STDOUT\n\n${result.stdout}\n\n## STDERR\n\n${result.stderr}\n`,
    'utf8',
  );

  results.push({
    name: step.name,
    command: step.command.join(' '),
    result: result.code === 0 ? 'pass' : 'fail',
    exitCode: result.code,
    durationMs,
    logFile: path.relative(repoRoot, logFile),
  });

  if (result.code !== 0) {
    failed = true;
    break;
  }
}

const summary = {
  startedAt,
  completedAt: new Date().toISOString(),
  result: failed ? 'fail' : 'pass',
  steps: results,
};

await fs.writeFile(summaryFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const markdown = [
  '# Release Gate Summary',
  '',
  `- Started: ${summary.startedAt}`,
  `- Completed: ${summary.completedAt}`,
  `- Result: ${summary.result}`,
  '',
  '| Step | Result | Exit code | Duration (ms) | Log |',
  '| --- | --- | --- | --- | --- |',
  ...results.map((step) => `| \`${step.name}\` | ${step.result} | ${step.exitCode} | ${step.durationMs} | \`${step.logFile}\` |`),
  '',
  'Production launch remains blocked until `F44-GOV-02` supplies final legal identity/contact values, approved privacy/consent/retention language, verified `sameAs`, and production indexing approval.',
  '',
].join('\n');

await fs.writeFile(markdownFile, `${markdown}\n`, 'utf8');

if (failed) {
  console.error(`\nRelease gates failed. See ${path.relative(repoRoot, summaryFile)} and step logs under ${path.relative(repoRoot, artifactsDir)}.`);
  process.exit(1);
}

console.log(`\nRelease gates passed. Summary written to ${path.relative(repoRoot, summaryFile)}.`);
