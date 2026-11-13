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
BASE_URL=https://hsseqcards-uat.subsea7.com
```

## Authenticate with MFA

Create a local Playwright session after signing in with your approved account and completing MFA:

```bash
npm run auth:setup
```

In the opened browser, complete sign-in and MFA, then press Enter in the terminal to save the session to `playwright/.auth/user.json`. The Playwright config and Cucumber hooks use this file when it exists. It is ignored by Git because it contains sensitive session data; do not share or commit it. Re-run the setup command when the session expires. For approval scenarios, authenticate as a `worksite_admin` user.

## Record a UI flow with Playwright Codegen

After saving your authenticated session, export `BASE_URL` from your environment and start Codegen with that session:

```bash
npm run codegen -- --load-storage=playwright/.auth/user.json "$BASE_URL"
```

Perform the flow in the opened browser. Set the destination URL from your configured environment rather than embedding it in the command. To save the generated Playwright Test code directly to a file, add `--output`:

```bash
npm run codegen -- --load-storage=playwright/.auth/user.json --output=playwright-tests/recorded-flow.spec.ts "$BASE_URL"
```

Review and edit recorded code before running or committing it. Codegen produces Playwright Test code, not Gherkin; for BDD scenarios, translate the recorded actions into a feature and reusable step definitions/page objects. Do not record or commit credentials, MFA codes, or session state.

## Run tests

Run the Cucumber BDD scenarios:

```bash
npm run test:bdd
```

Run only scenarios tagged `@smoke`:

```bash
npm run test:bdd:smoke
```

Run the create-through-approval UI scenario:

```bash
npm run test:bdd -- --tags @admin
```

To run it with a visible browser on macOS/Linux:

```bash
HEADLESS=false npm run test:bdd -- --tags @admin
```

In PowerShell, use `$env:HEADLESS="false"; npm run test:bdd -- --tags @admin`. The default remains headless.

The scenario uses the manual entry form instead of PDF/OCR processing: it enters a sample observation, submits it, finds its generated card ID in the validation queue, validates and approves that card, then checks that the same card has `approved` status in My History. Its sample values are in `test-data/admin-approval.json`; update that fixture if the UAT client, project, worksite, or observation changes. It requires a saved `worksite_admin` session. It does not verify GCS JSON output or EventArc events.

If the scenario reports that the app redirected to an authentication provider, the saved session has expired or is invalid. Run `npm run auth:setup`, complete sign-in and MFA, press Enter in the terminal to overwrite the local session state, and retry.

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
test-data/               Test data and fixtures (including the admin scenario PDF)
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
