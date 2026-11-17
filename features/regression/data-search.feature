Feature: Data Search and export
  As an authenticated user
  I want to search and filter historical cards
  So that I can inspect and export matching records

  @data-search @requires-auth
  Scenario: TC-SRC-01 - Verify Synergi global filters and dynamic data scope
    Given an authenticated session is open on the user dashboard
    When I click the "Data Search" sidebar module
    Then the Data Search module should show all Synergi global filters
    When I set the Synergi global filters to their default scopes and client "ABB"
    Then selecting client "ABB" should filter the historical results

  @data-search @requires-auth
  Scenario: TC-SRC-02 - Verify location search, table filters, and result count
    Given an authenticated session is open on the user dashboard
    When I click the "Data Search" sidebar module
    And I search Data Search by location "mumbai"
    And I configure the Data Search table filters
    Then the Data Search record count should match the displayed results

  @data-search @requires-auth
  Scenario: TC-SRC-03 - Export Data Search results to Excel
    Given an authenticated session is open on the user dashboard
    When I click the "Data Search" sidebar module
    When I open the Excel export for client "ABB"
    Then the export modal should show the filtered record count and actions
    When I cancel and then generate the Excel export
    Then an Excel file should be downloaded successfully

  @data-search @requires-auth
  Scenario: TC-SRC-04 - Verify card type and status options and color-coded badges
    Given an authenticated session is open on the user dashboard
    When I click the "Data Search" sidebar module
    Then the Card Type and Status filters should list their available options
    And visible status badges should use the expected colors