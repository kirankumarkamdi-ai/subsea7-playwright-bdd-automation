import { Then, When } from '@cucumber/cucumber';
import { IngestionPage } from '../pages/ingestion-page';
import { CustomWorld } from '../support/world';

function ingestionPage(world: CustomWorld): IngestionPage {
  world.ingestionPage ??= new IngestionPage(world.page);
  return world.ingestionPage;
}

When('I open AI-assisted card creation', async function (this: CustomWorld) {
  await ingestionPage(this).openAiAssistedCreation();
});

When('I upload the sample HSSEQ observation card PDF', async function (this: CustomWorld) {
  await ingestionPage(this).uploadSampleObservationCard();
});

When('I select the sample PDF through the upload drop zone', async function (this: CustomWorld) {
  await ingestionPage(this).selectSamplePdfThroughDropZone();
});

Then('the card upload success confirmation should be displayed', async function (this: CustomWorld) {
  await ingestionPage(this).expectUploadSuccess();
});

When('I choose manual submission from new card creation', async function (this: CustomWorld) {
  await ingestionPage(this).chooseManualSubmission();
});

When(
  'I complete the required fields in the manual submission wizard',
  async function (this: CustomWorld) {
    await ingestionPage(this).completeManualObservationCard();
  },
);

When(
  'I complete the five-step manual submission and verify progress and data retention',
  async function (this: CustomWorld) {
    await ingestionPage(this).completeManualObservationCardWithProgressAndNavigation();
  },
);

Then(
  'the manual card submission confirmation should be displayed',
  async function (this: CustomWorld) {
    await ingestionPage(this).expectManualSubmissionSuccess();
  },
);

Then('the manual card submission should be confirmed', async function (this: CustomWorld) {
  await ingestionPage(this).expectManualSubmissionComplete();
});
