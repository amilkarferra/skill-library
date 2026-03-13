import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Tag } from '../models/Tag';
import {
  findSimilarTag,
  isTagAlreadySelected,
} from './TagsAutocomplete.logic';
import './TagsAutocomplete.css';

interface TagsAutocompleteProps {
  readonly selectedTags: readonly string[];
  readonly onTagsChange: (tags: string[]) => void;
  readonly availableTags: readonly Tag[];
  readonly maxTags: number;
}

interface TagChipProps {
  readonly tagName: string;
  readonly onRemove: (tagName: string) => void;
}

interface SuggestionItemProps {
  readonly suggestion: Tag;
  readonly onSelect: (tagName: string) => void;
}

interface SimilarityConfirmation {
  readonly inputValue: string;
  readonly matchedTagName: string;
}

const COMMA_KEY = ',';

function TagChip({ tagName, onRemove }: TagChipProps) {
  const handleRemoveClick = useCallback(() => {
    onRemove(tagName);
  }, [onRemove, tagName]);

  return (
    <div className="tags-autocomplete-chip">
      {tagName}
      <button
        type="button"
        className="tags-autocomplete-chip-remove"
        onClick={handleRemoveClick}
        aria-label={`Remove ${tagName} tag`}
      >
        x
      </button>
    </div>
  );
}

function SuggestionItem({ suggestion, onSelect }: SuggestionItemProps) {
  const handleClick = useCallback(() => {
    onSelect(suggestion.name);
  }, [onSelect, suggestion.name]);

  return (
    <div
      className="tags-autocomplete-suggestion"
      onClick={handleClick}
      role="option"
      aria-selected="false"
    >
      {suggestion.name}
    </div>
  );
}

interface SimilarityPromptProps {
  readonly inputValue: string;
  readonly matchedTagName: string;
  readonly onUseExisting: () => void;
  readonly onCreateNew: () => void;
}

function SimilarityPrompt({
  inputValue,
  matchedTagName,
  onUseExisting,
  onCreateNew,
}: SimilarityPromptProps) {
  return (
    <div className="tags-autocomplete-similarity">
      <span className="tags-autocomplete-similarity-text">
        Did you mean <strong>{matchedTagName}</strong> instead
        of <strong>{inputValue}</strong>?
      </span>
      <div className="tags-autocomplete-similarity-actions">
        <button
          type="button"
          className="tags-autocomplete-similarity-button tags-autocomplete-similarity-button--use"
          onClick={onUseExisting}
        >
          Use "{matchedTagName}"
        </button>
        <button
          type="button"
          className="tags-autocomplete-similarity-button tags-autocomplete-similarity-button--create"
          onClick={onCreateNew}
        >
          Create "{inputValue}"
        </button>
      </div>
    </div>
  );
}

export function TagsAutocomplete({
  selectedTags,
  onTagsChange,
  availableTags,
  maxTags,
}: TagsAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [similarityConfirmation, setSimilarityConfirmation] =
    useState<SimilarityConfirmation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allExistingTagNames = useMemo(() => {
    return availableTags.map((tag) => tag.name);
  }, [availableTags]);

  const filteredSuggestions = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const selectedSet = new Set(selectedTags);

    return availableTags.filter(
      (tag) =>
        !selectedSet.has(tag.name) &&
        tag.name.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, selectedTags, availableTags]);

  const isMaxTagsReached = selectedTags.length >= maxTags;

  const addTag = useCallback(
    (tagName: string) => {
      const isDuplicate = isTagAlreadySelected(tagName, selectedTags);
      if (isDuplicate) return;

      onTagsChange([...selectedTags, tagName]);
      setSearchQuery('');
      setIsDropdownOpen(false);
      setSimilarityConfirmation(null);
      inputRef.current?.focus();
    },
    [selectedTags, onTagsChange]
  );

  const attemptCreateFreeTag = useCallback(
    (rawInput: string) => {
      const trimmedInput = rawInput.trim();
      const hasNoInput = trimmedInput.length === 0;
      if (hasNoInput) return;

      const isDuplicate = isTagAlreadySelected(trimmedInput, selectedTags);
      if (isDuplicate) {
        setSearchQuery('');
        return;
      }

      const similarityResult = findSimilarTag(
        trimmedInput,
        allExistingTagNames
      );

      const shouldUseExistingSilently =
        similarityResult.action === 'use-existing';
      if (shouldUseExistingSilently) {
        addTag(similarityResult.matchedTagName!);
        return;
      }

      const shouldConfirmSimilar =
        similarityResult.action === 'confirm-similar';
      if (shouldConfirmSimilar) {
        setSimilarityConfirmation({
          inputValue: trimmedInput,
          matchedTagName: similarityResult.matchedTagName!,
        });
        setIsDropdownOpen(false);
        return;
      }

      addTag(trimmedInput);
    },
    [selectedTags, allExistingTagNames, addTag]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.currentTarget.value;
      const containsComma = rawValue.includes(COMMA_KEY);

      if (containsComma) {
        const valueBeforeComma = rawValue.split(COMMA_KEY)[0];
        attemptCreateFreeTag(valueBeforeComma);
        return;
      }

      setSearchQuery(rawValue);
      setSimilarityConfirmation(null);
      setIsDropdownOpen(true);
    },
    [attemptCreateFreeTag]
  );

  const handleSuggestionSelect = useCallback(
    (tagName: string) => {
      addTag(tagName);
    },
    [addTag]
  );

  const handleChipRemove = useCallback(
    (tagToRemove: string) => {
      const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
      onTagsChange(updatedTags);
    },
    [selectedTags, onTagsChange]
  );

  const handleContainerFocus = useCallback(() => {
    setIsFocused(true);
    setIsDropdownOpen(true);
  }, []);

  const handleContainerBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isEnterKey = event.key === 'Enter';
      if (isEnterKey) {
        event.preventDefault();
        const hasSuggestions = filteredSuggestions.length > 0;
        if (hasSuggestions) {
          handleSuggestionSelect(filteredSuggestions[0].name);
          return;
        }
        attemptCreateFreeTag(searchQuery);
        return;
      }

      const isEscapeKey = event.key === 'Escape';
      if (isEscapeKey) {
        setIsDropdownOpen(false);
        setSimilarityConfirmation(null);
      }
    },
    [filteredSuggestions, handleSuggestionSelect, attemptCreateFreeTag,
      searchQuery]
  );

  const handleUseExistingTag = useCallback(() => {
    const hasConfirmation = similarityConfirmation !== null;
    if (hasConfirmation) {
      addTag(similarityConfirmation.matchedTagName);
    }
  }, [similarityConfirmation, addTag]);

  const handleCreateNewTag = useCallback(() => {
    const hasConfirmation = similarityConfirmation !== null;
    if (hasConfirmation) {
      addTag(similarityConfirmation.inputValue);
    }
  }, [similarityConfirmation, addTag]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideContainer =
        containerRef.current &&
        !containerRef.current.contains(event.target as Node);
      if (isOutsideContainer) {
        setIsDropdownOpen(false);
        setSimilarityConfirmation(null);
      }
    };

    const shouldListenForClicks = isDropdownOpen
      || similarityConfirmation !== null;
    if (shouldListenForClicks) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return undefined;
  }, [isDropdownOpen, similarityConfirmation]);

  const containerClassName = isFocused
    ? 'tags-autocomplete-container tags-autocomplete-container--focused'
    : 'tags-autocomplete-container';

  const placeholderText = isMaxTagsReached ? '' : 'Type and press Enter or comma to add tags...';
  const hasSuggestions = isDropdownOpen && filteredSuggestions.length > 0;
  const hasSimilarityConfirmation = similarityConfirmation !== null;

  return (
    <div className="tags-autocomplete-wrapper" ref={containerRef}>
      <div
        className={containerClassName}
        onFocus={handleContainerFocus}
        onBlur={handleContainerBlur}
      >
        {selectedTags.map((tagName) => (
          <TagChip
            key={tagName}
            tagName={tagName}
            onRemove={handleChipRemove}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          className="tags-autocomplete-input"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={isMaxTagsReached}
          placeholder={placeholderText}
          autoComplete="off"
        />
        <span className="tags-autocomplete-counter">
          {selectedTags.length}/{maxTags}
        </span>
      </div>

      {hasSuggestions && (
        <div className="tags-autocomplete-dropdown">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.name}
              suggestion={suggestion}
              onSelect={handleSuggestionSelect}
            />
          ))}
        </div>
      )}

      {hasSimilarityConfirmation && (
        <SimilarityPrompt
          inputValue={similarityConfirmation.inputValue}
          matchedTagName={similarityConfirmation.matchedTagName}
          onUseExisting={handleUseExistingTag}
          onCreateNew={handleCreateNewTag}
        />
      )}
    </div>
  );
}
