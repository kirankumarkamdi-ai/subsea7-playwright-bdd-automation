Feature: User Dashboard recent submissions
  As an authenticated user
  I want to verify the dashboard and inspect recent submissions
  So that I can confirm the dashboard is usable and find matching cards

  @dashboard @requires-auth
  Scenario: TC-DSH-01 - User Dashboard Header: Welcome Message, Date & New HSSEQ Card Button Verification
    Given an authenticated session is open on the user dashboard
    Then the dashboard greeting, live date, and new-card action should be correct

  @dashboard @requires-auth
  Scenario: TC-SUB-01 - Filter recent submissions and search by location
    Given an authenticated session is open on the user dashboard
    When I filter recent submissions by card type "Intervention" and status "Processing"
    And I search recent submissions by location "3rd Party Premises"
    Then the recent submissions grid should show matching results or a clean empty state

  @dashboard @requires-auth
  Scenario: TC-COL-01 - Customize Recent Submissions columns and preserve table layout
    Given an authenticated session is open on the user dashboard
    When I toggle off and restore the Date, Submitter, and Location columns
    Then the Recent Submissions table should preserve its rows, pagination, and horizontal scrolling
