import { World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { AdminApprovalPage } from '../pages/admin-approval-page';
import { HomePage } from '../pages/home-page';
import { ModuleNavigationPage } from '../pages/module-navigation-page';
import { ValidationQueuePage } from '../pages/validation-queue-page';
import { RiskInsightsPage } from '../pages/risk-insights-page';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  homePage!: HomePage;
  adminApprovalPage!: AdminApprovalPage;
  moduleNavigationPage!: ModuleNavigationPage;
  validationQueuePage!: ValidationQueuePage;
  riskInsightsPage?: RiskInsightsPage;
}
