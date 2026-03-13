import { Skeleton } from '../../shared/components/Skeleton';
import './SkillEditSkeleton.css';

export function SkillEditSkeleton() {
  return (
    <div className="skill-edit-skeleton">
      <Skeleton variant="title" width="90px" height="16px" />

      <div className="skill-edit-skeleton-field">
        <Skeleton variant="text" width="95px" height="13px" />
        <Skeleton variant="block" width="100%" height="38px" />
      </div>

      <div className="skill-edit-skeleton-field">
        <Skeleton variant="text" width="120px" height="13px" />
        <Skeleton variant="block" width="100%" height="60px" />
      </div>

      <div className="skill-edit-skeleton-two-cols">
        <div className="skill-edit-skeleton-field">
          <Skeleton variant="text" width="65px" height="13px" />
          <div className="skill-edit-skeleton-chips">
            <Skeleton variant="badge" width="70px" height="28px" />
            <Skeleton variant="badge" width="85px" height="28px" />
            <Skeleton variant="badge" width="60px" height="28px" />
            <Skeleton variant="badge" width="75px" height="28px" />
          </div>
        </div>
        <div className="skill-edit-skeleton-field">
          <Skeleton variant="text" width="35px" height="13px" />
          <Skeleton variant="block" width="100%" height="38px" />
        </div>
      </div>

      <div className="skill-edit-skeleton-field">
        <Skeleton variant="text" width="130px" height="13px" />
        <Skeleton variant="block" width="100%" height="140px" />
      </div>

      <div className="skill-edit-skeleton-field">
        <Skeleton variant="text" width="130px" height="13px" />
        <div className="skill-edit-skeleton-chips">
          <Skeleton variant="badge" width="100px" height="32px" />
          <Skeleton variant="badge" width="100px" height="32px" />
        </div>
      </div>

      <div className="skill-edit-skeleton-actions">
        <Skeleton variant="button" width="120px" height="38px" />
        <Skeleton variant="button" width="80px" height="38px" />
      </div>
    </div>
  );
}
