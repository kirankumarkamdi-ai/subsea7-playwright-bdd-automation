@regression @analytics @access-control @requires-auth
Feature: Analytics user access restrictions
  As an Analytics user
  I should only access capabilities assigned to my role
  So that privileged card and audit operations remain restricted

  @ai-upload
  Scenario: TC-ANL-ACL-01 - Restrict AI-assisted PDF submission
    Given an authenticated Analytics user session is open on the dashboard
    Then the Analytics user should be restricted from AI-assisted PDF submission

  @validation
  Scenario: TC-ANL-ACL-02 - Restrict active-card validation and decisions
    Given an authenticated Analytics user session is open on the dashboard
    Then the Analytics user should be restricted from active-card validation and decisions

  @card-actions
  Scenario: TC-ANL-ACL-03 - Restrict deleting and reopening closed cards
    Given an authenticated Analytics user session is open on the dashboard
    Then the Analytics user should not be able to delete or reopen a closed card

  @audit
  Scenario: TC-ANL-ACL-04 - Restrict Audit Logs access
    Given an authenticated Analytics user session is open on the dashboard
    Then the Analytics user should be restricted from Audit Logs
