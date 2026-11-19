import { Then } from '@cucumber/cucumber';
import { AnalyticsAccessRestrictionsPage } from '../pages/analytics-access-restrictions-page';
import { CustomWorld } from '../support/world';

function accessRestrictionsPage(world: CustomWorld): AnalyticsAccessRestrictionsPage {
  world.analyticsAccessRestrictionsPage ??= new AnalyticsAccessRestrictionsPage(world.page);
  return world.analyticsAccessRestrictionsPage;
}

Then(
  'the Analytics user should be restricted from AI-assisted PDF submission',
  async function (this: CustomWorld) {
    await accessRestrictionsPage(this).expectAiSubmissionRestricted();
  },
);

Then(
  'the Analytics user should be restricted from active-card validation and decisions',
  async function (this: CustomWorld) {
    await accessRestrictionsPage(this).expectValidationRestricted();
  },
);

Then(
  'the Analytics user should not be able to delete or reopen a closed card',
  async function (this: CustomWorld) {
    await accessRestrictionsPage(this).expectClosedCardActionsRestricted();
  },
);

Then(
  'the Analytics user should be restricted from Audit Logs',
  async function (this: CustomWorld) {
    await accessRestrictionsPage(this).expectAuditLogRestricted();
  },
);
