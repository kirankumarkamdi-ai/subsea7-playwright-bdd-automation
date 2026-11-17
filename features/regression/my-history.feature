Feature: My History search and card details
  As an authenticated user
  I want to search and manage submitted HSSEQ cards
  So that I can review my submission history

  @history @requires-auth
  Scenario: TC-HIS-01 - Search My History by location and filter by card type and status
    Given an authenticated session is open on the user dashboard
    When I open My History
    And I search My History by location "3rd Party Premises"
    Then the My History results should match the location search and show a record count
    When I filter My History by card type "Observation" and status "Pending Approval"
    Then the selected My History filters and record count should be displayed

  @history @requires-auth
  Scenario: TC-HIS-02 - Inspect card details, print, delete confirmation, and modal dismissal
    Given an authenticated session is open on the user dashboard
    When I open My History
    And I open a pending-approval card from My History
    Then the card details should expose Print View and Delete actions
    When I open and close the card print view
    And I open and cancel the delete confirmation
    Then the card details should remain open and the card should not be deleted
    When I close the card details
    Then the My History submission list should be visible
