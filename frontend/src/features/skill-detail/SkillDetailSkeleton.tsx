import { Skeleton } from '../../shared/components/Skeleton';
import './SkillDetailSkeleton.css';

export function SkillDetailSkeleton() {
  return (
    <div className="skill-detail-skeleton">
      <div className="skill-detail-skeleton-breadcrumb">
        <Skeleton variant="text" width="40px" height="12px" />
        <Skeleton variant="text" width="8px" height="12px" />
        <Skeleton variant="text" width="140px" height="12px" />
      </div>

      <div className="skill-detail-skeleton-header">
        <div className="skill-detail-skeleton-header-top">
          <div className="skill-detail-skeleton-identity">
            <Skeleton variant="title" width="280px" height="26px" />
            <Skeleton variant="text" width="420px" height="14px" />
          </div>
          <div className="skill-detail-skeleton-actions">
            <Skeleton variant="button" width="140px" height="38px" />
            <Skeleton variant="button" width="80px" height="38px" />
          </div>
        </div>

        <div className="skill-detail-skeleton-meta">
          <Skeleton variant="text" width="90px" height="13px" />
          <Skeleton variant="text" width="70px" height="13px" />
          <Skeleton variant="text" width="40px" height="13px" />
          <Skeleton variant="badge" width="100px" height="20px" />
        </div>

        <div className="skill-detail-skeleton-stats">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        <div className="skill-detail-skeleton-tags">
          <Skeleton variant="badge" width="55px" height="22px" />
          <Skeleton variant="badge" width="70px" height="22px" />
          <Skeleton variant="badge" width="48px" height="22px" />
        </div>
      </div>

      <div className="skill-detail-skeleton-tabs">
        <div className="skill-detail-skeleton-tab">
          <Skeleton variant="text" width="65px" height="13px" />
        </div>
        <div className="skill-detail-skeleton-tab">
          <Skeleton variant="text" width="65px" height="13px" />
        </div>
        <div className="skill-detail-skeleton-tab">
          <Skeleton variant="text" width="75px" height="13px" />
        </div>
        <div className="skill-detail-skeleton-tab">
          <Skeleton variant="text" width="95px" height="13px" />
        </div>
      </div>

      <div className="skill-detail-skeleton-content">
        <Skeleton variant="text" width="100%" height="12px" />
        <Skeleton variant="text" width="95%" height="12px" />
        <Skeleton variant="text" width="85%" height="12px" />
        <Skeleton variant="text" width="100%" height="12px" />
        <Skeleton variant="text" width="70%" height="12px" />
        <Skeleton variant="text" width="90%" height="12px" />
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="skill-detail-skeleton-stat-card">
      <Skeleton variant="block" width="32px" height="32px" />
      <div className="skill-detail-skeleton-stat-text">
        <Skeleton variant="text" width="30px" height="18px" />
        <Skeleton variant="text" width="60px" height="11px" />
      </div>
    </div>
  );
}
