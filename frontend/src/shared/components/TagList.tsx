import './TagList.css';

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  const hasTags = tags.length > 0;
  if (!hasTags) return null;

  return (
    <div className="tag-list">
      {tags.map((tagName) => (
        <span key={tagName} className="tag-pill">{tagName}</span>
      ))}
    </div>
  );
}
