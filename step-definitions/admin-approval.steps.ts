import { Given, Then, When } from '@cucumber/cucumber';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AdminApprovalPage } from '../pages/admin-approval-page';
import { CustomWorld } from '../support/world';

Given('a worksite_admin authenticated session has been configured', function (this: CustomWorld) {
  const authStatePath = resolve('playwright/.auth/user.json');
  if (!existsSync(authStatePath)) {
    throw new Error(
      'No saved browser session was found. Run `npm run auth:setup` and sign in as worksite_admin before this scenario.',
    );
  }
  this.adminApprovalPage = new AdminApprovalPage(this.page);
});

When('I submit a card with the manual entry form', async function (this: CustomWorld) {
  await this.adminApprovalPage.submitManualCard();
});

When(
  'I open the new card in the validation queue and complete review',
  async function (this: CustomWorld) {
    await this.adminApprovalPage.openCreatedCardForReview();
  },
);

When('I validate and approve the card data', async function (this: CustomWorld) {
  await this.adminApprovalPage.validateAndApprove();
});

Then(
  'the new card should show status {string} in My History',
  async function (this: CustomWorld, status: string) {
    await this.adminApprovalPage.expectStatusInMyHistory(status);
  },
);
