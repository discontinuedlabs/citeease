import { useDispatch, useSelector } from "react-redux";
import { SettingsSection, SettingsNavigate } from "./ui/SettingsComponents";
import { useEffect, useState } from "react";
import { loadFromIndexedDB } from "../store/slices/settingsSlice";
import { TagsManager } from "./SettingTools";

export default function Settings() {
    const settings = useSelector((state) => state.settings);
    const [tagsManagerVisible, setTagsManagerVisible] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadFromIndexedDB());
    }, [dispatch]);

    function openTagsManager() {
        setTagsManagerVisible(true);
    }

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            <SettingsNavigate onClick={openTagsManager}>Manage tags</SettingsNavigate>

            <SettingsSection>
                <SettingsNavigate to="/about">About CiteEase</SettingsNavigate>
                <SettingsNavigate to="/terms">Terms of Use</SettingsNavigate>
                <SettingsNavigate to="/privacy">Privacy Policy</SettingsNavigate>
            </SettingsSection>

            {tagsManagerVisible && <TagsManager {...{ setTagsManagerVisible }} />}
        </div>
    );
}
