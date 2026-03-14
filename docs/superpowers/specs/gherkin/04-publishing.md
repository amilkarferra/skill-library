# Publishing

## 4.1 Create New Skill

```gherkin
Feature: Publishing a new skill
  As a registered user
  I want to publish a skill to the library
  So that other developers can discover and use it

  Background:
    Given I am logged in
    And I am on the publish skill page

  Scenario: User sees the publish form
    Then I see fields for display name, short description, long description, category, tags, and collaboration mode
    And I see a file upload area

  Scenario: Successful skill publication
    When I fill in all required fields
    And I upload a valid skill file
    And I submit the form
    Then the skill is published and visible in the catalog
    And I am redirected to the new skill's detail page

  Scenario: Frontmatter auto-extraction from uploaded file
    When I upload a skill file that contains frontmatter with name and description
    Then the display name and short description fields are pre-filled with the extracted values
    And I can modify the pre-filled values before submitting

  Scenario Outline: Publish form validation
    When I submit the form with <condition>
    Then the system rejects the submission indicating <reason>

    Examples:
      | condition                                     | reason                                      |
      | no file attached                              | a skill file is required                     |
      | an empty display name                         | the display name is required                 |
      | an empty short description                    | the short description is required            |
      | no category selected                          | a category is required                       |
      | a short description longer than 200 characters| the short description exceeds the limit      |
      | more than 10 tags                             | no more than 10 tags are allowed             |
      | a file larger than 50 MB                      | the file exceeds the maximum allowed size    |
      | a file that is not .skill or .md              | only .skill or .md files are accepted        |

  Scenario: Anonymous user cannot access publish page
    Given I am not logged in
    When I try to navigate to the publish skill page
    Then I am redirected to the login page
```

## 4.4 Quick Publish

```gherkin
Feature: Quick publishing a skill via drag and drop
  As a registered user
  I want to quickly start publishing by dropping a file onto the sidebar
  So that I can skip navigating to the publish page manually

  Background:
    Given I am logged in

  Scenario: Quick publish dropzone is visible in the sidebar
    Given I am on the catalog page
    Then I see a "Quick Publish" dropzone in the sidebar

  Scenario: Quick publish dropzone is visible on other pages
    Given I am on a page with the navigation sidebar
    And I am not already on the publish page
    Then I see a "Quick Publish" dropzone in the sidebar

  Scenario: Quick publish dropzone is hidden on the publish page
    Given I am on the publish skill page
    Then I do not see the "Quick Publish" dropzone in the sidebar

  Scenario: Dropping a valid file on the quick publish dropzone
    Given I am on the catalog page
    When I drop a valid .zip or .md file onto the quick publish dropzone
    Then I am navigated to the publish page with the file pre-loaded
    And the frontmatter extraction runs automatically on the pre-loaded file

  Scenario: Dropping an invalid file on the quick publish dropzone
    Given I am on the catalog page
    When I drop a file that is not .zip or .md onto the quick publish dropzone
    Then I see an error message in the dropzone indicating the file type is not accepted

  Scenario: Quick publish dropzone is not visible for anonymous users
    Given I am not logged in
    And I am on the catalog page
    Then I do not see the "Quick Publish" dropzone in the sidebar
```

## 4.2 Edit Skill Metadata

```gherkin
Feature: Editing skill metadata
  As a skill owner
  I want to edit my skill's metadata
  So that I can keep its information up to date

  Background:
    Given I am logged in
    And I own a published skill

  Scenario: Owner opens the edit form
    When I navigate to edit my skill
    Then I see the form pre-filled with the current metadata

  Scenario: Successful metadata update
    When I modify the display name and short description
    And I save the changes
    Then the skill metadata is updated
    And I see a confirmation message

  Scenario: Non-owner cannot edit skill metadata
    Given I am logged in as a user who does not own this skill
    When I try to access the edit form for this skill
    Then the system denies access
```

## 4.3 Deactivate and Restore Skill

```gherkin
Feature: Deactivating and restoring a skill
  As a skill owner
  I want to deactivate or restore my skill
  So that I can control its visibility in the catalog

  Background:
    Given I am logged in
    And I own a skill

  Scenario: Deactivating a skill
    Given my skill is active
    When I deactivate the skill
    Then the skill is no longer visible in the catalog
    And the skill appears as inactive in my panel

  Scenario: Restoring a deactivated skill
    Given my skill is inactive
    When I restore the skill
    Then the skill becomes visible again in the catalog
    And the skill appears as active in my panel

  Scenario: Deactivated skill returns not found to visitors
    Given my skill is inactive
    When a visitor tries to access the skill detail page
    Then they see a not found message
```
