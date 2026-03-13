import './Skeleton.css';

type SkeletonVariant = 'text' | 'title' | 'badge' | 'button' | 'circle' | 'block';

interface SkeletonProps {
  readonly variant?: SkeletonVariant;
  readonly width?: string;
  readonly height?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const className = `skeleton skeleton--${variant}`;
  const inlineStyle = buildInlineStyle(width, height);

  return <span className={className} style={inlineStyle} />;
}

function buildInlineStyle(
  width: string | undefined,
  height: string | undefined
): React.CSSProperties | undefined {
  const hasCustomDimensions = width !== undefined || height !== undefined;
  if (!hasCustomDimensions) return undefined;

  return { width, height };
}
