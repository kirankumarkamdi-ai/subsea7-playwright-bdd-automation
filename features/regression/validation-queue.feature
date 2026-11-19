@regression
Feature: Validation queue
  As an authenticated user
  I want to inspect and filter cards awaiting validation
  So that I can monitor and open cards for review

  @validation @requires-auth @TC-VAL-01
  Scenario: TC-VAL-01 - Verify validation queue counters and filter interactivity
    Given an authenticated session is open on the user dashboard
    When I click the "Validation Queue" sidebar module
    Then the validation queue summary cards should show numeric counters, status colors, and icons
    And every validation queue filter should open its options

  @validation @requires-auth @TC-VAL-02
  Scenario: TC-VAL-02 - Filter validation queue by card type and source
    Given an authenticated session is open on the user dashboard
    When I click the "Validation Queue" sidebar module
    And I filter validation cards by card type "Observation" and source "Handwritten"
    Then every visible validation row should match card type "Observation" and source "Handwritten"

  @validation @requires-auth
  Scenario: TC-VAL-03 - Open a pending card from the validation queue
    Given an authenticated session is open on the user dashboard
    When I click the "Validation Queue" sidebar module
    And I open the first pending card from the validation queue
    Then the selected card details and verification controls should be displayed
