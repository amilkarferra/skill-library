import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { createSkill, fetchCategories, extractFrontmatter } from './publish.service';
import type { Category } from '../../shared/models/Category';
import './SkillForm.css';

const MAX_SHORT_DESCRIPTION = 200;
const MAX_TAGS = 10;

export function SkillForm() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const displayNameRef = useRef(displayName);
  displayNameRef.current = displayName;
  const shortDescriptionRef = useRef(shortDescription);
  shortDescriptionRef.current = shortDescription;
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [collaborationMode, setCollaborationMode] = useState<'closed' | 'open'>('closed');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingFrontmatter, setIsExtractingFrontmatter] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categoriesLoadError, setCategoriesLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      try {
        const loadedCategories = await fetchCategories();
        setCategories(loadedCategories);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to load categories';
        setCategoriesLoadError(errorMessage);
      }
    };
    loadCategories();
  }, []);

  const shortDescriptionCount = shortDescription.length;

  const parsedTags = useMemo(() => {
    const hasInput = tagsInput.trim().length > 0;
    if (!hasInput) return [];
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, MAX_TAGS);
  }, [tagsInput]);

  const handleDisplayNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayName(event.target.value);
    }, []
  );

  const handleShortDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const isWithinLimit = event.target.value.length <= MAX_SHORT_DESCRIPTION;
      if (isWithinLimit) {
        setShortDescription(event.target.value);
      }
    }, []
  );

  const handleLongDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLongDescription(event.target.value);
    }, []
  );

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCategoryId(event.target.value);
    }, []
  );

  const handleTagsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTagsInput(event.target.value);
    }, []
  );

  const handleCollabClosed = useCallback(() => {
    setCollaborationMode('closed');
  }, []);

  const handleCollabOpen = useCallback(() => {
    setCollaborationMode('open');
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsExtractingFrontmatter(true);

    try {
      const frontmatter = await extractFrontmatter(file);
      const hasExtractedName = frontmatter.extractedName.length > 0;
      const hasExtractedDescription = frontmatter.extractedDescription.length > 0;
      const isDisplayNameEmpty = displayNameRef.current.trim().length === 0;
      const isShortDescriptionEmpty = shortDescriptionRef.current.trim().length === 0;

      if (hasExtractedName && isDisplayNameEmpty) {
        setDisplayName(frontmatter.extractedName);
      }
      if (hasExtractedDescription && isShortDescriptionEmpty) {
        setShortDescription(frontmatter.extractedDescription);
      }
    } catch {
      setSubmitError('Could not extract metadata from file');
    } finally {
      setIsExtractingFrontmatter(false);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('displayName', displayName);
    formData.append('shortDescription', shortDescription);
    formData.append('longDescription', longDescription);
    formData.append('categoryId', categoryId);
    formData.append('collaborationMode', collaborationMode);
    parsedTags.forEach((tag) => formData.append('tags', tag));

    const hasFile = selectedFile !== null;
    if (hasFile) {
      formData.append('file', selectedFile);
    }

    try {
      const skill = await createSkill(formData);
      navigate(`/skills/${skill.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to publish skill';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    displayName, shortDescription, longDescription,
    categoryId, collaborationMode, parsedTags,
    selectedFile, navigate,
  ]);

  const isClosedMode = collaborationMode === 'closed';
  const isOpenMode = collaborationMode === 'open';

  return (
    <form className="skill-form" onSubmit={handleSubmit}>
      {submitError && (
        <div className="skill-form-error">{submitError}</div>
      )}
      {categoriesLoadError && (
        <div className="skill-form-error">{categoriesLoadError}</div>
      )}

      <div className="skill-form-field">
        <label className="skill-form-label label-uppercase" htmlFor="displayName">
          DISPLAY NAME
        </label>
        <input
          id="displayName"
          type="text"
          className="skill-form-input"
          value={displayName}
          onChange={handleDisplayNameChange}
          required
        />
      </div>

      <div className="skill-form-field">
        <label className="skill-form-label label-uppercase" htmlFor="shortDescription">
          SHORT DESCRIPTION
        </label>
        <textarea
          id="shortDescription"
          className="skill-form-textarea"
          rows={3}
          value={shortDescription}
          onChange={handleShortDescriptionChange}
          required
        />
        <span className="skill-form-counter">
          {shortDescriptionCount}/{MAX_SHORT_DESCRIPTION}
        </span>
      </div>

      <div className="skill-form-field">
        <label className="skill-form-label label-uppercase" htmlFor="longDescription">
          LONG DESCRIPTION
        </label>
        <textarea
          id="longDescription"
          className="skill-form-textarea skill-form-textarea--tall"
          rows={8}
          value={longDescription}
          onChange={handleLongDescriptionChange}
          placeholder="Supports markdown"
        />
      </div>

      <div className="skill-form-field">
        <label className="skill-form-label label-uppercase" htmlFor="category">
          CATEGORY
        </label>
        <select
          id="category"
          className="skill-form-select"
          value={categoryId}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="skill-form-field">
        <label className="skill-form-label label-uppercase" htmlFor="tags">
          TAGS
        </label>
        <input
          id="tags"
          type="text"
          className="skill-form-input"
          value={tagsInput}
          onChange={handleTagsChange}
          placeholder="Comma-separated, max 10"
        />
        <span className="skill-form-counter">
          {parsedTags.length}/{MAX_TAGS} tags
        </span>
      </div>

      <div className="skill-form-field">
        <span className="skill-form-label label-uppercase">COLLABORATION MODE</span>
        <div className="skill-form-radio-group">
          <label className="skill-form-radio">
            <input
              type="radio"
              name="collaborationMode"
              checked={isClosedMode}
              onChange={handleCollabClosed}
            />
            <span className="skill-form-radio-text">Closed</span>
          </label>
          <label className="skill-form-radio">
            <input
              type="radio"
              name="collaborationMode"
              checked={isOpenMode}
              onChange={handleCollabOpen}
            />
            <span className="skill-form-radio-text">Open</span>
          </label>
        </div>
      </div>

      <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
      {isExtractingFrontmatter && (
        <span className="skill-form-extracting">Extracting metadata from file...</span>
      )}

      <div className="skill-form-actions">
        <button
          type="submit"
          className="skill-form-submit"
          disabled={isSubmitting || isExtractingFrontmatter}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Skill'}
        </button>
      </div>
    </form>
  );
}
