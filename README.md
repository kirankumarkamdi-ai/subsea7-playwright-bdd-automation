# Subsea7 Playwright BDD Automation

A starter end-to-end automation project using Playwright, Cucumber, TypeScript, and the Page Object Model. The included tests use `https://example.com` as a safe placeholder; replace it with your authorized application URL and add your application-specific scenarios.

## Requirements

- Node.js 20 or newer (LTS recommended)
- Git
- Visual Studio Code

## Clone and open in VS Code

1. In VS Code, open the Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS).
2. Select **Git: Clone**.
3. Paste `https://github.com/kirankumarkamdi-ai/subsea7-playwright-bdd-automation.git`.
4. Choose a local folder, then select **Open** when VS Code prompts you.
5. Open **Terminal → New Terminal** and run the setup commands below.

Alternatively, clone from a terminal and open the project:

```bash
git clone https://github.com/kirankumarkamdi-ai/subsea7-playwright-bdd-automation.git
cd subsea7-playwright-bdd-automation
code .
```

If `code .` is not recognized, use VS Code's **File → Open Folder** and choose the cloned directory.

## Install and configure

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` and set `BASE_URL` to your authorized test environment. Keep secrets out of source control; `.env` is ignored by Git.

```dotenv
BASE_URL=https://your-test-environment.example
```

## Run tests

Run the Cucumber BDD scenarios:

```bash
npm run test:bdd
```

Run only scenarios tagged `@smoke`:

```bash
npm run test:bdd:smoke
```

Run the standalone Playwright example:

```bash
npm run test:playwright
```

Cucumber's HTML report is written to `reports/cucumber-report.html`. Playwright's HTML report is written to `reports/playwright-report/`; open it with:

```bash
npm run test:report
```

Screenshots for failed Cucumber scenarios are saved under `reports/screenshots/`.

## Project layout

```text
features/
  regression/           Gherkin feature files
step-definitions/       Cucumber step implementations
pages/                  Page Object Model classes
support/                Cucumber World and hooks
  hooks.ts
  world.ts
test-data/               Test data and fixtures
config/                  Environment configuration
playwright-tests/        Standalone Playwright specs
reports/                 Generated test reports and screenshots
.vscode/                 Recommended VS Code extensions
playwright.config.ts
cucumber.js
package.json
tsconfig.json
```

## Add your application tests

- Update `BASE_URL` in `.env` for your test environment.
- Add business scenarios under `features/` using Gherkin.
- Implement steps in `step-definitions/` and keep UI interactions in `pages/`.
- Use test accounts and data approved for the environment. Avoid committing credentials or production customer data.
