@regression
Feature: HSSEQ card ingestion and submission
  As an authenticated user
  I want to upload a card for AI extraction or submit one manually
  So that observation cards enter the application workflow

  @ingestion @requires-auth
  Scenario: TC-ING-01 - Upload a PDF for AI-assisted card ingestion
    Given an authenticated session is open on the user dashboard
    When I open AI-assisted card creation
    And I upload the sample HSSEQ observation card PDF
    Then the card upload success confirmation should be displayed

  @ai @requires-auth
  Scenario: TC-AI-01 - Select a PDF through the AI-assisted upload zone
    Given an authenticated session is open on the user dashboard
    When I click the "AI-Assisted Submission" sidebar module
    And I select the sample PDF through the upload drop zone
    Then the card upload success confirmation should be displayed

  @ingestion @requires-auth
  Scenario: TC-ING-02 - Complete the mandatory fields in a manual observation card
    Given an authenticated session is open on the user dashboard
    When I choose manual submission from new card creation
    And I complete the required fields in the manual submission wizard
    Then the manual card submission confirmation should be displayed

  @manual @requires-auth
  Scenario: TC-MAN-01 - Complete and navigate the manual submission wizard
    Given an authenticated session is open on the user dashboard
    When I reset the dashboard Synergi filters
    And I choose manual submission from new card creation
    And I complete the five-step manual submission and verify progress and data retention
    Then the manual card submission should be confirmed
