import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { TextArea } from '../../shared/components/TextArea';
import { Button } from '../../shared/components/Button';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { useAuthGuard } from '../../shared/hooks/useAuthGuard';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import './CommentForm.css';

const MAX_COMMENT_LENGTH = 2000;
const COMMENT_INPUT_BUFFER = 100;
const MAX_COMMENT_INPUT_LENGTH = MAX_COMMENT_LENGTH + COMMENT_INPUT_BUFFER;
const COMMENT_LOGIN_MESSAGE = 'You need to sign in to post comments. Would you like to sign in now?';
const SEND_ICON_SIZE = 14;

interface CommentFormProps {
  readonly isSubmitting: boolean;
  readonly onSubmit: (commentText: string) => void;
}

export function CommentForm({
  isSubmitting,
  onSubmit,
}: CommentFormProps) {
  const [commentText, setCommentText] = useState('');
  const { isAuthenticated } = useAuthStore();
  const {
    guardWithLogin,
    loginDialogState,
    closeLoginDialog,
  } = useAuthGuard();

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

  const handleFocusWhenAnonymous = guardWithLogin({
    message: COMMENT_LOGIN_MESSAGE,
    onAuthenticated: () => {},
  });

  const submitComment = useCallback(() => {
    const canSubmit = !isCommentTextEmpty && !isOverLimit && !isSubmitting;
    if (canSubmit) {
      onSubmit(commentText.trim());
      setCommentText('');
    }
  }, [commentText, isCommentTextEmpty, isOverLimit, isSubmitting, onSubmit]);

  const handleSubmit = guardWithLogin({
    message: COMMENT_LOGIN_MESSAGE,
    onAuthenticated: submitComment,
  });

  const isReadOnlyForAnonymous = !isAuthenticated;

  return (
    <div className="comment-form">
      <span className="comment-form-label">Leave a comment</span>
      <TextArea
        placeholder={isReadOnlyForAnonymous ? 'Sign in to leave a comment...' : 'Write a comment...'}
        value={commentText}
        onChange={handleCommentTextChange}
        onFocus={isReadOnlyForAnonymous ? handleFocusWhenAnonymous : undefined}
        readOnly={isReadOnlyForAnonymous}
        maxLength={MAX_COMMENT_INPUT_LENGTH}
      />
      <div className="comment-form-footer">
        <span className={charCountClass}>
          {charCount} / {MAX_COMMENT_LENGTH}
        </span>
        <Button variant="primary" disabled={isSubmitDisabled} onClick={handleSubmit}>
          <Send size={SEND_ICON_SIZE} />
          Post Comment
        </Button>
      </div>

      {loginDialogState.isOpen && (
        <ConfirmDialog
          title={loginDialogState.title}
          message={loginDialogState.message}
          confirmLabel={loginDialogState.confirmLabel}
          isDangerous={loginDialogState.isDangerous}
          onConfirm={loginDialogState.onConfirm}
          onCancel={closeLoginDialog}
        />
      )}
    </div>
  );
}
