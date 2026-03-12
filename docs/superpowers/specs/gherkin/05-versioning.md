# Versioning

## 5.1 Upload New Version

```gherkin
Feature: Uploading a new version of a skill
  As a skill owner or collaborator
  I want to upload a new version
  So that users can access the latest improvements

  Background:
    Given I am logged in
    And a published skill exists

  Scenario: Owner uploads a new version
    Given I am the owner of the skill
    When I navigate to the new version form
    And I fill in the version number and changelog
    And I upload a valid skill file
    And I submit the form
    Then the new version is published immediately
    And the skill's current version is updated in the catalog

  Scenario: Collaborator uploads a new version
    Given I am a collaborator on the skill
    When I upload a new version with version number, changelog, and file
    Then the new version is published immediately

  Scenario: Version number must follow semantic versioning
    Given I am the owner of the skill
    When I enter a version number that is not valid semver
    And I submit the form
    Then the system rejects indicating the version number must follow semantic versioning

  Scenario: Duplicate version number rejected
    Given I am the owner of the skill
    And version "1.0.0" already exists
    When I try to upload another version "1.0.0"
    Then the system rejects indicating this version number already exists

  Scenario: Changelog is required
    Given I am the owner of the skill
    When I submit a new version without a changelog
    Then the system rejects indicating the changelog is required
```

## 5.2 Propose Version (Open Mode)

```gherkin
Feature: Proposing a version for open collaboration skills
  As a registered user
  I want to propose a version for a skill in open collaboration mode
  So that I can contribute even without being a collaborator

  Background:
    Given I am logged in
    And a skill exists with open collaboration mode
    And I am not the owner or a collaborator of this skill

  Scenario: Proposing a new version
    When I navigate to the skill detail page
    And I submit a version proposal with version number, changelog, and file
    Then my proposal is submitted for review
    And I see a message indicating the proposal is pending owner approval

  Scenario: Cannot propose on closed collaboration skills
    Given a skill exists with closed collaboration mode
    And I am not the owner or a collaborator
    When I view the skill detail page
    Then I do not see the option to propose a version
```

## 5.3 Review Proposed Versions

```gherkin
Feature: Reviewing proposed versions
  As a skill owner
  I want to review version proposals from the community
  So that I can maintain quality control over my skill

  Background:
    Given I am logged in
    And I own a skill with open collaboration mode
    And a user has proposed a new version

  Scenario: Owner sees pending proposals
    When I navigate to the proposed versions section in my panel
    Then I see the list of pending proposals with proposer name, version number, and changelog

  Scenario: Approving a proposed version
    When I approve a proposed version
    Then the version is published and visible in the version history
    And the skill's current version is updated

  Scenario: Rejecting a proposed version
    When I reject a proposed version
    Then the version is not published
    And the proposal is marked as rejected
```

## 5.4 Version History

```gherkin
Feature: Viewing version history
  As a visitor
  I want to see the version history of a skill
  So that I can track its evolution and download any version

  Scenario: Viewing version history
    Given a skill exists with multiple published versions
    When I navigate to the versions tab on the skill detail page
    Then I see all published versions listed with version number, changelog, date, and uploader
    And each version has a download button

  Scenario: Version history does not show rejected proposals
    Given a skill has a rejected version proposal
    When I view the version history
    Then I do not see the rejected proposal in the list
```
