import { Skeleton } from '../../shared/components/Skeleton';
import styles from './SkillRowSkeleton.module.css';

interface SkillRowSkeletonProps {
  readonly isAlternate?: boolean;
}

const SKELETON_ROW_COUNT = 6;

export function SkillRowSkeleton({ isAlternate = false }: SkillRowSkeletonProps) {
  const rowClassName = isAlternate
    ? `${styles.skeleton} ${styles.alt}`
    : styles.skeleton;

  return (
    <div className={rowClassName}>
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Skeleton variant="text" width="140px" height="13px" />
            <Skeleton variant="badge" width="45px" height="18px" />
          </div>
          <Skeleton variant="text" width="80px" height="10px" />
        </div>
        <Skeleton variant="text" width="85%" height="11px" />
        <div className={styles.footer}>
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
