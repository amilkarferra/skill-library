import { useState, useEffect, useCallback } from 'react';
import { Calendar, Trash2, Search, UserPlus } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { EmptyState } from '../../shared/components/EmptyState';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { formatDate } from '../../shared/formatters/format-date';
import {
  fetchCollaborators,
  inviteCollaborator,
  removeCollaborator,
  searchUsers,
} from './skill-detail.service';
import type { Collaborator } from '../../shared/models/Collaborator';
import type { User } from '../../shared/models/User';
import './CollaboratorsTab.css';

interface CollaboratorsTabProps {
  readonly slug: string;
  readonly isOwner: boolean;
  readonly skillOwnerId: number;
}

const MINIMUM_SEARCH_LENGTH = 2;
const ICON_SIZE_SMALL = 12;
const ICON_SIZE_ACTION = 14;

export function CollaboratorsTab({ slug, isOwner, skillOwnerId }: CollaboratorsTabProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [invitationSuccessMessage, setInvitationSuccessMessage] = useState<string | null>(null);
  const [pendingInvitationUserIds, setPendingInvitationUserIds] = useState<number[]>([]);
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const fetchedCollaborators = await fetchCollaborators(slug);
      setCollaborators(fetchedCollaborators);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load collaborators';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  const executeRemoveCollaborator = useCallback(async (userId: number) => {
    setActionError(null);
    try {
      await removeCollaborator(slug, userId);
      closeDialog();
      setCollaborators((previous) => previous.filter((item) => item.userId !== userId));
    } catch (error) {
      closeDialog();
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove collaborator';
      setActionError(errorMessage);
    }
  }, [slug, closeDialog]);

  const handleRequestRemove = useCallback((collaborator: Collaborator) => {
    openDialog({
      title: 'Remove collaborator',
      message: `Remove "${collaborator.displayName}" as a collaborator? They will no longer be able to propose versions.`,
      confirmLabel: 'Remove',
      isDangerous: true,
      onConfirm: () => { void executeRemoveCollaborator(collaborator.userId); },
    });
  }, [openDialog, executeRemoveCollaborator]);

  const handleInvitationSent = useCallback((invitedUser: User) => {
    setInvitationSuccessMessage(`Invitation sent to ${invitedUser.displayName}`);
    setPendingInvitationUserIds((previous) => [...previous, invitedUser.id]);
  }, []);

  const hasLoadError = loadError !== null;
  const hasActionError = actionError !== null;
  const hasInvitationSuccess = invitationSuccessMessage !== null;
  const hasCollaborators = collaborators.length > 0;
  const allExcludedUserIds = [
    ...collaborators.map((item) => item.userId),
    ...pendingInvitationUserIds,
  ];

  if (isLoading) {
    return <p className="collaborators-loading">Loading collaborators...</p>;
  }

  if (hasLoadError) {
    return <p className="collaborators-error">{loadError}</p>;
  }

  return (
    <div className="collaborators-tab">
      {hasActionError && (
        <p className="collaborators-error">{actionError}</p>
      )}

      {hasInvitationSuccess && (
        <p className="collaborators-success">{invitationSuccessMessage}</p>
      )}

      {!hasCollaborators && (
        <EmptyState
          title="No collaborators"
          description="This skill has no collaborators yet."
        />
      )}

      {hasCollaborators && (
        <div className="collaborators-list">
          {collaborators.map((collaborator) => (
            <CollaboratorItem
              key={collaborator.userId}
              collaborator={collaborator}
              isOwner={isOwner}
              onRequestRemove={handleRequestRemove}
            />
          ))}
        </div>
      )}

      {isOwner && (
        <InviteSection
          slug={slug}
          skillOwnerId={skillOwnerId}
          excludedUserIds={allExcludedUserIds}
          onInvitationSent={handleInvitationSent}
        />
      )}

      {dialogState.isOpen && (
        <ConfirmDialog
          title={dialogState.title}
          message={dialogState.message}
          confirmLabel={dialogState.confirmLabel}
          isDangerous={dialogState.isDangerous}
          onConfirm={dialogState.onConfirm}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}

interface CollaboratorItemProps {
  readonly collaborator: Collaborator;
  readonly isOwner: boolean;
  readonly onRequestRemove: (collaborator: Collaborator) => void;
}

function CollaboratorItem({ collaborator, isOwner, onRequestRemove }: CollaboratorItemProps) {
  const handleRemoveClick = useCallback(() => {
    onRequestRemove(collaborator);
  }, [onRequestRemove, collaborator]);

  return (
    <div className="collaborator-item">
      <div className="collaborator-details">
        <span className="collaborator-display-name">{collaborator.displayName}</span>
        <span className="collaborator-username">@{collaborator.username}</span>
      </div>
      <div className="collaborator-meta">
        <span className="collaborator-joined-at">
          <Calendar size={ICON_SIZE_SMALL} />
          {formatDate(collaborator.joinedAt)}
        </span>
        {isOwner && (
          <Button variant="danger-outline" size="small" onClick={handleRemoveClick}>
            <Trash2 size={ICON_SIZE_ACTION} />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

interface InviteSectionProps {
  readonly slug: string;
  readonly skillOwnerId: number;
  readonly excludedUserIds: number[];
  readonly onInvitationSent: (user: User) => void;
}

function InviteSection({
  slug,
  skillOwnerId,
  excludedUserIds,
  onInvitationSent,
}: InviteSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitingUserId, setInvitingUserId] = useState<number | null>(null);

  const handleSearchQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const executeSearch = useCallback(async () => {
    const isTooShort = searchQuery.trim().length < MINIMUM_SEARCH_LENGTH;
    if (isTooShort) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await searchUsers(searchQuery.trim());
      const availableUsers = users.filter((user) => {
        const isSkillOwner = user.id === skillOwnerId;
        const isExcluded = excludedUserIds.includes(user.id);
        return !isSkillOwner && !isExcluded;
      });
      setSearchResults(availableUsers);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, skillOwnerId, excludedUserIds]);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isEnterKey = event.key === 'Enter';
      if (isEnterKey) {
        void executeSearch();
      }
    },
    [executeSearch]
  );

  const handleInviteUser = useCallback(async (user: User) => {
    setInviteError(null);
    setInvitingUserId(user.id);
    try {
      await inviteCollaborator(slug, user.id);
      onInvitationSent(user);
      setSearchResults((previous) => previous.filter((item) => item.id !== user.id));
      setSearchQuery('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite collaborator';
      setInviteError(errorMessage);
    } finally {
      setInvitingUserId(null);
    }
  }, [slug, onInvitationSent]);

  const hasSearchResults = searchResults.length > 0;
  const hasSearchQuery = searchQuery.trim().length >= MINIMUM_SEARCH_LENGTH;
  const shouldShowNoResults = hasSearchQuery && !hasSearchResults && !isSearching;
  const hasInviteError = inviteError !== null;

  return (
    <div className="invite-section">
      <span className="invite-section-title">Invite collaborator</span>
      {hasInviteError && (
        <p className="collaborators-error">{inviteError}</p>
      )}
      <div className="invite-search-row">
        <input
          type="text"
          className="invite-search-input"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
          onKeyDown={handleSearchKeyDown}
        />
        <Button
          variant="secondary"
          size="small"
          onClick={executeSearch}
          disabled={isSearching}
        >
          <Search size={ICON_SIZE_ACTION} />
          Search
        </Button>
      </div>
      {hasSearchResults && (
        <div className="invite-search-results">
          {searchResults.map((user) => (
            <SearchResultItem
              key={user.id}
              user={user}
              isInviting={invitingUserId === user.id}
              onInvite={handleInviteUser}
            />
          ))}
        </div>
      )}
      {shouldShowNoResults && (
        <p className="invite-no-results">No users found matching your search.</p>
      )}
    </div>
  );
}

interface SearchResultItemProps {
  readonly user: User;
  readonly isInviting: boolean;
  readonly onInvite: (user: User) => void;
}

function SearchResultItem({ user, isInviting, onInvite }: SearchResultItemProps) {
  const handleInviteClick = useCallback(() => {
    void onInvite(user);
  }, [onInvite, user]);

  return (
    <div className="invite-search-result-item">
      <div className="invite-search-result-name">
        <span className="invite-search-result-display-name">{user.displayName}</span>
        <span className="invite-search-result-username">@{user.username}</span>
      </div>
      <Button variant="primary" size="small" onClick={handleInviteClick} disabled={isInviting}>
        <UserPlus size={ICON_SIZE_ACTION} />
        {isInviting ? 'Inviting...' : 'Invite'}
      </Button>
    </div>
  );
}
