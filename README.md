# subsea7-playwright-bdd-automation

A Playwright + Cucumber BDD automation starter project for end-to-end web testing.

## Tech stack
- Playwright
- TypeScript
- Cucumber.js
- Page Object Model structure

## Project structure

- `features/` – Gherkin feature files
- `step-definitions/` – Cucumber step implementations
- `pages/` – Page Object Model classes
- `support/` – Hooks, world object, test setup
- `test-data/` – Test data files and fixtures
- `config/` – Environment-specific configuration
- `reports/` – HTML and screenshot outputs

## Setup

```bash
npm install
```

## Run tests

```bash
npm run test:bdd
```

## Useful commands

```bash
npm run test:bdd -- --tags @smoke
npx playwright test
npx playwright show-report
```

## Environment

Set the base URL before running tests:

```bash
export BASE_URL="https://example.com"
```
