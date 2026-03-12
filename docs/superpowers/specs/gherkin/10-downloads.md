# Downloads

## 10.1 Download Behavior

```gherkin
Feature: Downloading skills
  As a visitor or registered user
  I want to download skills in various contexts
  So that I can use them in my workflow

  Scenario: Anonymous user downloads the latest version
    Given I am not logged in
    And a published skill exists
    When I click the download button on the skill detail page
    Then the skill file starts downloading

  Scenario: Logged-in user downloads the latest version
    Given I am logged in
    And a published skill exists
    When I click the download button on the skill detail page
    Then the skill file starts downloading

  Scenario: Downloading a specific older version
    Given a skill has multiple published versions
    When I navigate to the versions tab
    And I click download on a specific version
    Then that version's file starts downloading

  Scenario: Download counter increments after download
    Given a skill shows a download count
    When I download the skill
    Then the download count visible on the skill increases

  Scenario: Downloading an inactive skill is not possible
    Given a skill has been deactivated
    When I try to access the download for that skill
    Then I see a not found message
    And the file does not download
```
