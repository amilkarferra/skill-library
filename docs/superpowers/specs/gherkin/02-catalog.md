# Catalog / Browsing

## 2.1 Browsing Skills

```gherkin
Feature: Browsing the skill catalog
  As a visitor
  I want to browse available skills
  So that I can discover useful skills for my workflow

  Background:
    Given I am on the catalog page

  Scenario: Visitor sees the catalog layout
    Then I see a sidebar with categories, sort options, and popular tags
    And each category shows the number of skills it contains
    And I see a list of skills in the main area
    And each skill row shows the name, short description, author, category, likes count, and downloads count

  Scenario: Catalog with no skills available
    Given no skills have been published
    Then I see an empty state message indicating no skills are available yet

  Scenario: Catalog with published skills
    Given there are published skills in the platform
    Then I see a paginated list of skills
    And I see pagination controls to navigate between pages

  Scenario: Expanding a skill row to see details
    Given there are published skills in the list
    When I click on a skill row to expand it
    Then I see the full description, tags, collaboration mode, and collaborator count for that skill
    And I see action buttons relevant to my role

  Scenario: Authenticated user sees role badge on their skills
    Given I am logged in
    And I own or collaborate on published skills
    Then each skill where I have a role shows a badge indicating whether I am the owner or a collaborator

  Scenario: Collapsing an expanded skill row
    Given I have expanded a skill row
    When I click on the same skill row again
    Then the expanded details are hidden
```

## 2.2 Search and Filtering

```gherkin
Feature: Searching and filtering skills
  As a visitor
  I want to search and filter skills by various criteria
  So that I can quickly find what I need

  Background:
    Given I am on the catalog page
    And there are published skills in the platform

  Scenario: Search by free text
    When I type a search term in the search box
    Then the skill list updates to show only skills matching the search term in name, description, or tags

  Scenario: Filter by category
    When I select a category from the sidebar
    Then the skill list updates to show only skills in that category

  Scenario: Filter by tag
    When I click on a tag in the popular tags section
    Then the skill list updates to show only skills with that tag

  Scenario: Filter by multiple tags
    When I select multiple tags
    Then the skill list updates to show only skills that have all selected tags

  Scenario: Filter by author
    When I search by a specific author username
    Then the skill list updates to show only skills published by that author

  Scenario: Filter by author via URL parameter
    When I navigate to the catalog with an author parameter in the URL
    Then the skill list is pre-filtered to show only skills by that author

  Scenario: Clear all filters
    Given I have applied some filters
    When I clear all filters
    Then the full unfiltered skill list is shown again

  Scenario Outline: Sort skills by different criteria
    When I select sort by <sort_option>
    Then the skill list is reordered by <expected_order>

    Examples:
      | sort_option      | expected_order                        |
      | newest           | most recently published first         |
      | most likes       | highest number of likes first         |
      | most downloads   | highest number of downloads first     |
      | name             | alphabetical order ascending          |

  Scenario: Combining search, filter, and sort
    When I type a search term
    And I select a category filter
    And I select a sort option
    Then the skill list reflects all three criteria simultaneously
```

## 2.3 Pagination

```gherkin
Feature: Catalog pagination
  As a visitor
  I want to navigate through pages of skills
  So that I can browse large amounts of content

  Background:
    Given I am on the catalog page
    And there are more skills than fit on a single page

  Scenario: Navigating to the next page
    When I click on the next page button
    Then I see the next set of skills
    And the pagination indicator reflects my current page

  Scenario: Navigating to the previous page
    Given I am on the second page of results
    When I click on the previous page button
    Then I see the first set of skills

  Scenario: Pagination resets when filters change
    Given I am on the third page of results
    When I apply a new filter
    Then the results show the first page matching the new filter
```

## 2.4 Download from Catalog

```gherkin
Feature: Downloading a skill from the catalog
  As a visitor
  I want to download a skill directly from the catalog
  So that I can start using it without needing an account

  Scenario: Download from expanded row
    Given I am on the catalog page
    And I have expanded a skill row
    When I click the download button
    Then the skill file starts downloading
```
