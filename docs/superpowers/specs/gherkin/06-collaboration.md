# Collaboration

## 6.1 Owner Invites Collaborator

```gherkin
Feature: Owner inviting a collaborator
  As a skill owner
  I want to invite other users to collaborate on my skill
  So that they can upload new versions

  Background:
    Given I am logged in
    And I own a published skill

  Scenario: Searching for a user to invite
    When I navigate to manage collaborators for my skill
    And I search for a user by username
    Then I see matching users in the search results

  Scenario: Sending an invitation
    When I select a user from the search results
    And I send an invitation
    Then the invitation is created with pending status
    And I see a confirmation message

  Scenario: Cannot invite an existing collaborator
    Given a user is already a collaborator on my skill
    When I try to invite that user
    Then the system indicates the user is already a collaborator

  Scenario: Cannot invite myself
    When I try to invite myself
    Then the system prevents this action
```

## 6.2 User Requests Collaboration

```gherkin
Feature: User requesting to collaborate
  As a registered user
  I want to request to become a collaborator on a skill
  So that I can contribute new versions

  Background:
    Given I am logged in
    And a published skill exists that I do not own

  Scenario: Sending a collaboration request
    Given I am not a collaborator and have no pending request
    When I request to collaborate from the skill detail page
    Then my request is created with pending status
    And I see a confirmation that my request was sent

  Scenario: Cannot request again while one is pending
    Given I already have a pending collaboration request for this skill
    When I view the skill detail page
    Then the request collaboration button indicates a request is already pending
```

## 6.3 Accept and Reject Invitations and Requests

```gherkin
Feature: Responding to collaboration invitations and requests
  As a user involved in a collaboration invitation or request
  I want to accept or reject it
  So that collaborations are established by mutual agreement

  Scenario: User accepts an invitation from an owner
    Given I am logged in
    And a skill owner has sent me a collaboration invitation
    When I accept the invitation
    Then I become a collaborator on that skill
    And I can upload new versions

  Scenario: User rejects an invitation from an owner
    Given I am logged in
    And a skill owner has sent me a collaboration invitation
    When I reject the invitation
    Then I do not become a collaborator
    And the invitation is marked as rejected

  Scenario: Owner accepts a collaboration request from a user
    Given I am logged in as a skill owner
    And a user has requested to collaborate on my skill
    When I accept the request
    Then the requesting user becomes a collaborator
    And the request is marked as accepted

  Scenario: Owner rejects a collaboration request
    Given I am logged in as a skill owner
    And a user has requested to collaborate on my skill
    When I reject the request
    Then the user does not become a collaborator
    And the request is marked as rejected
```

## 6.4 Cancel Request and Remove Collaborator

```gherkin
Feature: Cancelling requests and removing collaborators
  As a user or skill owner
  I want to cancel pending requests or remove collaborators
  So that I can manage collaboration relationships

  Scenario: User cancels their own pending request
    Given I am logged in
    And I have a pending collaboration request
    When I cancel my request
    Then the request is removed
    And I can send a new request later

  Scenario: Owner removes a collaborator
    Given I am logged in as a skill owner
    And a user is a collaborator on my skill
    When I remove that collaborator
    Then they are no longer a collaborator
    And they can no longer upload versions to my skill

  Scenario: Collaborator removes themselves
    Given I am logged in
    And I am a collaborator on a skill
    When I remove myself from the collaboration
    Then I am no longer a collaborator on that skill
```

## 6.5 Collaboration Modes

```gherkin
Feature: Collaboration modes
  As a skill owner
  I want to choose between open and closed collaboration
  So that I can control how others contribute to my skill

  Scenario: Closed mode restricts version uploads to collaborators
    Given a skill has closed collaboration mode
    And I am a registered user who is not a collaborator
    When I view the skill detail page
    Then I do not see an option to upload or propose a version

  Scenario: Open mode allows any user to propose a version
    Given a skill has open collaboration mode
    And I am a registered user who is not a collaborator
    When I view the skill detail page
    Then I see an option to propose a new version

  Scenario: Owner can change collaboration mode
    Given I am the owner of a skill
    When I edit the skill metadata and change the collaboration mode
    And I save the changes
    Then the collaboration mode is updated
```
