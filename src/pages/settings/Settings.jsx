import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { TagsManager } from "./SettingTools";
import { useModal } from "../../context/ModalContext.tsx";
import { restoreDefaultTags } from "../../data/store/slices/settingsSlice";
import { List, TopBar } from "../../components/ui/MaterialComponents";

export default function Settings() {
    const tagsManagerModal = useModal();
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

    return (
        <div className="mx-auto max-w-[50rem]">
            <TopBar headline="Settings" />

            <List
                items={[
                    { title: "Manage tags", onClick: openTagsManager },
                    "DEVIDER",
                    { title: "About CiteEase", onClick: () => navigate("/about") },
                    { title: "Terms of Use", onClick: () => navigate("/terms") },
                    { title: "Privacy Policy", onClick: () => navigate("/privacy") },
                ]}
            />
        </div>
    );
}
