import { useState, useEffect, useRef, useCallback } from 'react';
import type { SlugPreview } from '../../shared/models/SlugPreview';
import type { SimilarSkill } from '../../shared/models/SimilarSkill';
import { fetchSlugPreview, fetchSimilarSkills } from './publish.service';
import { sortByRelevance } from './similar-skills.logic';

const SLUG_PREVIEW_DEBOUNCE_MS = 500;
const RESET_DEBOUNCE_MS = 0;

interface SlugPreviewState {
  readonly slugPreview: SlugPreview | null;
  readonly similarSkills: readonly SimilarSkill[];
  readonly clearSlugState: () => void;
}

export function useSlugPreview(displayName: string): SlugPreviewState {
  const [slugPreview, setSlugPreview] = useState<SlugPreview | null>(null);
  const [similarSkills, setSimilarSkills] = useState<readonly SimilarSkill[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    const hasDisplayName = displayName.trim().length > 0;
    const debounceDelay = hasDisplayName ? SLUG_PREVIEW_DEBOUNCE_MS : RESET_DEBOUNCE_MS;

    debounceTimerRef.current = setTimeout(() => {
      if (!hasDisplayName) {
        setSlugPreview(null);
        setSimilarSkills([]);
        return;
      }
      void loadPreviewAndSimilarSkills(displayName, setSlugPreview, setSimilarSkills);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [displayName]);

  const clearSlugState = useCallback(() => {
    setSimilarSkills([]);
  }, []);

  return { slugPreview, similarSkills, clearSlugState };
}

async function loadPreviewAndSimilarSkills(
  name: string,
  setSlugPreview: (preview: SlugPreview | null) => void,
  setSimilarSkills: (skills: readonly SimilarSkill[]) => void,
): Promise<void> {
  try {
    const preview = await fetchSlugPreview(name);
    setSlugPreview(preview);

    const isSlugTaken = !preview.isAvailable;
    if (isSlugTaken) {
      const rawSkills = await fetchSimilarSkills(name);
      const rankedSkills = sortByRelevance(rawSkills, name);
      setSimilarSkills(rankedSkills);
    } else {
      setSimilarSkills([]);
    }
  } catch {
    setSlugPreview(null);
    setSimilarSkills([]);
  }
}
