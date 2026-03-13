import { Skeleton } from '../../shared/components/Skeleton';
import './CollaboratorsListSkeleton.css';

const SKELETON_ROW_COUNT = 3;

export function CollaboratorsListSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <CollaboratorsListSkeletonItem key={index} />
      ))}
    </>
  );
}

function CollaboratorsListSkeletonItem() {
  return (
    <div className="collaborators-list-skeleton-item">
      <div className="collaborators-list-skeleton-left">
        <Skeleton variant="text" width="120px" height="13px" />
        <Skeleton variant="text" width="80px" height="11px" />
      </div>
      <div className="collaborators-list-skeleton-right">
        <Skeleton variant="text" width="70px" height="11px" />
      </div>
    </div>
  );
}
