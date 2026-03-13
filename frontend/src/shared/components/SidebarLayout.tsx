import type { ReactNode } from 'react';
import './SidebarLayout.css';

interface SidebarLayoutProps {
  readonly sidebar: ReactNode;
  readonly children: ReactNode;
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="sidebar-layout">
      <aside className="sidebar-layout-sidebar">
        <div className="sidebar-layout-sidebar-inner">
          {sidebar}
        </div>
      </aside>
      <div className="sidebar-layout-content">
        {children}
      </div>
    </div>
  );
}
