import { SkillInitialTile } from '../../shared/components/SkillInitialTile';
import './CatalogPreviewCard.css';

const PLACEHOLDER_NAME = 'Skill name';
const PLACEHOLDER_DESCRIPTION = 'Short description';
const PLACEHOLDER_CATEGORY = 'Category';
const PREVIEW_AUTHOR_LABEL = 'by you';
const PREVIEW_INITIAL_VERSION = 'v1.0.0';
const META_SEPARATOR = '\u2022';

interface CatalogPreviewCardProps {
  readonly displayName: string;
  readonly shortDescription: string;
  readonly tags: readonly string[];
  readonly categoryName: string;
}

export function CatalogPreviewCard({
  displayName,
  shortDescription,
  tags,
  categoryName,
}: CatalogPreviewCardProps) {
  const hasDisplayName = displayName.trim().length > 0;
  const hasDescription = shortDescription.trim().length > 0;
  const hasCategoryName = categoryName.trim().length > 0;
  const displayCategory = hasCategoryName ? categoryName : PLACEHOLDER_CATEGORY;

  const hasTags = tags.length > 0;
  const nameClassName = buildNameClassName(hasDisplayName);
  const descriptionClassName = buildDescriptionClassName(hasDescription);

  return (
    <div>
      <div className="catalog-preview-label">Catalog Preview</div>
      <div className="catalog-preview-card">
        <SkillInitialTile displayName={displayName} />
        <div className="catalog-preview-content">
          <div className={nameClassName}>
            {hasDisplayName ? displayName : PLACEHOLDER_NAME}
          </div>
          <div className={descriptionClassName}>
            {hasDescription ? shortDescription : PLACEHOLDER_DESCRIPTION}
          </div>
          <div className="catalog-preview-meta">
            <span>{PREVIEW_AUTHOR_LABEL}</span>
            <span>{META_SEPARATOR}</span>
            <span>{PREVIEW_INITIAL_VERSION}</span>
            <span>{META_SEPARATOR}</span>
            <span>{displayCategory}</span>
            {hasTags && renderTagPills(tags)}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildNameClassName(hasDisplayName: boolean): string {
  const base = 'catalog-preview-name';
  return hasDisplayName ? base : `${base} catalog-preview-name--empty`;
}

function buildDescriptionClassName(hasDescription: boolean): string {
  const base = 'catalog-preview-desc';
  return hasDescription ? base : `${base} catalog-preview-desc--empty`;
}

function renderTagPills(tags: readonly string[]) {
  return (
    <>
      {tags.map((tag) => (
        <span key={tag} className="catalog-preview-tag">
          {tag}
        </span>
      ))}
    </>
  );
}
