@regression @sys-admin @requires-auth
Feature: System administrator audit and card governance
  As a system administrator
  I want to inspect audit activity and remove a submitted card
  So that system activity and card governance are verified

  @audit2
  Scenario: TC-AUD-02 - Search audit activity for a newly submitted card
    Given an authenticated session is open on the user dashboard
    When I create a manual card for the system-admin checks
    And I click the "Audit Logs" sidebar module
    And I search audit logs for the created card
    Then the audit log should show the created card with all required activity fields

  @audit
  Scenario: TC-AUD-03 - Verify dynamic audit summary counters and semantic colors
    Given an authenticated session is open on the user dashboard
    When I click the "Audit Logs" sidebar module
    Then audit summary counters should show dynamic totals with semantic colors

  @delete
  Scenario: TC-DEL-01 - Delete a newly submitted card from Recent Submissions
    Given an authenticated session is open on the user dashboard
    When I create a manual card for the system-admin checks
    And I delete the created card from Recent Submissions
    Then the created card should be removed successfully
