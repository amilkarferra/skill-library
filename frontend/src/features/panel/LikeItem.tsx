import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { SkillQuickActions } from '../../shared/components/SkillQuickActions';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import styles from './MyLikesSection.module.css';

interface LikeItemProps {
  readonly skill: SkillSummary;
  readonly onUnlike: (skill: SkillSummary) => void;
}

export function LikeItem({ skill, onUnlike }: LikeItemProps) {
  const handleUnlikeClick = useCallback(() => {
    onUnlike(skill);
  }, [onUnlike, skill]);

  return (
    <div className={styles.item}>
      <Link to={`/skills/${skill.name}`} className={styles.itemInfo}>
        <span className={styles.itemName}>{skill.displayName}</span>
        <span className={styles.itemOwner}>@{skill.ownerUsername}</span>
        <span className={styles.itemDescription}>
          {skill.shortDescription}
        </span>
      </Link>
      <div className={styles.itemMeta}>
        <SkillQuickActions
          totalLikes={skill.totalLikes}
          totalDownloads={skill.totalDownloads}
          size="small"
        />
        <button
          className={styles.itemUnlike}
          onClick={handleUnlikeClick}
        >
          <Heart size={13} />
          Unlike
        </button>
      </div>
    </div>
  );
}
