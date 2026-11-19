import { Then, When } from '@cucumber/cucumber';
import { AuditBrandingPage } from '../pages/audit-branding-page';
import { DashboardSubmissionsPage } from '../pages/dashboard-submissions-page';
import { IngestionPage } from '../pages/ingestion-page';
import { CustomWorld } from '../support/world';

function createdCard(world: CustomWorld): { cardId: string; description: string } {
  if (!world.createdManualCard) {
    throw new Error('Create a manual card before checking its audit activity or deleting it.');
  }
  return world.createdManualCard;
}

When('I create a manual card for the system-admin checks', async function (this: CustomWorld) {
  this.ingestionPage ??= new IngestionPage(this.page);
  this.createdManualCard = await this.ingestionPage.createManualObservationCardForGovernance();
});

When('I search audit logs for the created card', async function (this: CustomWorld) {
  this.auditBrandingPage ??= new AuditBrandingPage(this.page);
  await this.auditBrandingPage.searchForCard(createdCard(this).cardId);
});

Then(
  'the audit log should show the created card with all required activity fields',
  async function (this: CustomWorld) {
    this.auditBrandingPage ??= new AuditBrandingPage(this.page);
    await this.auditBrandingPage.expectActivityForCard(createdCard(this).cardId);
  },
);

Then(
  'audit summary counters should show dynamic totals with semantic colors',
  async function (this: CustomWorld) {
    this.auditBrandingPage ??= new AuditBrandingPage(this.page);
    await this.auditBrandingPage.expectDynamicSummaryCountersAndColors();
  },
);

When('I delete the created card from Recent Submissions', async function (this: CustomWorld) {
  this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
  const { cardId, description } = createdCard(this);
  await this.dashboardSubmissionsPage.deletePendingApprovalCard(cardId, description);
});

Then('the created card should be removed successfully', async function (this: CustomWorld) {
  this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
  await this.dashboardSubmissionsPage.expectCardDeleted(createdCard(this).description);
});
