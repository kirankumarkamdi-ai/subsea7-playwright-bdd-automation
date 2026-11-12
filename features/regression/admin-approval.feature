Feature: Admin approval and governance
  As a sys_admin
  I want to create, validate, and approve a card
  So that its validation is recorded

  @admin @requires-auth
  Scenario: Manually submit and approve a new card
    Given a sys_admin authenticated session has been configured
    When I submit a card with the manual entry form
    And I open the new card in the validation queue and complete review
    And I validate and approve the card data
    Then the new card should show status "approved" in My History
