import { useDispatch, useSelector } from "react-redux";
import { SettingsSection, SettingsNavigate, SettingsButton, SettingsCheckButton } from "./ui/SettingsComponents";

export default function Settings(props) {
    const settings = useSelector((state) => state.settings);
    const dispatch = useDispatch();

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
