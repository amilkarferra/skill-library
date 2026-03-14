import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../TabBar';

const OVERVIEW_TAB_ID = 'overview';
const VERSIONS_TAB_ID = 'versions';
const COMMENTS_TAB_ID = 'comments';

const SAMPLE_TABS = [
  { id: OVERVIEW_TAB_ID, label: 'Overview' },
  { id: VERSIONS_TAB_ID, label: 'Versions' },
  { id: COMMENTS_TAB_ID, label: 'Comments' },
] as const;

describe('TabBar', () => {
  it('should render all tab labels', () => {
    render(
      <TabBar tabs={SAMPLE_TABS} activeTabId={OVERVIEW_TAB_ID} onSelectTab={vi.fn()} />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Versions')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('should apply active class to selected tab', () => {
    render(
      <TabBar tabs={SAMPLE_TABS} activeTabId={VERSIONS_TAB_ID} onSelectTab={vi.fn()} />
    );

    const activeButton = screen.getByText('Versions');
    expect(activeButton.className).toContain('tab-bar-button--active');
  });

  it('should not apply active class to unselected tabs', () => {
    render(
      <TabBar tabs={SAMPLE_TABS} activeTabId={OVERVIEW_TAB_ID} onSelectTab={vi.fn()} />
    );

    const inactiveButton = screen.getByText('Versions');
    expect(inactiveButton.className).not.toContain('tab-bar-button--active');
  });

  it('should call onSelectTab with tab id when clicked', async () => {
    const handleSelectTab = vi.fn();
    const user = userEvent.setup();

    render(
      <TabBar tabs={SAMPLE_TABS} activeTabId={OVERVIEW_TAB_ID} onSelectTab={handleSelectTab} />
    );

    await user.click(screen.getByText('Comments'));
    expect(handleSelectTab).toHaveBeenCalledWith(COMMENTS_TAB_ID);
  });

  it('should display count in label when provided', () => {
    const tabsWithCount = [
      { id: COMMENTS_TAB_ID, label: 'Comments', count: 5 },
    ];

    render(
      <TabBar tabs={tabsWithCount} activeTabId={COMMENTS_TAB_ID} onSelectTab={vi.fn()} />
    );

    expect(screen.getByText('Comments (5)')).toBeInTheDocument();
  });

  it('should not display count when count is undefined', () => {
    const tabsWithoutCount = [
      { id: OVERVIEW_TAB_ID, label: 'Overview' },
    ];

    render(
      <TabBar tabs={tabsWithoutCount} activeTabId={OVERVIEW_TAB_ID} onSelectTab={vi.fn()} />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });
});
