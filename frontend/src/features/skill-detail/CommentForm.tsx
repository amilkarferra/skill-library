import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TextArea } from '../../shared/components/TextArea';
import { Button } from '../../shared/components/Button';
import './CommentForm.css';

const MAX_COMMENT_LENGTH = 2000;
const COMMENT_INPUT_BUFFER = 100;
const MAX_COMMENT_INPUT_LENGTH = MAX_COMMENT_LENGTH + COMMENT_INPUT_BUFFER;

interface CommentFormProps {
  readonly isAuthenticated: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (commentText: string) => void;
}

export function CommentForm({
  isAuthenticated,
  isSubmitting,
  onSubmit,
}: CommentFormProps) {
  const [commentText, setCommentText] = useState('');

  const charCount = commentText.length;
  const isOverLimit = charCount > MAX_COMMENT_LENGTH;
  const isCommentTextEmpty = commentText.trim().length === 0;
  const isSubmitDisabled = isCommentTextEmpty || isOverLimit || isSubmitting;

  const charCountClass = isOverLimit
    ? 'comment-form-char-count comment-form-char-count--over'
    : 'comment-form-char-count';

  const handleCommentTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCommentText(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const canSubmit = !isCommentTextEmpty && !isOverLimit && !isSubmitting;
    if (canSubmit) {
      onSubmit(commentText.trim());
      setCommentText('');
    }
  }, [commentText, isCommentTextEmpty, isOverLimit, isSubmitting, onSubmit]);

  if (!isAuthenticated) {
    return (
      <div className="comment-form-signin">
        <Link to="/login" className="comment-form-signin-link">
          Sign in
        </Link>
        {' '}to leave a comment.
      </div>
    );
  }

  return (
    <div className="comment-form">
      <TextArea
        placeholder="Write a comment..."
        value={commentText}
        onChange={handleCommentTextChange}
        maxLength={MAX_COMMENT_INPUT_LENGTH}
      />
      <div className="comment-form-footer">
        <span className={charCountClass}>
          {charCount} / {MAX_COMMENT_LENGTH}
        </span>
        <Button variant="primary" disabled={isSubmitDisabled} onClick={handleSubmit}>
          <Send size={14} />
          Post Comment
        </Button>
      </div>
    </div>
  );
}
