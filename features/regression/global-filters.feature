@regression
Feature: Synergi global filters
  As an authenticated user
  I want to filter dashboard data by global scope
  So that the dashboard counters and recent submissions reflect my selection

  @filters @requires-auth
  Scenario: TC-FLT-01 - Select options across all Synergi global filters
    Given an authenticated session is open on the user dashboard
    When I select the following global filters:
      | Country  | Australia             |
      | Shore    | Onshore               |
      | Worksite | 3rd Party Premises    |
      | Client   | ABB                   |
      | Project  | Admarine              |
    Then the dashboard should show the selected filters and refreshed results
