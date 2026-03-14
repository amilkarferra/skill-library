import { Skeleton } from '../../shared/components/Skeleton';
import styles from './PanelListSkeleton.module.css';

interface PanelListSkeletonProps {
  readonly rowCount?: number;
}

const DEFAULT_ROW_COUNT = 3;

export function PanelListSkeleton({ rowCount = DEFAULT_ROW_COUNT }: PanelListSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, index) => (
        <PanelListSkeletonItem key={index} />
      ))}
    </>
  );
}

function PanelListSkeletonItem() {
  return (
    <div className={styles.item}>
      <div className={styles.left}>
        <Skeleton variant="text" width="150px" height="12px" />
        <Skeleton variant="text" width="90px" height="10px" />
      </div>
      <div className={styles.right}>
        <Skeleton variant="badge" width="55px" height="18px" />
        <Skeleton variant="text" width="35px" height="11px" />
      </div>
    </div>
  );
}
