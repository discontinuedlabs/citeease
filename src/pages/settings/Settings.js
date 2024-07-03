import { useState } from "react";
import { SettingsSection, SettingsNavigate } from "./SettingsComponents";
import { TagsManager } from "./SettingTools";

export default function Settings() {
    const [tagsManagerVisible, setTagsManagerVisible] = useState(false);

    function openTagsManager() {
        setTagsManagerVisible(true);
    }

    return (
        <div className="mx-auto max-w-[50rem]">
            <h1>Settings</h1>

            <SettingsNavigate onClick={() => openTagsManager()}>Manage tags</SettingsNavigate>

            <SettingsSection>
                <SettingsNavigate to="/about">About CiteEase</SettingsNavigate>
                <SettingsNavigate to="/terms">Terms of Use</SettingsNavigate>
                <SettingsNavigate to="/privacy">Privacy Policy</SettingsNavigate>
            </SettingsSection>

            {tagsManagerVisible && <TagsManager {...{ setTagsManagerVisible }} />}
        </div>
    );
}
