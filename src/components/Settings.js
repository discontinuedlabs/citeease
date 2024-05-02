// import ContextMenu from "./ui/ContextMenu";
// import { ACTIONS as SETTINGS_ACTIONS } from "./reducers/settingsReducer";
// import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../utils";

export default function Settings(props) {
    useDocumentTitle("Settings");
    // const { settings, settingsDispatch } = props;
    // const navigate = useNavigate();

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            {/* <button onClick={() => navigate("/about")}>About CiteEase</button>
            <button onClick={() => navigate("/terms")}>Terms</button>
            <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button> */}
        </div>
    );
}
