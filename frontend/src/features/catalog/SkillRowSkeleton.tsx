import { Skeleton } from '../../shared/components/Skeleton';
import './SkillRowSkeleton.css';

interface SkillRowSkeletonProps {
  readonly isAlternate?: boolean;
}

const SKELETON_ROW_COUNT = 6;

export function SkillRowSkeleton({ isAlternate = false }: SkillRowSkeletonProps) {
  const rowClassName = isAlternate
    ? 'skill-row-skeleton skill-row-skeleton--alt'
    : 'skill-row-skeleton';

  return (
    <div className={rowClassName}>
      <div className="skill-row-skeleton-main">
        <div className="skill-row-skeleton-header">
          <div className="skill-row-skeleton-title-group">
            <Skeleton variant="text" width="140px" height="13px" />
            <Skeleton variant="badge" width="45px" height="18px" />
          </div>
          <Skeleton variant="text" width="80px" height="10px" />
        </div>
        <Skeleton variant="text" width="85%" height="11px" />
        <div className="skill-row-skeleton-footer">
          <Skeleton variant="text" width="70px" height="11px" />
          <Skeleton variant="text" width="50px" height="11px" />
          <Skeleton variant="text" width="40px" height="11px" />
        </div>
      </div>
    </div>
  );
}

export function SkillRowSkeletonList() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => {
        const isAlternate = index % 2 === 1;
        return (
          <SkillRowSkeleton key={index} isAlternate={isAlternate} />
        );
      })}
    </>
  );
}
