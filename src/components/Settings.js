import ContextMenu from "./ui/ContextMenu";
import { ACTIONS as SETTINGS_ACTIONS } from "./reducers/settingsReducer";
// import { useNavigate } from "react-router-dom";

export const FONTS = [
    { name: "Default", family: "unset" },
    { name: "Georgia", family: "Georgia" },
    {
        name: "System Font",
        family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    },
    { name: "Times New Roman", family: "Times New Roman" },
];

export default function Settings(props) {
    const { settings, settingsDispatch } = props;
    // const navigate = useNavigate();

    return (
        <div className="settings-page">
            <h1>Settings</h1>
            <p>Font</p>
            <ContextMenu
                style={{ fontFamily: settings?.font?.family }}
                label={settings?.font?.name}
                options={FONTS.map((font) => ({
                    label: font.name,
                    method: () => settingsDispatch({ type: SETTINGS_ACTIONS.CHANGE_FONT, payload: { font: font } }),
                    style: { fontFamily: font.family },
                }))}
            />

            {/* <button onClick={() => navigate("/about")}>About CiteEase</button>
            <button onClick={() => navigate("/terms")}>Terms</button>
            <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button> */}
        </div>
    );
}
