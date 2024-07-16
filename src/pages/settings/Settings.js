import { useDispatch } from "react-redux";
import { SettingsSection, SettingsNavigate } from "./SettingsComponents";
import { TagsManager } from "./SettingTools";
import { useModal } from "../../context/ModalContext.tsx";
import { restoreDefaultTags } from "../../data/store/slices/settingsSlice";

export default function Settings() {
    const tagsManagerModal = useModal();
    const dispatch = useDispatch();

    function openTagsManager() {
        tagsManagerModal.open({
            title: "Tags Manager",
            content: <TagsManager />,
            actions: [
                [
                    "Restore default tags",
                    () => dispatch(restoreDefaultTags()),
                    { closeOnClick: false, autoFocus: false },
                ],
                ["Cancel", () => tagsManagerModal.close(), { autoFocus: false }],
            ],
            id: "tags-manager",
        });
    }

    return (
        <div className="mx-auto max-w-[50rem]">
            <h1>Settings</h1>

            <SettingsNavigate onClick={openTagsManager}>Manage tags</SettingsNavigate>

            <SettingsSection>
                <SettingsNavigate to="/about">About CiteEase</SettingsNavigate>
                <SettingsNavigate to="/terms">Terms of Use</SettingsNavigate>
                <SettingsNavigate to="/privacy">Privacy Policy</SettingsNavigate>
            </SettingsSection>
        </div>
    );
}
