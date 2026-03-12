import { useState, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../shared/formatters/format-date';
import type { Comment } from '../../shared/models/Comment';
import { Button } from '../../shared/components/Button';
import './CommentItem.css';

const MAX_COMMENT_EDIT_LENGTH = 2100;

interface CommentItemProps {
  readonly comment: Comment;
  readonly canModify: boolean;
  readonly isUpdating: boolean;
  readonly onEdit: (commentId: number, commentText: string) => void;
  readonly onDelete: (commentId: number) => void;
}

export function CommentItem({
  comment,
  canModify,
  isUpdating,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCommentText, setEditCommentText] = useState(comment.commentText);

  const isEditCommentTextEmpty = editCommentText.trim().length === 0;
  const isSaveDisabled = isEditCommentTextEmpty || isUpdating;

  const handleStartEdit = useCallback(() => {
    setEditCommentText(comment.commentText);
    setIsEditing(true);
  }, [comment.commentText]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditCommentText(comment.commentText);
  }, [comment.commentText]);

  const handleSaveEdit = useCallback(() => {
    const hasCommentText = editCommentText.trim().length > 0;
    if (hasCommentText) {
      onEdit(comment.id, editCommentText.trim());
      setIsEditing(false);
    }
  }, [comment.id, editCommentText, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(comment.id);
  }, [comment.id, onDelete]);

  const handleEditCommentTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditCommentText(event.target.value);
    },
    []
  );

  const hasBeenEdited = comment.updatedAt !== comment.createdAt;

  return (
    <div className="comment-item">
      <div className="comment-item-header">
        <div className="comment-item-author">
          <span className="comment-item-displayname">
            {comment.authorDisplayName}
          </span>
          <span className="comment-item-username">
            @{comment.authorUsername}
          </span>
        </div>
        <span className="comment-item-date">
          {formatDateTime(comment.createdAt)}
          {hasBeenEdited && ' (edited)'}
        </span>
      </div>

      {isEditing ? (
        <>
          <textarea
            className="comment-item-edit-textarea"
            value={editCommentText}
            onChange={handleEditCommentTextChange}
            maxLength={MAX_COMMENT_EDIT_LENGTH}
          />
          <div className="comment-item-edit-actions">
            <Button variant="primary" size="small" disabled={isSaveDisabled} onClick={handleSaveEdit}>
              Save
            </Button>
            <Button variant="secondary" size="small" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="comment-item-content">{comment.commentText}</p>
          {canModify && (
            <div className="comment-item-actions">
              <button
                className="comment-item-action-button"
                onClick={handleStartEdit}
              >
                <Pencil size={12} />
                Edit
              </button>
              <button
                className="comment-item-action-button comment-item-action-button--danger"
                onClick={handleDelete}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
