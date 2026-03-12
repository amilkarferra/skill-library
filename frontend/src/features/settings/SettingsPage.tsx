import { Settings as SettingsIcon } from 'lucide-react';
import { ProfileSection } from './ProfileSection';
import { DangerZoneSection } from './DangerZoneSection';
import './SettingsPage.css';

export function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <div className="settings-page-badge">
          <SettingsIcon size={18} />
        </div>
        <div className="settings-page-copy">
          <span className="settings-page-kicker">Preferences</span>
          <h2 className="settings-page-title">Settings</h2>
          <p className="settings-page-subtitle">
            Manage your profile information and account-level actions.
          </p>
        </div>
      </div>
      <div className="settings-page-sections">
        <ProfileSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}
