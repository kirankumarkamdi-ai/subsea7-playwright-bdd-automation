import { World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { AdminApprovalPage } from '../pages/admin-approval-page';
import { HomePage } from '../pages/home-page';
import { ModuleNavigationPage } from '../pages/module-navigation-page';
import { ValidationQueuePage } from '../pages/validation-queue-page';
import { RiskInsightsPage } from '../pages/risk-insights-page';
import { DataSearchPage } from '../pages/data-search-page';
import { SynergiGlobalFiltersPage } from '../pages/synergi-global-filters-page';
import { IngestionPage } from '../pages/ingestion-page';
import { MyHistoryPage } from '../pages/my-history-page';
import { DashboardSubmissionsPage } from '../pages/dashboard-submissions-page';
import { AuditBrandingPage } from '../pages/audit-branding-page';
import { Luna7Page } from '../pages/luna7-page';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  homePage!: HomePage;
  adminApprovalPage!: AdminApprovalPage;
  moduleNavigationPage!: ModuleNavigationPage;
  validationQueuePage!: ValidationQueuePage;
  riskInsightsPage?: RiskInsightsPage;
  dataSearchPage?: DataSearchPage;
  synergiGlobalFiltersPage?: SynergiGlobalFiltersPage;
  ingestionPage?: IngestionPage;
  myHistoryPage?: MyHistoryPage;
  dashboardSubmissionsPage?: DashboardSubmissionsPage;
  auditBrandingPage?: AuditBrandingPage;
  luna7Page?: Luna7Page;
}
