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

Create a local `.env` file and set `BASE_URL` to your authorized test environment. Keep `.env` out of source control; it is ignored by Git.

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
npm run codegen -- "$BASE_URL"
```

Perform the flow in the opened browser. Set the destination URL from your configured environment rather than embedding it in the command. To save the generated Playwright Test code directly to a file, add `--output`:

```bash
npm run codegen -- --output=playwright-tests/recorded-flow.spec.ts "$BASE_URL"
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

The admin scenarios use the manual entry form instead of PDF/OCR processing. They submit a fresh card, find its generated card ID in the validation queue, complete review, and then either approve or reject it. Each scenario checks the new card's resulting status in My History; the rejection scenario uses the configured reason in `test-data/admin-approval.json`. Update that fixture if the UAT client, project, worksite, observation, or rejection reason changes. The scenarios require a saved `worksite_admin` session. They do not verify Firestore contents, post-processing, notifications, GCS JSON output, or EventArc events.

Run the sidebar module navigation scenario:

```bash
npm run test:bdd -- --tags @navigation
```

It clicks each sidebar module in sequence and verifies the resulting route and page heading. It also checks that the Validation Queue sidebar badge shows the expected pending count and matches the queue summary.

Run the Risk Insights scenarios:

```bash
npm run test:bdd -- --tags @risk
```

They verify the risk summary counts and severity styling, check the seven AI-detected leading indicators, and follow a source-data link to its record.

Run the validation queue scenarios:

```bash
npm run test:bdd -- --tags @validation
```

They check that the queue counters are numeric and color-coded, exercise the available filter dropdowns, verify card-type/source filtering, and open a pending card for review. Counter totals are checked as live values rather than fixed numbers because they vary with queue activity.

Run the Data Search scenarios:

```bash
npm run test:bdd -- --tags @data-search
```

They exercise the Synergi global filters, location search and result-count consistency, Excel export and download, and card-type/status options and badge colors.

Run all authenticated scenarios or only the admin scenarios:

```bash
npm run test:bdd:requires-auth
npm run test:bdd:admin
```

The admin scenarios require a saved `worksite_admin` browser session.

If the scenario reports that the app redirected to an authentication provider, the saved session has expired or is invalid. Run `npm run auth:setup`, complete sign-in and MFA, press Enter in the terminal to overwrite the local session state, and retry.

Run the standalone Playwright example:

```bash
npm run test:playwright
```

Each Cucumber run saves a uniquely named report in `reports/`, including the run timestamp and selected test name or tag, so later runs do not overwrite earlier evidence. The report automatically opens in Google Chrome after execution, including when a scenario fails. This automatic opening is configured for macOS. Playwright's HTML report is written to `reports/playwright-report/`; open it with:

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
