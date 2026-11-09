Feature: Homepage regression
  As a visitor
  I want to open the website homepage
  So that I can verify the site is available

  @smoke
  Scenario: Homepage loads with its expected heading
    Given I open the home page
    Then the page title should contain "Example Domain"
    And I should see the heading "Example Domain"
