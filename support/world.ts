import { World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { AdminApprovalPage } from '../pages/admin-approval-page';
import { HomePage } from '../pages/home-page';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  homePage!: HomePage;
  adminApprovalPage!: AdminApprovalPage;
}
