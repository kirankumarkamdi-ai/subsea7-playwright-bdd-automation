Feature: Operational Dashboard
  As an authenticated manager
  I want to inspect recent submission volume
  So that I can monitor ingestion channels

  @ops @requires-auth
  Scenario: TC-OPS-01 - Verify the last seven days submission volume chart
    Given an authenticated session is open on the user dashboard
    When I click the "Admin Dashboard" sidebar module
    Then the seven-day submission volume chart should show both ingestion channels
