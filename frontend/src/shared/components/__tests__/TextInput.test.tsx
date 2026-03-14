import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '../TextInput';

const PLACEHOLDER_TEXT = 'Enter your name';

describe('TextInput', () => {
  it('should render with placeholder', () => {
    render(
      <TextInput value="" onChange={vi.fn()} placeholder={PLACEHOLDER_TEXT} />
    );
    expect(screen.getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
  });

  it('should display current value', () => {
    const currentValue = 'hello';
    render(<TextInput value={currentValue} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue(currentValue)).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TextInput value="" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should apply text type by default', () => {
    render(<TextInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('should apply narrow class when isNarrow is true', () => {
    render(<TextInput value="" onChange={vi.fn()} isNarrow />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('text-input--narrow');
  });

  it('should not apply narrow class by default', () => {
    render(<TextInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input.className).not.toContain('text-input--narrow');
  });

  it('should set required attribute when required is true', () => {
    render(<TextInput value="" onChange={vi.fn()} required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('should set id attribute when provided', () => {
    const inputId = 'username-input';
    render(<TextInput id={inputId} value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', inputId);
  });
});
