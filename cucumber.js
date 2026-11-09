module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['step-definitions/**/*.ts', 'support/**/*.ts'],
    requireModule: ['ts-node/register', 'dotenv/config'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    publishQuiet: true,
    parallel: 1,
  },
};
