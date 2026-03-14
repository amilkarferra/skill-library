# Authentication (Azure AD + MSAL)

## 1.1 Login with Microsoft

```gherkin
Feature: User login via Azure AD
  As a visitor
  I want to sign in with my Microsoft account
  So that I can access authenticated features of Skill Library

  Scenario: Visitor sees the sign-in button on any page
    Given I am not logged in
    When I visit any page
    Then I see a "Sign in" button in the navigation bar

  Scenario: Successful first-time login via popup
    Given I am not logged in
    And I have never used Skill Library before
    When I click "Sign in"
    Then a Microsoft authentication popup appears
    When I authenticate with my Microsoft account
    Then the popup closes automatically
    And my profile is automatically created from my Microsoft account information
    And I remain on the same page I was browsing
    And I see my profile icon in the navigation bar

  Scenario: Successful returning login via popup
    Given I have used Skill Library before
    When I click "Sign in"
    Then a Microsoft authentication popup appears
    When I authenticate with my Microsoft account
    Then the popup closes automatically
    And I remain on the same page I was browsing

  Scenario: Sign-in button shows loading state during authentication
    Given I am not logged in
    When I click "Sign in"
    Then the sign-in button shows a loading spinner
    And the button is disabled until authentication completes

  Scenario: Login rejected for deactivated account
    Given my Skill Library account has been deactivated
    When I sign in with my Microsoft account
    Then the system rejects the login indicating the account is deactivated
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

  Scenario: Session expired shows reconnect banner
    Given I am logged in
    And my session has expired due to prolonged inactivity
    When the platform detects the expired session
    Then I see a banner indicating my session has expired
    And I see a "Reconnect" button in the banner

  Scenario: Reconnecting after session expiration
    Given I see the session expired banner
    When I click the "Reconnect" button
    Then my session is restored without losing my current page
    And the session expired banner disappears

  Scenario: Reconnect fails
    Given I see the session expired banner
    When I click the "Reconnect" button
    And the reconnection cannot be completed
    Then I see an error message indicating I need to sign in again

  Scenario: Logging out via popup
    Given I am logged in
    When I click the logout button
    Then the logout button shows a loading spinner
    And a Microsoft sign-out popup appears
    When I select the account to sign out of
    Then the popup closes automatically
    And I am logged out and redirected to the catalog as a visitor

  Scenario: Logout button remains in loading state while popup is open
    Given I am logged in
    When I click the logout button
    Then the logout button shows a loading spinner
    And the button is disabled until the sign-out popup closes
```
