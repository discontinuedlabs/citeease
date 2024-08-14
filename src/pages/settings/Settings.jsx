import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IconsManager, TagsManager } from "./SettingTools";
import { useModal } from "../../context/ModalContext.tsx";
import { restoreDefaultIcons, restoreDefaultTags } from "../../data/store/slices/settingsSlice";
import { List, TopBar } from "../../components/ui/MaterialComponents";

export default function Settings() {
    const tagsManagerModal = useModal();
    const iconsManagerModal = useModal();
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    function openIconsManager() {
        iconsManagerModal.open({
            title: "Icons Manager",
            content: <IconsManager />,
            actions: [
                [
                    "Restore default icons",
                    () => dispatch(restoreDefaultIcons()),
                    { closeOnClick: false, autoFocus: false },
                ],
                ["Cancel", () => iconsManagerModal.close(), { autoFocus: false }],
            ],
        });
    }

    return (
        <div className="mx-auto max-w-[50rem]">
            <TopBar headline="Settings" />

            <List
                items={[
                    { title: "Manage tags", onClick: openTagsManager },
                    { title: "Manage icons", onClick: openIconsManager },
                    "DIVIDER",
                    { title: "About CiteEase", onClick: () => navigate("/about") },
                    { title: "Terms of Use", onClick: () => navigate("/terms") },
                    { title: "Privacy Policy", onClick: () => navigate("/privacy") },
                ]}
            />
        </div>
    );
}
