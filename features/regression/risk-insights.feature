Feature: Risk Insights
  As an authenticated user
  I want to review risk metrics and AI-detected leading indicators
  So that I can understand incident trends and inspect their source data

  @risk @requires-auth
  Scenario: TC-RSK-01 - Verify risk summary metrics, counts, and color badging
    Given an authenticated session is open on the user dashboard
    When I click the "Risk Insights" sidebar module
    Then the module should open at route "/risk-insights" with heading "Risk Insights"
    And the risk summary cards should show the expected counts and severity colors

  @risk @requires-auth
  Scenario: TC-RSK-02 - Verify AI leading indicators and source data dialog
    Given an authenticated session is open on the user dashboard
    When I click the "Risk Insights" sidebar module
    Then the module should open at route "/risk-insights" with heading "Risk Insights"
    And all 7 AI detected leading indicators should show descriptions and severity badges
    When I open the source data for the first AI detected leading indicator
    Then the source data dialog should display the matching record
