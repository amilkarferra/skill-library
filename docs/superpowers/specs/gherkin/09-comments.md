# Comments

## 9.1 Comment Management

```gherkin
Feature: Commenting on skills
  As a registered user
  I want to comment on skills
  So that I can share feedback and questions with the community

  Background:
    Given I am logged in
    And a published active skill exists
    And I am on the comments tab of the skill detail page

  Scenario: Creating a comment
    When I type a comment and submit it
    Then my comment appears in the comments list
    And the total comments count increases

  Scenario: Viewing existing comments
    Given the skill has comments from multiple users
    Then I see the comments ordered by date
    And each comment shows the author name, date, and content

  Scenario: Editing my own comment
    Given I have previously posted a comment
    When I edit my comment with new content
    And I save the edit
    Then the comment is updated with the new content

  Scenario: Deleting my own comment
    Given I have previously posted a comment
    When I delete my comment
    Then the comment is removed from the list
    And the total comments count decreases

  Scenario: Skill owner can delete any comment
    Given I am the owner of this skill
    And another user has posted a comment
    When I delete that comment
    Then the comment is removed from the list

  Scenario: Non-author non-owner cannot delete a comment
    Given another user has posted a comment
    And I am not the skill owner
    Then I do not see a delete option on their comment
```

## 9.2 Comment Validation and Edge Cases

```gherkin
Feature: Comment validation and restrictions
  As a user
  I want clear feedback when comments cannot be posted
  So that I understand the platform rules

  Scenario: Comment cannot exceed maximum length
    Given I am logged in
    And I am on the comments tab of a skill
    When I try to submit a comment longer than 2000 characters
    Then the system rejects indicating the comment exceeds the maximum length

  Scenario: Anonymous user sees readonly comment form
    Given I am not logged in
    And I am on the comments tab of a skill
    Then I see the comment form with a "Sign in to leave a comment..." placeholder
    And the textarea is readonly
    When I click on the textarea
    Then I am prompted to sign in via a confirmation dialog

  Scenario: Anonymous user is prompted to sign in when submitting
    Given I am not logged in
    And I am on the comments tab of a skill
    When I click the post comment button
    Then I am prompted to sign in via a confirmation dialog

  Scenario: Cannot comment on an inactive skill
    Given a skill has been deactivated
    When I try to access the skill to comment
    Then I see a not found message

  Scenario: Comment pagination
    Given a skill has more comments than fit on a single page
    When I am on the comments tab
    Then I see pagination controls
    And I can navigate between pages of comments
```
