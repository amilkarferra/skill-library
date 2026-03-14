import { render, screen } from '@testing-library/react';
import { AlertMessage } from '../AlertMessage';

const ALERT_TEXT = 'Something happened';

describe('AlertMessage', () => {
  it('should render children text', () => {
    render(<AlertMessage variant="error">{ALERT_TEXT}</AlertMessage>);
    expect(screen.getByRole('alert')).toHaveTextContent(ALERT_TEXT);
  });

  it('should have role alert for accessibility', () => {
    render(<AlertMessage variant="error">{ALERT_TEXT}</AlertMessage>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply error variant class', () => {
    render(<AlertMessage variant="error">{ALERT_TEXT}</AlertMessage>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('alert-message--error');
  });

  it('should apply success variant class', () => {
    render(<AlertMessage variant="success">{ALERT_TEXT}</AlertMessage>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('alert-message--success');
  });

  it('should apply warning variant class', () => {
    render(<AlertMessage variant="warning">{ALERT_TEXT}</AlertMessage>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('alert-message--warning');
  });

  it('should always include base class', () => {
    render(<AlertMessage variant="error">{ALERT_TEXT}</AlertMessage>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('alert-message');
  });
});
