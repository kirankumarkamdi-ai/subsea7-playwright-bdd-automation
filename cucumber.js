module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['step-definitions/**/*.ts', 'support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', `html:${process.env.CUCUMBER_REPORT_PATH || 'reports/cucumber-report.html'}`],
    publishQuiet: true,
    parallel: 1,
  },
};
