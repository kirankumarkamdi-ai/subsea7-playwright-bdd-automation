import { Then, When } from '@cucumber/cucumber';
import { AuditBrandingPage } from '../pages/audit-branding-page';
import { Luna7Page } from '../pages/luna7-page';
import { CustomWorld } from '../support/world';

function auditBrandingPage(world: CustomWorld): AuditBrandingPage {
  world.auditBrandingPage ??= new AuditBrandingPage(world.page);
  return world.auditBrandingPage;
}

function luna7Page(world: CustomWorld): Luna7Page {
  world.luna7Page ??= new Luna7Page(world.page);
  return world.luna7Page;
}

Then('the Audit Logs page should be available', async function (this: CustomWorld) {
  await auditBrandingPage(this).expectAuditLogsAvailable();
});

Then(
  "the sidebar should show the red Subsea7 logo and the signed-in user's initials",
  async function (this: CustomWorld) {
    await auditBrandingPage(this).expectBrandingAndUserInitials();
  },
);

When('I send Luna7 a safety query', async function (this: CustomWorld) {
  await luna7Page(this).sendSafetyQuery();
});

Then('Luna7 should display a distinct user message and safety response', async function (this: CustomWorld) {
  await luna7Page(this).expectSafetyResponse();
});
