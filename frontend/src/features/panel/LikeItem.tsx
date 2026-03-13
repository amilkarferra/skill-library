import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { SkillQuickActions } from '../../shared/components/SkillQuickActions';
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
        <span className="like-item-description">
          {skill.shortDescription}
        </span>
      </Link>
      <div className="like-item-meta">
        <SkillQuickActions
          totalLikes={skill.totalLikes}
          totalDownloads={skill.totalDownloads}
          size="small"
        />
        <button className="like-item-unlike" onClick={handleUnlikeClick}>
          <Heart size={13} />
          Unlike
        </button>
      </div>
    </div>
  );
}
