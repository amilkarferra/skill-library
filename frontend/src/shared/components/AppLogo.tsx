import './AppLogo.css';

interface AppLogoProps {
  size: number;
}

const LOGO_SOURCE = '/logo-icon.svg';
const LOGO_ALT_TEXT = 'Skill Library';

export function AppLogo({ size }: AppLogoProps) {
  return (
    <img
      src={LOGO_SOURCE}
      alt={LOGO_ALT_TEXT}
      className="app-logo"
      style={{ width: size, height: size }}
    />
  );
}
