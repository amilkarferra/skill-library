import type { ChangeEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly rows?: number;
}

type MarkdownSyntaxType =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'list'
  | 'ordered-list'
  | 'code'
  | 'link';

interface SyntaxInsertResult {
  readonly newValue: string;
  readonly newCursorPosition: number;
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

function getLineStart(value: string, cursorPosition: number): number {
  let lineStart = cursorPosition;
  while (lineStart > 0 && value[lineStart - 1] !== '\n') {
    lineStart -= 1;
  }
  return lineStart;
}

function getSelection(element: HTMLTextAreaElement): {
  readonly start: number;
  readonly end: number;
  readonly selectedText: string;
} {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  const selectedText = element.value.substring(start, end);
  return { start, end, selectedText };
}

function insertMarkdownSyntax(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  syntaxType: MarkdownSyntaxType
): SyntaxInsertResult {
  const selectedText = value.substring(selectionStart, selectionEnd);

  if (syntaxType === 'bold') {
    const newText = `**${selectedText}**`;
    const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
    return {
      newValue,
      newCursorPosition: selectionStart + newText.length,
    };
  }

  if (syntaxType === 'italic') {
    const newText = `_${selectedText}_`;
    const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
    return {
      newValue,
      newCursorPosition: selectionStart + newText.length,
    };
  }

  if (syntaxType === 'code') {
    const newText = `\`${selectedText}\``;
    const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
    return {
      newValue,
      newCursorPosition: selectionStart + newText.length,
    };
  }

  if (syntaxType === 'link') {
    const placeholder = selectedText || 'text';
    const newText = `[${placeholder}](url)`;
    const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
    return {
      newValue,
      newCursorPosition: selectionStart + newText.length,
    };
  }

  const linePrefixMap: Record<string, string> = {
    'h1': '# ',
    'h2': '## ',
    'list': '- ',
    'ordered-list': '1. ',
  };

  const syntaxPrefix = linePrefixMap[syntaxType];
  const hasSyntaxPrefix = syntaxPrefix !== undefined;
  if (!hasSyntaxPrefix) {
    return { newValue: value, newCursorPosition: selectionStart };
  }

  return insertLinePrefixSyntax(
    value, selectionStart, selectedText, syntaxPrefix
  );
}

function insertLinePrefixSyntax(
  value: string,
  selectionStart: number,
  selectedText: string,
  syntaxPrefix: string
): SyntaxInsertResult {
  const lineStart = getLineStart(value, selectionStart);
  const linePrefix = value.substring(lineStart, selectionStart);
  const isAtLineStart = linePrefix.trim() === '';

  if (isAtLineStart) {
    const newValue =
      value.substring(0, lineStart) + syntaxPrefix + value.substring(selectionStart);
    return {
      newValue,
      newCursorPosition: lineStart + syntaxPrefix.length + selectedText.length,
    };
  }

  const newValue =
    value.substring(0, lineStart) + syntaxPrefix + value.substring(lineStart);
  return {
    newValue,
    newCursorPosition: selectionStart + syntaxPrefix.length,
  };
}

function setCursorPosition(element: HTMLTextAreaElement, position: number): void {
  element.setSelectionRange(position, position);
  element.focus();
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 6,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>): void => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const applySyntax = useCallback(
    (syntaxType: MarkdownSyntaxType): void => {
      if (!textareaRef.current) {
        return;
      }

      const { start, end } = getSelection(textareaRef.current);
      const { newValue, newCursorPosition } = insertMarkdownSyntax(
        value,
        start,
        end,
        syntaxType
      );

      onChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          setCursorPosition(textareaRef.current, newCursorPosition);
        }
      }, 0);
    },
    [value, onChange]
  );

  const handleInsertBold = useCallback(() => applySyntax('bold'), [applySyntax]);
  const handleInsertItalic = useCallback(() => applySyntax('italic'), [applySyntax]);
  const handleInsertHeading1 = useCallback(() => applySyntax('h1'), [applySyntax]);
  const handleInsertHeading2 = useCallback(() => applySyntax('h2'), [applySyntax]);
  const handleInsertList = useCallback(() => applySyntax('list'), [applySyntax]);
  const handleInsertOrderedList = useCallback(
    () => applySyntax('ordered-list'),
    [applySyntax]
  );
  const handleInsertCode = useCallback(() => applySyntax('code'), [applySyntax]);
  const handleInsertLink = useCallback(() => applySyntax('link'), [applySyntax]);
  const handleSelectWriteTab = useCallback(() => setActiveTab('write'), []);
  const handleSelectPreviewTab = useCallback(() => setActiveTab('preview'), []);

  const isWriteTabActive = activeTab === 'write';
  const isPreviewTabActive = activeTab === 'preview';

  const writeTabClassName = isWriteTabActive
    ? 'markdown-editor-tab markdown-editor-tab--active'
    : 'markdown-editor-tab';

  const previewTabClassName = isPreviewTabActive
    ? 'markdown-editor-tab markdown-editor-tab--active'
    : 'markdown-editor-tab';

  return (
    <div>
      <div className="markdown-editor-toolbar">
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertBold}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertItalic}
          title="Italic"
        >
          _I_
        </button>
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertHeading1}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertHeading2}
          title="Heading 2"
        >
          H2
        </button>

        <div className="markdown-editor-separator" />

        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertList}
          title="Bullet list"
        >
          List
        </button>
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertOrderedList}
          title="Ordered list"
        >
          1.
        </button>
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertCode}
          title="Inline code"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          className="markdown-editor-action"
          onClick={handleInsertLink}
          title="Link"
        >
          Link
        </button>

        <div className="markdown-editor-tabs">
          <button
            type="button"
            className={writeTabClassName}
            onClick={handleSelectWriteTab}
          >
            Write
          </button>
          <button
            type="button"
            className={previewTabClassName}
            onClick={handleSelectPreviewTab}
          >
            Preview
          </button>
        </div>
      </div>

      {isWriteTabActive && (
        <textarea
          ref={textareaRef}
          className="markdown-editor-textarea"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={rows}
        />
      )}

      {isPreviewTabActive && (
        <div className="markdown-editor-preview">
          <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
            {value || placeholder || ''}
          </Markdown>
        </div>
      )}
    </div>
  );
}
