import { useMemo } from 'react';
import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { EmptyState } from '../../shared/components/EmptyState';
import './OverviewTab.css';

interface OverviewTabProps {
  readonly markdownContent: string;
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

export function OverviewTab({ markdownContent }: OverviewTabProps) {
  const safeContent = useMemo(() => markdownContent ?? '', [markdownContent]);
  const hasContent = safeContent.trim().length > 0;

  if (!hasContent) {
    return (
      <div className="overview-tab">
        <EmptyState
          title="No content available"
          description="No skill file has been uploaded yet."
        />
      </div>
    );
  }

  return (
    <div className="overview-tab">
      <div className="overview-content">
        <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
          {safeContent}
        </Markdown>
      </div>
    </div>
  );
}
