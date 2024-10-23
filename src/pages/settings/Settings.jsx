import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconsManager, TagsManager } from "../../components/settingsTools";
import { updateSettingsField } from "../../data/store/slices/settingsSlice";
import { List, Select, TopBar } from "../../components/ui/MaterialComponents";
import { useDialog } from "../../context/DialogContext.tsx";
import { useEnhancedDispatch, useTheme } from "../../hooks/hooks.tsx";
import defaults from "../../assets/json/defaults.json";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
    const { data: settings } = useSelector((state) => state.settings);
    const tagsManagerDialog = useDialog();
    const iconsManagerDialog = useDialog();
    const dispatch = useEnhancedDispatch();
    const navigate = useNavigate();
    const setTheme = useTheme()[1];
    const { currentUser } = useAuth();

    function openTagsManager() {
        tagsManagerDialog.show({
            headline: "Manage tags",
            content: <TagsManager />,
            actions: [["Cancel", () => tagsManagerDialog.close()]],
        });
    }

    function openIconsManager() {
        iconsManagerDialog.show({
            headline: "Manage icons",
            content: <IconsManager />,
            actions: [["Cancel", () => iconsManagerDialog.close()]],
        });
    }

    return (
        <div className={defaults.classes.page}>
            <TopBar headline="Settings" />

            <List
                items={[
                    ...(currentUser
                        ? [{ title: "Manage account", onClick: () => navigate("/account") }, "DIVIDER"]
                        : []),
                    {
                        title: "Theme",
                        end: (
                            <Select
                                value={settings?.theme}
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
