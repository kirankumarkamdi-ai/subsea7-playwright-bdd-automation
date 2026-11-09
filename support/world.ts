import { World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { HomePage } from '../pages/home-page';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  homePage!: HomePage;
}
