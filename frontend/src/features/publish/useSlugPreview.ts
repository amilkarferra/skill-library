import { useState, useEffect, useRef, useCallback } from 'react';
import type { SlugPreview } from '../../shared/models/SlugPreview';
import type { SimilarSkill } from '../../shared/models/SimilarSkill';
import { fetchSlugPreview, fetchSimilarSkills } from './publish.service';

const SLUG_PREVIEW_DEBOUNCE_MS = 500;

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
    const hasDisplayName = displayName.trim().length > 0;
    if (!hasDisplayName) {
      setSlugPreview(null);
      setSimilarSkills([]);
      return;
    }

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void loadSlugPreviewAndSimilarSkills(displayName);
    }, SLUG_PREVIEW_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [displayName]);

  const loadSlugPreviewAndSimilarSkills = async (name: string): Promise<void> => {
    try {
      const preview = await fetchSlugPreview(name);
      setSlugPreview(preview);

      const isSlugTaken = !preview.isAvailable;
      if (isSlugTaken) {
        const skills = await fetchSimilarSkills(name);
        setSimilarSkills(skills);
      } else {
        setSimilarSkills([]);
      }
    } catch {
      setSlugPreview(null);
      setSimilarSkills([]);
    }
  };

  const clearSlugState = useCallback(() => {
    setSimilarSkills([]);
  }, []);

  return { slugPreview, similarSkills, clearSlugState };
}
