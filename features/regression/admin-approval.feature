Feature: Admin card validation and governance
  As a worksite_admin
  I want to create, review, approve, or reject a card
  So that its final status is recorded

  @admin @requires-auth @approval
  Scenario: TC-ADM-01 Manually submit and approve a new card
    Given a worksite_admin authenticated session has been configured
    When I submit a card with the manual entry form
    And I open the new card in the validation queue and complete review
    And I validate and approve the card data
    Then the new card should show status "approved" in My History

  @admin @requires-auth @rejection
  Scenario: TC-ADM-02 - Reject a pending card with mandatory reason logging
    Given a worksite_admin authenticated session has been configured
    When I submit a card with the manual entry form
    And I open the new card in the validation queue and complete review
    And I reject the new card using the configured reason
    Then the new card should show status "rejected" in My History
