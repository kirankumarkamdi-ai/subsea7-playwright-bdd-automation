Feature: Regression smoke test
  As a user
  I want to open the application homepage
  So that I can verify the basic page loads successfully

  Scenario: Open homepage
    Given I open the home page
    Then the page title should contain "Example"
