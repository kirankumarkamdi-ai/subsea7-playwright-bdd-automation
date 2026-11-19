@regression @standard @requires-auth
Feature: Standard user workflows
  As an authenticated Standard user
  I want to review the dashboard, history, safety guidance, and analytics data
  So that I can verify the features available to my role

  @manual-submission
  Scenario: TC-STD-02 - Complete the five-step manual submission
    Given an authenticated Analytics user session is open on the dashboard
    When I click the "Manual Submission" sidebar module
    Then the module should open at route "/submit" with heading "Manual Submission"
    And I complete the five-step manual submission and verify progress and data retention
    Then the manual card submission should be confirmed

  @history
  Scenario: TC-STD-03 - Search My History and use the available filters
    Given an authenticated Analytics user session is open on the dashboard
    When I open My History
    And I search My History by location "3rd Party Premises"
    Then the My History results should match the location search and show a record count
    When I filter My History by card type "Observation" and status "Pending Approval"
    Then the selected My History filters and record count should be displayed
