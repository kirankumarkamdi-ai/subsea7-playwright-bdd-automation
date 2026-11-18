const { existsSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = resolve(__dirname, '..');
const cucumberEntry = resolve(
  projectRoot,
  'node_modules/@cucumber/cucumber/bin/cucumber.js',
);
const args = process.argv.slice(2);
const reportsDirectory = resolve(projectRoot, 'reports');
const runLabel = getRunLabel(args);
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const reportName = `cucumber-report-${timestamp}-${process.pid}-${runLabel}.html`;
const reportPath = resolve(reportsDirectory, reportName);

mkdirSync(reportsDirectory, { recursive: true });

const testRun = spawnSync(process.execPath, [cucumberEntry, ...args], {
  cwd: projectRoot,
  env: { ...process.env, CUCUMBER_REPORT_PATH: reportPath },
  stdio: 'inherit',
});

if (testRun.error) {
  console.error(`Could not run Cucumber: ${testRun.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = testRun.status ?? 1;
}

if (existsSync(reportPath)) {
  const openReport = spawnSync('open', ['-a', 'Google Chrome', reportPath], {
    stdio: 'ignore',
  });

  if (openReport.error || openReport.status !== 0) {
    console.error(
      `Could not open the Cucumber report in Google Chrome. Report: ${reportPath}`,
    );
  }
}

function getRunLabel(args) {
  for (const option of ['--name', '--tags']) {
    const optionIndex = args.findIndex((argument) => argument === option || argument.startsWith(`${option}=`));
    if (optionIndex < 0) {
      continue;
    }

    const value = args[optionIndex].includes('=')
      ? args[optionIndex].slice(args[optionIndex].indexOf('=') + 1)
      : args[optionIndex + 1];
    if (value) {
      return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'selected';
    }
  }

  return 'all';
}
