import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IconsManager, TagsManager } from "./SettingTools";
import { restoreDefaultIcons, restoreDefaultTags } from "../../data/store/slices/settingsSlice";
import { List, TopBar } from "../../components/ui/MaterialComponents";
import { useDialog } from "../../context/DialogContext.tsx";

export default function Settings() {
    const tagsManagerDialog = useDialog();
    const iconsManagerDialog = useDialog();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function openTagsManager() {
        tagsManagerDialog.show({
            title: "Tags Manager",
            content: <TagsManager />,
            actions: [
                ["Restore default tags", () => dispatch(restoreDefaultTags())],
                ["Cancel", () => tagsManagerDialog.close()],
            ],
            id: "tags-manager",
        });
    }

    function openIconsManager() {
        iconsManagerDialog.show({
            title: "Icons Manager",
            content: <IconsManager />,
            actions: [
                [
                    "Restore default icons",
                    () => dispatch(restoreDefaultIcons()),
                    { closeOnClick: false, autoFocus: false },
                ],
                ["Cancel", () => iconsManagerDialog.close()],
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
