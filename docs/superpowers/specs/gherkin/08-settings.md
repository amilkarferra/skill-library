# Settings

## 8.1 Edit Display Name

```gherkin
Feature: Editing display name
  As a registered user
  I want to change my display name
  So that other users see my preferred name

  Background:
    Given I am logged in
    And I navigate to the settings page

  Scenario: Successfully updating display name
    When I change my display name to a new value
    And I save the changes
    Then my display name is updated across the platform
    And I see a confirmation message

  Scenario: Display name cannot be empty
    When I clear the display name field and save
    Then the system rejects indicating the display name is required
```

## 8.2 Deactivate Account

```gherkin
Feature: Deactivating my account
  As a registered user
  I want to deactivate my account
  So that my profile and contributions are hidden from the platform

  Background:
    Given I am logged in
    And I navigate to the settings page

  Scenario: Deactivating my account
    When I choose to deactivate my account
    And I confirm the deactivation
    Then my account is deactivated
    And I am logged out
    And I can no longer log in until the account is reactivated

  Scenario: Cancelling deactivation
    When I choose to deactivate my account
    And I cancel the confirmation
    Then my account remains active
```
