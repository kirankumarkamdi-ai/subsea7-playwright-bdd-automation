@regression
Feature: My History search and card details
  As an authenticated user
  I want to search and manage submitted HSSEQ cards
  So that I can review my submission history

  @history-my @requires-auth
  Scenario: TC-HIS-01 - Search My History by location and filter by card type and status
    Given an authenticated session is open on the user dashboard
    When I open My History
    And I search My History by location "3rd Party Premises"
    Then the My History results should match the location search and show a record count
    When I filter My History by card type "Observation" and status "Pending Approval"
    Then the selected My History filters and record count should be displayed

  @history-my @requires-auth @TC-HIS-02
  Scenario: TC-HIS-02 - Close card details and delete a pending-approval card
    Given an authenticated session is open on the user dashboard
    When I open My History
    And I open a pending-approval card from My History
    Then the card details should expose the Delete action without Print View
    When I close the card details
    Then the My History submission list should be visible
    When I open a pending-approval card from My History
    And I confirm deleting the card from My History
    Then the card should be deleted successfully
