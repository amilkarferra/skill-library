import { useCallback } from 'react';
import './TabBar.css';

interface TabDefinition {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

interface TabBarProps {
  readonly tabs: readonly TabDefinition[];
  readonly activeTabId: string;
  readonly onSelectTab: (tabId: string) => void;
}

interface TabBarButtonProps {
  readonly tab: TabDefinition;
  readonly isActive: boolean;
  readonly onSelect: (tabId: string) => void;
}

function TabBarButton({ tab, isActive, onSelect }: TabBarButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(tab.id);
  }, [onSelect, tab.id]);

  const buttonClassName = isActive
    ? 'tab-bar-button tab-bar-button--active'
    : 'tab-bar-button';

  const hasCount = tab.count !== undefined;
  const displayLabel = hasCount
    ? `${tab.label} (${tab.count})`
    : tab.label;

  return (
    <button className={buttonClassName} onClick={handleClick}>
      {displayLabel}
    </button>
  );
}

export function TabBar({ tabs, activeTabId, onSelectTab }: TabBarProps) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <TabBarButton
            key={tab.id}
            tab={tab}
            isActive={isActive}
            onSelect={onSelectTab}
          />
        );
      })}
    </div>
  );
}
