import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Tag } from '../models/Tag';
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

export function TagsAutocomplete({
  selectedTags,
  onTagsChange,
  availableTags,
  maxTags,
}: TagsAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.currentTarget.value;
      setSearchQuery(newQuery);
      const hasQuery = newQuery.length > 0;
      setIsDropdownOpen(hasQuery);
    },
    []
  );

  const handleSuggestionSelect = useCallback(
    (tagName: string) => {
      onTagsChange([...selectedTags, tagName]);
      setSearchQuery('');
      setIsDropdownOpen(false);
      inputRef.current?.focus();
    },
    [selectedTags, onTagsChange]
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
    const hasSearchQuery = searchQuery.length > 0;
    if (hasSearchQuery) {
      setIsDropdownOpen(true);
    }
  }, [searchQuery]);

  const handleContainerBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isEnterWithSuggestions =
        event.key === 'Enter' && filteredSuggestions.length > 0;
      if (isEnterWithSuggestions) {
        event.preventDefault();
        handleSuggestionSelect(filteredSuggestions[0].name);
      }

      const isEscapeKey = event.key === 'Escape';
      if (isEscapeKey) {
        setIsDropdownOpen(false);
      }
    },
    [filteredSuggestions, handleSuggestionSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideContainer =
        containerRef.current &&
        !containerRef.current.contains(event.target as Node);
      if (isOutsideContainer) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return undefined;
  }, [isDropdownOpen]);

  const containerClassName = isFocused
    ? 'tags-autocomplete-container tags-autocomplete-container--focused'
    : 'tags-autocomplete-container';

  const placeholderText = isMaxTagsReached ? '' : 'Add tags...';
  const hasSuggestions = isDropdownOpen && filteredSuggestions.length > 0;

  return (
    <div className="tags-autocomplete-wrapper">
      <div
        ref={containerRef}
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
    </div>
  );
}
