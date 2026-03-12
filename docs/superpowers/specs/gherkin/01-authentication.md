# Authentication (Azure AD + MSAL)

## 1.1 Login with Microsoft

```gherkin
Feature: User login via Azure AD
  As a visitor
  I want to sign in with my Microsoft account
  So that I can access authenticated features of Skill Library

  Scenario: Visitor sees the sign-in button
    Given I am not logged in
    When I navigate to the login page
    Then I see a "Sign in with Microsoft" button

  Scenario: Successful first-time login
    Given I am not logged in
    And I have never used Skill Library before
    When I click "Sign in with Microsoft"
    And I authenticate with my Microsoft account
    Then my profile is automatically created from my Microsoft account information
    And I am redirected to the catalog
    And I see my profile icon in the navigation bar

  Scenario: Successful returning login
    Given I have used Skill Library before
    When I click "Sign in with Microsoft"
    And I authenticate with my Microsoft account
    Then I am logged in and redirected to the catalog

  Scenario: Login rejected for deactivated account
    Given my Skill Library account has been deactivated
    When I sign in with my Microsoft account
    Then the system rejects the login indicating the account is deactivated

  Scenario: First login allows optional username selection
    Given I am signing in for the first time
    When my profile is created
    Then my username defaults to my email prefix
    And I can optionally change my username before continuing
```

## 1.2 Session Management

```gherkin
Feature: Session management
  As a logged-in user
  I want my session to stay active while I use the platform
  So that I do not lose my work unexpectedly

  Scenario: Session remains active during normal use
    Given I am logged in
    When I continue using the platform within the session duration
    Then my session is automatically renewed without interruption

  Scenario: Session expires after prolonged inactivity
    Given I am logged in
    And I have been inactive beyond the session duration
    When I try to perform an action that requires authentication
    Then I am redirected to the login page
    And I see a message indicating my session has expired

  Scenario: Logging out
    Given I am logged in
    When I click the logout option
    Then I am logged out and redirected to the catalog as a visitor
```
