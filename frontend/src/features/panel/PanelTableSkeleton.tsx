import { Skeleton } from '../../shared/components/Skeleton';
import styles from './PanelTableSkeleton.module.css';

const SKELETON_ROW_COUNT = 4;

export function PanelTableSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <PanelTableSkeletonRow key={index} />
      ))}
    </>
  );
}

function PanelTableSkeletonRow() {
  return (
    <div className={styles.row}>
      <div className={styles.colName}>
        <Skeleton variant="text" width="130px" height="12px" />
        <Skeleton variant="text" width="80px" height="10px" />
      </div>
      <div className={styles.colCenter} style={{ width: 75 }}>
        <Skeleton variant="badge" width="50px" height="18px" />
      </div>
      <div className={styles.colCenter} style={{ width: 65 }}>
        <Skeleton variant="text" width="35px" height="11px" />
      </div>
      <div className={styles.colCenter} style={{ width: 110 }}>
        <Skeleton variant="text" width="60px" height="11px" />
      </div>
      <div className={styles.colCenter} style={{ width: 75 }}>
        <Skeleton variant="text" width="40px" height="11px" />
      </div>
      <div className={styles.colRight} style={{ width: 130 }}>
        <Skeleton variant="text" width="20px" height="14px" />
        <Skeleton variant="text" width="20px" height="14px" />
        <Skeleton variant="text" width="20px" height="14px" />
      </div>
    </div>
  );
}
