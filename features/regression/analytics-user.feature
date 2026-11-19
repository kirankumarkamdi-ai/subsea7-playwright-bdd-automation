@regression @analytics @requires-auth
Feature: Analytics user workflows
  As an authenticated Analytics user
  I want to review the dashboard, history, safety guidance, and analytics data
  So that I can verify the features available to my role

  @manual-submission
  Scenario: TC-ANL-02 - Complete the five-step manual submission
    Given an authenticated Analytics user session is open on the dashboard
    When I click the "Manual Submission" sidebar module
    Then the module should open at route "/submit" with heading "Manual Submission"
    And I complete the five-step manual submission and verify progress and data retention
    Then the manual card submission should be confirmed

  @history
  Scenario: TC-ANL-03 - Search My History and use the available filters
    Given an authenticated Analytics user session is open on the dashboard
    When I open My History
    And I search My History by location "3rd Party Premises"
    Then the My History results should match the location search and show a record count
    When I filter My History by card type "Observation" and status "Pending Approval"
    Then the selected My History filters and record count should be displayed

  @luna
  Scenario: TC-ANL-04 - Ask Luna7 a safety question and verify message styling
    Given an authenticated Analytics user session is open on the dashboard
    When I click the "Luna7 Safety Agent" sidebar module
    And I send Luna7 a safety query
    Then Luna7 should display a distinct user message and safety response

  @risk
  Scenario: TC-ANL-05 - Verify Risk Insights metrics and severity colors
    Given an authenticated Analytics user session is open on the dashboard
    When I click the "Risk Insights" sidebar module
    Then the module should open at route "/risk-insights" with heading "Risk Insights"
    And the risk summary cards should show the expected counts and severity colors

  @data-search
  Scenario: TC-ANL-06 - Cancel and generate an Excel export from Data Search
    Given an authenticated Analytics user session is open on the dashboard
    When I click the "Data Search" sidebar module
    And I open the Excel export for client "ABB"
    Then the export modal should show the filtered record count and actions
    When I cancel and then generate the Excel export
    Then an Excel file should be downloaded successfully
