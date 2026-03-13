import { Skeleton } from '../../shared/components/Skeleton';
import './PanelTableSkeleton.css';

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
    <div className="panel-table-skeleton-row">
      <div className="panel-table-skeleton-col-name">
        <Skeleton variant="text" width="130px" height="12px" />
        <Skeleton variant="text" width="80px" height="10px" />
      </div>
      <div className="panel-table-skeleton-col-center" style={{ width: 75 }}>
        <Skeleton variant="badge" width="50px" height="18px" />
      </div>
      <div className="panel-table-skeleton-col-center" style={{ width: 65 }}>
        <Skeleton variant="text" width="35px" height="11px" />
      </div>
      <div className="panel-table-skeleton-col-center" style={{ width: 110 }}>
        <Skeleton variant="text" width="60px" height="11px" />
      </div>
      <div className="panel-table-skeleton-col-center" style={{ width: 75 }}>
        <Skeleton variant="text" width="40px" height="11px" />
      </div>
      <div className="panel-table-skeleton-col-right" style={{ width: 130 }}>
        <Skeleton variant="text" width="20px" height="14px" />
        <Skeleton variant="text" width="20px" height="14px" />
        <Skeleton variant="text" width="20px" height="14px" />
      </div>
    </div>
  );
}
