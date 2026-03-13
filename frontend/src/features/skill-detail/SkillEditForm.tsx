import type { FormEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { CategoryChips } from '../../shared/components/CategoryChips';
import { TagsAutocomplete } from '../../shared/components/TagsAutocomplete';
import { MarkdownEditor } from '../../shared/components/MarkdownEditor';
import { CollaborationModeSelector } from '../../shared/components/CollaborationModeSelector';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { Button } from '../../shared/components/Button';
import { SkillEditSkeleton } from './SkillEditSkeleton';
import { ApiError } from '../../shared/services/api.client';
import {
  updateSkillMetadata,
  fetchEditFormCategories,
  fetchEditFormPopularTags,
} from './skill-detail.service';
import type { Skill } from '../../shared/models/Skill';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import './SkillEditForm.css';

interface SkillEditFormProps {
  readonly skill: Skill;
  readonly onSaveSuccess: (updatedSkill: Skill) => void;
  readonly onCancel: () => void;
}

const MAX_DISPLAY_NAME = 150;
const MAX_SHORT_DESCRIPTION = 200;
const MAX_TAGS = 10;
const CONFLICT_STATUS_CODE = 409;
const DUPLICATE_NAME_MESSAGE =
  'A skill with this name already exists. Please choose a different name.';
const FALLBACK_API_ERROR_MESSAGE =
  'Failed to save changes. Please try again.';
const FALLBACK_UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred.';

export function SkillEditForm({
  skill,
  onSaveSuccess,
  onCancel,
}: SkillEditFormProps) {
  const [displayName, setDisplayName] = useState(skill.displayName);
  const [shortDescription, setShortDescription] = useState(
    skill.shortDescription
  );
  const [longDescription, setLongDescription] = useState(
    skill.longDescription
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    skill.categoryId
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    [...skill.tags]
  );
  const [collaborationMode, setCollaborationMode] = useState<
    'closed' | 'open'
  >(skill.collaborationMode);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    loadFormReferenceData();
  }, []);

  const handleDisplayNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const truncatedValue = event.target.value.slice(0, MAX_DISPLAY_NAME);
      setDisplayName(truncatedValue);
      setSlugError(null);
    },
    []
  );

  const handleShortDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const truncatedValue = event.target.value.slice(
        0,
        MAX_SHORT_DESCRIPTION
      );
      setShortDescription(truncatedValue);
    },
    []
  );

  const handleLongDescriptionChange = useCallback(
    (newValue: string) => {
      setLongDescription(newValue);
    },
    []
  );

  const handleCategorySelect = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleCollaborationModeChange = useCallback(
    (mode: 'closed' | 'open') => {
      setCollaborationMode(mode);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);
      setSlugError(null);

      try {
        const updatedSkill = await updateSkillMetadata(skill.name, {
          displayName,
          shortDescription,
          longDescription,
          categoryId: selectedCategoryId,
          tags: selectedTags,
          collaborationMode,
        });
        onSaveSuccess(updatedSkill);
      } catch (error) {
        handleEditSaveError(error, setSlugError, setSubmitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      skill.name,
      displayName,
      shortDescription,
      longDescription,
      selectedCategoryId,
      selectedTags,
      collaborationMode,
      onSaveSuccess,
    ]
  );

  async function loadFormReferenceData(): Promise<void> {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        fetchEditFormCategories(),
        fetchEditFormPopularTags(),
      ]);
      setCategories(categoriesData);
      setAvailableTags(tagsData);
    } catch {
      setSubmitError('Failed to load form data. Please try again.');
    } finally {
      setIsLoadingFormData(false);
    }
  }

  if (isLoadingFormData) {
    return <SkillEditSkeleton />;
  }

  const hasSubmitError = submitError !== null;
  const hasSlugError = slugError !== null;
  const isSubmitDisabled = isSubmitting;
  const saveButtonText = isSubmitting ? 'Saving...' : 'Save changes';

  return (
    <form className="skill-edit-form" onSubmit={handleSubmit}>
      <h2 className="skill-edit-form-title">Edit skill</h2>

      {hasSubmitError && (
        <AlertMessage variant="error">{submitError}</AlertMessage>
      )}

      <div className="skill-edit-field">
        <label htmlFor="edit-display-name" className="skill-edit-label">
          Display name
          <span className="skill-edit-required">*</span>
        </label>
        <input
          id="edit-display-name"
          type="text"
          className="skill-edit-input"
          value={displayName}
          onChange={handleDisplayNameChange}
          maxLength={MAX_DISPLAY_NAME}
          required
        />
        <div className="skill-edit-char-count">
          {displayName.length} / {MAX_DISPLAY_NAME}
        </div>
        {hasSlugError && (
          <div className="skill-edit-slug-error">{slugError}</div>
        )}
      </div>

      <div className="skill-edit-field">
        <label
          htmlFor="edit-short-description"
          className="skill-edit-label"
        >
          Short description
          <span className="skill-edit-required">*</span>
        </label>
        <textarea
          id="edit-short-description"
          className="skill-edit-input"
          rows={2}
          value={shortDescription}
          onChange={handleShortDescriptionChange}
          maxLength={MAX_SHORT_DESCRIPTION}
          required
        />
        <div className="skill-edit-char-count">
          {shortDescription.length} / {MAX_SHORT_DESCRIPTION}
        </div>
      </div>

      <div className="skill-edit-two-cols">
        <div className="skill-edit-field">
          <label className="skill-edit-label">
            Category
            <span className="skill-edit-required">*</span>
          </label>
          <CategoryChips
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        <div className="skill-edit-field">
          <label className="skill-edit-label">
            Tags
            <span className="skill-edit-optional">(optional)</span>
          </label>
          <TagsAutocomplete
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            availableTags={availableTags}
            maxTags={MAX_TAGS}
          />
        </div>
      </div>

      <div className="skill-edit-field">
        <label className="skill-edit-label">
          Long description
          <span className="skill-edit-optional">
            (optional, markdown)
          </span>
        </label>
        <MarkdownEditor
          value={longDescription}
          onChange={handleLongDescriptionChange}
          placeholder="Describe your skill in detail (markdown supported)"
          rows={6}
        />
      </div>

      <div className="skill-edit-field">
        <label className="skill-edit-label">Collaboration mode</label>
        <CollaborationModeSelector
          selectedMode={collaborationMode}
          onSelectMode={handleCollaborationModeChange}
        />
      </div>

      <div className="skill-edit-actions">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {saveButtonText}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function handleEditSaveError(
  error: unknown,
  setSlugError: (message: string | null) => void,
  setSubmitError: (message: string | null) => void
): void {
  const isApiError = error instanceof ApiError;
  if (!isApiError) {
    const isStandardError = error instanceof Error;
    const message = isStandardError
      ? error.message
      : FALLBACK_UNKNOWN_ERROR_MESSAGE;
    setSubmitError(message);
    return;
  }

  const isConflict = error.statusCode === CONFLICT_STATUS_CODE;
  if (isConflict) {
    setSlugError(DUPLICATE_NAME_MESSAGE);
    return;
  }

  const message = error.message || FALLBACK_API_ERROR_MESSAGE;
  setSubmitError(message);
}
