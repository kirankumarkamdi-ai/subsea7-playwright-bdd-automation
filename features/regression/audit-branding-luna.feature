@audit-branding-luna
Feature: Application audit access, branding, and Luna7
  As an authenticated user
  I want to verify application access, branding, and safety assistance
  So that core application features are available and usable

  @audit @requires-auth @workstream-admin
  Scenario: TC-AUD-01 - Verify Audit Log is available for workstream admin
    Given an authenticated session is open on the user dashboard
    When I click the "Audit Logs" sidebar module
    Then the Audit Logs page should be available

  @branding @requires-auth
  Scenario: TC-GBL-01 - Verify sidebar logo color and user profile initials
    Given an authenticated session is open on the user dashboard
    Then the sidebar should show the red Subsea7 logo and the signed-in user's initials

  @luna @requires-auth
  Scenario: TC-LUN-01 - Send a safety query to Luna7 and verify message bubbles
    Given an authenticated session is open on the user dashboard
    When I click the "Luna7 Safety Agent" sidebar module
    And I send Luna7 a safety query
    Then Luna7 should display a distinct user message and safety response
