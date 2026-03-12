import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download } from 'lucide-react';
import type { SkillSummary } from '../../shared/models/SkillSummary';

interface LikeItemProps {
  readonly skill: SkillSummary;
  readonly onUnlike: (skill: SkillSummary) => void;
}

export function LikeItem({ skill, onUnlike }: LikeItemProps) {
  const handleUnlikeClick = useCallback(() => {
    onUnlike(skill);
  }, [onUnlike, skill]);

  return (
    <div className="like-item">
      <Link to={`/skills/${skill.name}`} className="like-item-info">
        <span className="like-item-name">{skill.displayName}</span>
        <span className="like-item-owner">@{skill.ownerUsername}</span>
        <span className="like-item-description">{skill.shortDescription}</span>
      </Link>
      <div className="like-item-meta">
        <span className="like-item-stat">
          <Heart size={12} />
          {skill.totalLikes}
        </span>
        <span className="like-item-stat">
          <Download size={12} />
          {skill.totalDownloads}
        </span>
        <button className="like-item-unlike" onClick={handleUnlikeClick}>
          <Heart size={13} />
          Unlike
        </button>
      </div>
    </div>
  );
}
