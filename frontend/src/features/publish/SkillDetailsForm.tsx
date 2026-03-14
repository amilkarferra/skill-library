import type { FormEvent } from 'react';
import { useState, useCallback, useMemo } from 'react';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import type { SlugPreview } from '../../shared/models/SlugPreview';
import { createSkill } from './publish.service';
import { useSlugPreview } from './useSlugPreview';
import { SimilarSkillsWarning } from './SimilarSkillsWarning';
import { FileBar } from './FileBar';
import { CatalogPreviewCard } from './CatalogPreviewCard';
import { CategoryChips } from '../../shared/components/CategoryChips';
import { TagsAutocomplete } from '../../shared/components/TagsAutocomplete';
import { MarkdownEditor } from '../../shared/components/MarkdownEditor';
import { CollaborationModeSelector } from '../../shared/components/CollaborationModeSelector';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { Button } from '../../shared/components/Button';
import { ApiError } from '../../shared/services/api.client';
import './SkillDetailsForm.css';

interface ExtractionResult {
  readonly name: string;
  readonly description: string;
  readonly isFailed: boolean;
}

interface SkillDetailsFormProps {
  readonly file: File;
  readonly extraction: ExtractionResult;
  readonly categories: readonly Category[];
  readonly availableTags: readonly Tag[];
  readonly onChangeFile: (file: File) => void;
  readonly onSubmitSuccess: (skillSlug: string) => void;
}

const MAX_DISPLAY_NAME = 150;
const MAX_SHORT_DESCRIPTION = 200;
const MAX_TAGS = 10;

export function SkillDetailsForm({
  file,
  extraction,
  categories,
  availableTags,
  onChangeFile,
  onSubmitSuccess,
}: SkillDetailsFormProps) {
  const [displayName, setDisplayName] = useState(extraction.name);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState(extraction.description);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [collaborationMode, setCollaborationMode] = useState<'closed' | 'open'>('open');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isDisplayNameExtracted, setIsDisplayNameExtracted] = useState(
    extraction.name.length > 0
  );
  const [isShortDescriptionExtracted, setIsShortDescExtracted] = useState(false);
  const [isLongDescriptionExtracted, setIsLongDescExtracted] = useState(
    extraction.description.length > 0
  );

  const { slugPreview, similarSkills, clearSlugState } = useSlugPreview(displayName);

  const categoryName = useMemo(() => {
    const matchesSelectedId = (category: Category): boolean =>
      category.id === selectedCategoryId;
    const category = categories.find(matchesSelectedId);
    return category?.name ?? '';
  }, [selectedCategoryId, categories]);

  const handleDisplayNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const truncatedValue = event.target.value.slice(0, MAX_DISPLAY_NAME);
      setDisplayName(truncatedValue);
      setIsDisplayNameExtracted(false);
      setSlugError(null);
      clearSlugState();
    }, [clearSlugState]
  );

  const handleShortDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const truncatedValue = event.target.value.slice(0, MAX_SHORT_DESCRIPTION);
      setShortDescription(truncatedValue);
      setIsShortDescExtracted(false);
    }, []
  );

  const handleLongDescriptionChange = useCallback((newValue: string) => {
    setLongDescription(newValue);
    setIsLongDescExtracted(false);
  }, []);

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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('displayName', displayName);
        formData.append('shortDescription', shortDescription);
        formData.append('longDescription', longDescription);
        formData.append('categoryId', String(selectedCategoryId));
        selectedTags.forEach(tag => formData.append('tags', tag));
        formData.append('collaborationMode', collaborationMode);

        const skill = await createSkill(formData);
        onSubmitSuccess(skill.name);
      } catch (error) {
        handlePublishError(error, slugPreview, setSlugError, setSubmitError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [file, displayName, shortDescription, longDescription, selectedCategoryId,
      selectedTags, collaborationMode, onSubmitSuccess, slugPreview]
  );

  const hasMissingCategory = selectedCategoryId === null;
  const isSubmitDisabled = isSubmitting || hasMissingCategory;
  const buttonText = isSubmitting ? 'Publishing...' : 'Publish skill';
  const isDisplayNameFieldExtracted = isDisplayNameExtracted && displayName.length > 0;
  const isShortDescriptionFieldExtracted = isShortDescriptionExtracted && shortDescription.length > 0;
  const isLongDescriptionFieldExtracted = isLongDescriptionExtracted && longDescription.length > 0;
  const displayNameFieldClass = buildFieldClassName(isDisplayNameFieldExtracted);
  const shortDescriptionFieldClass = buildFieldClassName(isShortDescriptionFieldExtracted);
  const longDescriptionFieldClass = buildFieldClassName(isLongDescriptionFieldExtracted);
  const hasSubmitError = submitError !== null;
  const hasSlugError = slugError !== null;

  return (
    <form className="skill-details-form" onSubmit={handleSubmit}>
      {extraction.isFailed && (
        <AlertMessage variant="warning">
          Could not extract metadata from file. Please fill in the details manually.
        </AlertMessage>
      )}

      {hasSubmitError && (
        <AlertMessage variant="error">
          {submitError}
        </AlertMessage>
      )}

      <FileBar
        fileName={file.name}
        fileSize={file.size}
        onChangeFile={onChangeFile}
      />

      <CatalogPreviewCard
        displayName={displayName}
        shortDescription={shortDescription}
        tags={selectedTags}
        categoryName={categoryName}
      />

      <div className="skill-details-divider" />

      <label className="skill-details-section-label">Skill details</label>

      <div className={displayNameFieldClass}>
        <div className="skill-details-field-wrapper">
          <label htmlFor="skill-display-name" className="skill-details-label">
            Display name
            <span className="skill-details-required">*</span>
          </label>
          <input
            id="skill-display-name"
            type="text"
            className="skill-details-input"
            value={displayName}
            onChange={handleDisplayNameChange}
            maxLength={MAX_DISPLAY_NAME}
            required
          />
          {isDisplayNameFieldExtracted && (
            <div className="skill-details-extracted-badge">Extracted</div>
          )}
        </div>
        <div className="skill-details-char-count">
          {displayName.length} / {MAX_DISPLAY_NAME}
        </div>
        {slugPreview !== null && (
          <div className="skill-details-slug-preview">
            skill-library.com/skills/<strong>{slugPreview.slug}</strong>
          </div>
        )}
        {hasSlugError && (
          <div className="skill-details-slug-error">
            <span>A skill with this name already exists.</span>
            <a
              className="skill-details-slug-error-link"
              href={`/skills/${slugError}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View existing skill
            </a>
            <span> or change the display name.</span>
          </div>
        )}
        <SimilarSkillsWarning skills={similarSkills} />
      </div>

      <div className={shortDescriptionFieldClass}>
        <div className="skill-details-field-wrapper">
          <label htmlFor="skill-short-description" className="skill-details-label">
            Short description
            <span className="skill-details-required">*</span>
          </label>
          <textarea
            id="skill-short-description"
            className="skill-details-input"
            rows={2}
            value={shortDescription}
            onChange={handleShortDescriptionChange}
            maxLength={MAX_SHORT_DESCRIPTION}
            required
          />
          {isShortDescriptionFieldExtracted && (
            <div className="skill-details-extracted-badge">Extracted</div>
          )}
        </div>
        <div className="skill-details-char-count">
          {shortDescription.length} / {MAX_SHORT_DESCRIPTION}
        </div>
      </div>

      <div className="skill-details-two-cols">
        <div className="skill-details-field">
          <label className="skill-details-label">
            Category
            <span className="skill-details-required">*</span>
          </label>
          <CategoryChips
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        <div className="skill-details-field">
          <label className="skill-details-label">
            Tags
            <span className="skill-details-optional">(optional)</span>
          </label>
          <TagsAutocomplete
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            availableTags={availableTags}
            maxTags={MAX_TAGS}
          />
        </div>
      </div>

      <div className={longDescriptionFieldClass}>
        <div className="skill-details-field-wrapper">
          <label className="skill-details-label">
            Long description
            <span className="skill-details-optional">(optional, markdown)</span>
          </label>
          <MarkdownEditor
            value={longDescription}
            onChange={handleLongDescriptionChange}
            placeholder="Describe your skill in detail (markdown supported)"
            rows={6}
          />
          {isLongDescriptionFieldExtracted && (
            <div className="skill-details-extracted-badge">Extracted</div>
          )}
        </div>
      </div>

      <div className="skill-details-field">
        <label className="skill-details-label">
          Collaboration mode
          <span className="skill-details-required">*</span>
        </label>
        <CollaborationModeSelector
          selectedMode={collaborationMode}
          onSelectMode={handleCollaborationModeChange}
        />
      </div>

      <div className="skill-details-actions">
        <Button
          variant="primary"
          size="large"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}

function buildFieldClassName(isExtracted: boolean): string {
  const base = 'skill-details-field';
  return isExtracted ? `${base} skill-details-auto-filled` : base;
}

const CONFLICT_STATUS_CODE = 409;
const GENERIC_API_ERROR_MESSAGE = 'Failed to publish skill. Please try again.';
const GENERIC_UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred.';

function handlePublishError(
  error: unknown,
  slugPreview: SlugPreview | null,
  setSlugError: (slug: string | null) => void,
  setSubmitError: (message: string | null) => void,
): void {
  const isApiError = error instanceof ApiError;
  if (!isApiError) {
    const isStandardError = error instanceof Error;
    const message = isStandardError ? error.message : GENERIC_UNKNOWN_ERROR_MESSAGE;
    setSubmitError(message);
    return;
  }

  const isConflict = error.statusCode === CONFLICT_STATUS_CODE;
  if (isConflict) {
    setSlugError(slugPreview?.slug ?? 'unknown');
    return;
  }

  const message = error.message || GENERIC_API_ERROR_MESSAGE;
  setSubmitError(message);
}
