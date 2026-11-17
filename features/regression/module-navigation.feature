Feature: Module navigation
  As an authenticated user
  I want to navigate between application modules
  So that each sidebar icon opens its corresponding page

  @navigation @requires-auth
  Scenario: TC-NAV-01 - Navigate to every sidebar module
    Given an authenticated session is open on the user dashboard
    When I click the "User Dashboard" sidebar module
    Then the module should open at route "/" with heading "Recent Submissions"
    When I click the "Manual Submission" sidebar module
    Then the module should open at route "/submit" with heading "Manual Submission"
    When I click the "AI-Assisted Submission" sidebar module
    Then the module should open at route "/ai-submit" with heading "AI-Assisted Submission"
    When I click the "My History" sidebar module
    Then the module should open at route "/history" with heading "My History"
    When I click the "Admin Dashboard" sidebar module
    Then the module should open at route "/dashboard" with heading "Operational Dashboard"
    When I click the "Luna7 Safety Agent" sidebar module
    Then the module should open at route "/ai-agent" with heading "Luna7"
    When I click the "Validation Queue" sidebar module
    Then the module should open at route "/validation" with heading "Validation Queue"
    When I click the "Risk Insights" sidebar module
    Then the module should open at route "/risk-insights" with heading "Risk Insights"
    When I click the "Data Search" sidebar module
    Then the module should open at route "/data-search" with heading "Data Search"
    When I click the "Audit Logs" sidebar module
    Then the module should open at route "/audit-logs" with heading "Audit Logs"

  @navigation @requires-auth
  Scenario: TC-NAV-02 - Verify Validation Queue notification badge and pending count
    Given an authenticated session is open on the user dashboard
    When I click the "Validation Queue" sidebar module
    Then the Validation Queue sidebar badge should show "21006" and match the pending queue count
