import { ACTIONS as SETTINGS_ACTIONS } from "./slices/settingsSlice";
import { SettingsSection, SettingsNavigate, SettingsButton, SettingsCheckButton } from "./ui/SettingsComponents";

export default function Settings(props) {
    const { settings, settingsDispatch } = props;

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            <SettingsSection>
                <SettingsNavigate label="About CiteEase" to="/about" />
                <SettingsNavigate label="Terms of Use" to="/terms" />
                <SettingsNavigate label="Privacy Policy" to="/privacy" />
            </SettingsSection>
        </div>
    );
}
