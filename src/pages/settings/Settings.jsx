import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconsManager, TagsManager } from "./SettingTools";
import { restoreDefaultIcons, updateSettingsField } from "../../data/store/slices/settingsSlice";
import { List, Select, TopBar } from "../../components/ui/MaterialComponents";
import { useDialog } from "../../context/DialogContext.tsx";
import { useTheme } from "../../hooks/hooks.tsx";

export default function Settings() {
    const { data: settings } = useSelector((state) => state.settings);
    const tagsManagerDialog = useDialog();
    const iconsManagerDialog = useDialog();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const setTheme = useTheme()[1];

    function openTagsManager() {
        tagsManagerDialog.show({
            headline: "Manage tags",
            content: <TagsManager />,
            actions: [["Cancel", () => tagsManagerDialog.close()]],
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
                    {
                        title: "Theme",
                        end: (
                            <Select
                                value={settings.theme}
                                options={[
                                    { headline: "Auto", value: "auto" },
                                    { headline: "Light", value: "light" },
                                    { headline: "Dark", value: "dark" },
                                ]}
                                onChange={(event) => {
                                    dispatch(updateSettingsField({ key: "theme", value: event.target.value }));
                                    setTheme(event.target.value);
                                }}
                            />
                        ),
                    },
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
