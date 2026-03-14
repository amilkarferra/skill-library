# Skill Detail

## 3.1 Skill Overview

```gherkin
Feature: Viewing skill details
  As a visitor
  I want to view the full details of a skill
  So that I can evaluate it before downloading

  Scenario: Visitor views the skill detail page
    Given a published skill exists
    When I navigate to the skill detail page
    Then I see the skill name, author, category, and tags
    And I see the rendered overview content
    And I see the download button, likes count, and downloads count in the sidebar

  Scenario: Viewing a skill that does not exist
    When I navigate to a skill URL that does not exist
    Then I see a not found message

  Scenario: Viewing a deactivated skill
    When I navigate to a skill that has been deactivated
    Then I see a not found message
```

## 3.2 Skill Detail Tabs

```gherkin
Feature: Skill detail tabs
  As a visitor
  I want to navigate between overview, versions, and comments
  So that I can see all information about a skill

  Background:
    Given a published skill exists
    And I am on the skill detail page

  Scenario: Default tab is overview
    Then the overview tab is selected by default
    And I see the rendered skill content

  Scenario: Switching to versions tab
    When I click on the versions tab
    Then I see the version history with changelog entries and download links per version

  Scenario: Switching to comments tab
    When I click on the comments tab
    Then I see the list of comments for this skill

  Scenario: Switching to collaborators tab
    When I click on the collaborators tab
    Then I see the list of collaborators for this skill
    And the tab label shows the number of collaborators
```

## 3.3 Download from Detail

```gherkin
Feature: Downloading a skill from the detail page
  As a visitor
  I want to download the latest or a specific version of a skill
  So that I can use the version I need

  Background:
    Given a published skill exists with multiple versions
    And I am on the skill detail page

  Scenario: Download the latest version
    When I click the main download button
    Then the latest version of the skill file starts downloading

  Scenario: Download a specific version
    When I navigate to the versions tab
    And I click the download button next to a specific version
    Then that specific version of the skill file starts downloading

  Scenario: Download counter is visible
    Then I see the total download count for the skill in the sidebar
```

## 3.4 Like and Unlike

```gherkin
Feature: Liking and unliking a skill
  As a registered user
  I want to like or unlike a skill
  So that I can show appreciation and bookmark skills I find useful

  Background:
    Given I am logged in
    And a published skill exists
    And I am on the skill detail page

  Scenario: Liking a skill
    Given I have not liked this skill
    When I click the like button
    Then the skill is marked as liked
    And the likes count increases by one

  Scenario: Unliking a skill
    Given I have already liked this skill
    When I click the like button again
    Then the like is removed
    And the likes count decreases by one

  Scenario: Anonymous user cannot like
    Given I am not logged in
    When I try to like a skill
    Then I am prompted to log in
```

## 3.5 Request Collaboration

```gherkin
Feature: Requesting collaboration from skill detail
  As a registered user
  I want to request to collaborate on a skill
  So that I can contribute new versions

  Background:
    Given I am logged in
    And a published skill exists that I do not own
    And I am on the skill detail page

  Scenario: Requesting collaboration
    Given I am not already a collaborator on this skill
    And I have no pending request for this skill
    When I click the request collaboration button
    Then a collaboration request is sent to the skill owner
    And I see a confirmation that my request is pending

  Scenario: Request button not shown for owners
    Given I am the owner of this skill
    Then I do not see the request collaboration button

  Scenario: Request button not shown for existing collaborators
    Given I am already a collaborator on this skill
    Then I do not see the request collaboration button

  Scenario: Anonymous user is prompted to sign in when requesting collaboration
    Given I am not logged in
    And a published skill with open collaboration exists
    And I am on the skill detail page
    When I click the request collaboration button
    Then I am prompted to sign in via a confirmation dialog
```

## 3.6 Role-Based Actions on Detail

```gherkin
Feature: Role-based actions on skill detail
  As a user with a specific role
  I want to see only the actions available to me
  So that the interface reflects what I can do

  Scenario: Anonymous visitor sees public actions only
    Given I am not logged in
    And I am on a skill detail page
    Then I see the download button
    And I do not see edit, delete, or collaboration management options

  Scenario: Logged-in user who is not the owner
    Given I am logged in
    And I am viewing a skill I do not own
    Then I see the download button, like button, and request collaboration button
    And I do not see edit or delete options

  Scenario: Owner sees full management actions
    Given I am logged in
    And I am viewing a skill I own
    Then I see the download button, edit button, and management options
    And I do not see the request collaboration button

  Scenario: Collaborator sees upload version action
    Given I am logged in
    And I am a collaborator on this skill
    Then I see the option to upload a new version
    And I do not see edit metadata or delete options

  Scenario: Owner deletes a skill from the detail page
    Given I am logged in
    And I am viewing a skill I own
    When I click the delete button
    Then I see a confirmation dialog asking if I am sure
    And the dialog indicates the skill will be deactivated

  Scenario: Owner confirms skill deletion
    Given I see the delete confirmation dialog
    When I confirm the deletion
    Then the skill is deactivated
    And I am redirected to the catalog
```
