import { useMemo } from 'react';
import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { EmptyState } from '../../shared/components/EmptyState';
import './OverviewTab.css';

interface OverviewTabProps {
  readonly longDescription: string;
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

export function OverviewTab({ longDescription }: OverviewTabProps) {
  const safeDescription = useMemo(() => longDescription ?? '', [longDescription]);
  const hasContent = safeDescription.trim().length > 0;

  if (!hasContent) {
    return (
      <div className="overview-tab">
        <EmptyState
          title="No description available"
          description="The skill owner has not provided a detailed description yet."
        />
      </div>
    );
  }

  return (
    <div className="overview-tab">
      <div className="overview-content">
        <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
          {safeDescription}
        </Markdown>
      </div>
    </div>
  );
}
