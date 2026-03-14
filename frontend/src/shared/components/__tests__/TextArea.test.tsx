import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from '../TextArea';

const PLACEHOLDER_TEXT = 'Enter description';

describe('TextArea', () => {
  it('should render with placeholder', () => {
    render(<TextArea value="" onChange={vi.fn()} placeholder={PLACEHOLDER_TEXT} />);
    expect(screen.getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
  });

  it('should display current value', () => {
    const currentValue = 'Some text';
    render(<TextArea value={currentValue} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue(currentValue)).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TextArea value="" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should apply tall class when isTall is true', () => {
    render(<TextArea value="" onChange={vi.fn()} isTall />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).toContain('text-area--tall');
  });

  it('should not apply tall class by default', () => {
    render(<TextArea value="" onChange={vi.fn()} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).not.toContain('text-area--tall');
  });

  it('should set required attribute when required is true', () => {
    render(<TextArea value="" onChange={vi.fn()} required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('should display character counter when provided', () => {
    const characterCounter = { count: 50, limit: 200 };
    render(
      <TextArea value="" onChange={vi.fn()} characterCounter={characterCounter} />
    );
    expect(screen.getByText('50/200')).toBeInTheDocument();
  });

  it('should not display character counter when not provided', () => {
    const { container } = render(<TextArea value="" onChange={vi.fn()} />);
    expect(container.querySelector('.text-area-counter')).not.toBeInTheDocument();
  });

  it('should set maxLength attribute when provided', () => {
    const maxLength = 500;
    render(<TextArea value="" onChange={vi.fn()} maxLength={maxLength} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', String(maxLength));
  });
});
