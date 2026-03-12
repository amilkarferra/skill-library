# My Panel

## 7.1 My Skills

```gherkin
Feature: Managing my skills
  As a skill owner
  I want to see and manage all my published skills
  So that I can keep track of my contributions

  Background:
    Given I am logged in
    And I navigate to the My Skills section of my panel

  Scenario: Viewing my skills list
    Given I have published skills
    Then I see a table with each skill's name, status, current version, likes count, downloads count, collaboration mode, and pending proposal count
    And I see action buttons for each skill

  Scenario: No skills published yet
    Given I have not published any skills
    Then I see an empty state message encouraging me to publish my first skill

  Scenario: Distinguishing active and inactive skills
    Given I have both active and inactive skills
    Then active skills show an active status indicator
    And inactive skills show an inactive status indicator

  Scenario Outline: Performing actions on my skills
    Given I have a published skill
    When I click the <action> action on a skill
    Then <result>

    Examples:
      | action       | result                                              |
      | edit         | I am taken to the edit metadata form                |
      | versions     | I am taken to the version management view           |
      | collaborators| I am taken to the collaborator management view      |
      | deactivate   | the skill is deactivated and marked as inactive     |
      | restore      | the previously inactive skill is restored to active |
```

## 7.2 My Collaborations

```gherkin
Feature: Viewing my collaborations
  As a collaborator
  I want to see all skills where I collaborate
  So that I can easily access and contribute to them

  Background:
    Given I am logged in
    And I navigate to the My Collaborations section of my panel

  Scenario: Viewing collaborations list
    Given I am a collaborator on one or more skills
    Then I see a list of skills where I collaborate
    And each entry shows the skill name, owner, and my role

  Scenario: No collaborations
    Given I am not a collaborator on any skill
    Then I see an empty state message
```

## 7.3 My Likes

```gherkin
Feature: Viewing my liked skills
  As a registered user
  I want to see all skills I have liked
  So that I can quickly return to skills I found useful

  Background:
    Given I am logged in
    And I navigate to the My Likes section of my panel

  Scenario: Viewing liked skills
    Given I have liked some skills
    Then I see a list of skills I have liked

  Scenario: No liked skills
    Given I have not liked any skills
    Then I see an empty state message
```

## 7.4 Collaboration Requests

```gherkin
Feature: Managing collaboration requests
  As a user
  I want to see my incoming and sent collaboration requests
  So that I can respond to them or track their status

  Background:
    Given I am logged in
    And I navigate to the Requests section of my panel

  Scenario: Viewing incoming requests as a skill owner
    Given another user has requested to collaborate on my skill
    Then I see the incoming request with the requester's name and skill name
    And the incoming request is visually distinguished with a highlighted border
    And I see accept and reject buttons

  Scenario: Viewing sent requests
    Given I have sent a collaboration request
    Then I see my sent request with the skill name and current status
    And the sent request is visually distinguished with a neutral border
    And I see a cancel button if the request is still pending

  Scenario: Incoming invitations from owners
    Given a skill owner has invited me to collaborate
    Then I see the invitation in my requests section
    And I see accept and reject buttons

  Scenario: No pending requests
    Given I have no collaboration requests
    Then I see an empty state message
```

## 7.5 Proposed Versions

```gherkin
Feature: Reviewing proposed versions
  As a skill owner
  I want to see and review pending version proposals
  So that I can decide which community contributions to publish

  Background:
    Given I am logged in
    And I own a skill with open collaboration mode
    And I navigate to the Proposed Versions section of my panel

  Scenario: Viewing pending proposals
    Given users have proposed new versions for my skill
    Then I see a list of pending proposals with proposer name, version number, changelog, and submission date
    And I see approve and reject buttons for each proposal

  Scenario: No pending proposals
    Given no users have proposed versions for my skills
    Then I see an empty state message
```

## 7.6 Notifications

```gherkin
Feature: Notifications for pending actions
  As a user with pending collaboration requests or version proposals
  I want to be notified visually
  So that I do not miss important actions requiring my attention

  Scenario: Notification badge on profile icon
    Given I am logged in
    And I have pending collaboration requests or version proposals
    Then I see a notification indicator on my profile icon in the navigation bar

  Scenario: Notification banner with pending count
    Given I am logged in
    And I have pending items
    Then I see a notification banner below the navigation bar
    And the banner shows the count of pending items
    And the banner has a link to review them

  Scenario: Notification banner is dismissible
    Given the notification banner is visible
    When I dismiss the banner
    Then the banner is hidden

  Scenario: No notifications when nothing is pending
    Given I am logged in
    And I have no pending items
    Then I do not see a notification badge or banner
```
