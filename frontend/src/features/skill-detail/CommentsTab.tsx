import { useCallback } from 'react';
import { Pagination } from '../../shared/components/Pagination';
import { EmptyState } from '../../shared/components/EmptyState';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import type { Comment } from '../../shared/models/Comment';
import './CommentsTab.css';

interface CommentsTabProps {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  isUpdating: boolean;
  currentUserId: number | null;
  skillOwnerId: number;
  onPageChange: (page: number) => void;
  onSubmitComment: (commentText: string) => void;
  onEditComment: (commentId: number, commentText: string) => void;
  onDeleteComment: (commentId: number) => void;
}

export function CommentsTab({
  comments,
  currentPage,
  totalPages,
  isAuthenticated,
  isSubmitting,
  isUpdating,
  currentUserId,
  skillOwnerId,
  onPageChange,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
}: CommentsTabProps) {
  const hasComments = comments.length > 0;

  const resolveCanModify = useCallback(
    (comment: Comment): boolean => {
      const isNotAuthenticated = currentUserId === null;
      if (isNotAuthenticated) return false;

      const isCommentAuthor = comment.authorId === currentUserId;
      const isSkillOwner = currentUserId === skillOwnerId;
      return isCommentAuthor || isSkillOwner;
    },
    [currentUserId, skillOwnerId]
  );

  return (
    <div className="comments-tab">
      <CommentForm
        isAuthenticated={isAuthenticated}
        isSubmitting={isSubmitting}
        onSubmit={onSubmitComment}
      />

      {hasComments ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canModify={resolveCanModify(comment)}
              isUpdating={isUpdating}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No comments yet"
          description="Be the first to share your thoughts on this skill."
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
