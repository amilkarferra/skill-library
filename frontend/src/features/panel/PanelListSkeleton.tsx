import { Skeleton } from '../../shared/components/Skeleton';
import './PanelListSkeleton.css';

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
    <div className="panel-list-skeleton-item">
      <div className="panel-list-skeleton-left">
        <Skeleton variant="text" width="150px" height="12px" />
        <Skeleton variant="text" width="90px" height="10px" />
      </div>
      <div className="panel-list-skeleton-right">
        <Skeleton variant="badge" width="55px" height="18px" />
        <Skeleton variant="text" width="35px" height="11px" />
      </div>
    </div>
  );
}
