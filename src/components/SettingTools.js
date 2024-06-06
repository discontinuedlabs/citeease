import { useDispatch, useSelector } from "react-redux";
import { TAG_COLORS, TAG_COLOR_VALUES, addTag, deleteTag, restoreDefaultTags } from "../store/slices/settingsSlice";
import Tag from "./ui/Tag";
import { useState } from "react";
import { nanoid } from "nanoid";
import { useTagBgColor } from "../hooks/hooks.ts";

export function TagsManager(props) {
    const { setTagsManagerVisible: setIsVisible } = props;
    const settings = useSelector((state) => state.settings);
    const [tagLabel, setTagLabel] = useState("");
    const [tagColor, setTagColor] = useState(TAG_COLORS.YELLOW);
    const dispatch = useDispatch();
    const [tagIdleColor] = useTagBgColor(tagColor);

    function addTagToBib(event) {
        event.preventDefault();
        if (!/^\s*$/.test(tagLabel)) {
            dispatch(addTag({ tag: { label: tagLabel, color: tagColor, id: nanoid() } }));
            setTagLabel("");
        }
    }

    return (
        <div>
            <button onClick={() => setIsVisible(false)}>X</button>
            <div className="flex gap-1 flex-wrap">
                {settings.tags?.map((tag, index) => {
                    return (
                        <Tag key={index} tagProps={tag} showX onClick={() => dispatch(deleteTag({ tagId: tag.id }))} />
                    );
                })}
            </div>
            <form onSubmit={addTagToBib}>
                <input
                    className="rounded-md p-2"
                    style={{
                        border: `solid 0.1rem ${TAG_COLOR_VALUES[tagColor]}`,
                        backgroundColor: tagIdleColor,
                        color: TAG_COLOR_VALUES[tagColor],
                    }}
                    type="text"
                    placeholder="Tag label"
                    value={tagLabel}
                    onChange={(event) => setTagLabel(event.target.value)}
                />
                <button type="submit">Add tag</button>
                <div className="flex gap-1 flex-wrap">
                    {Object.values(TAG_COLORS)?.map((color, index) => (
                        <button
                            className="rounded-full w-5 h-5"
                            type="button"
                            key={index}
                            style={{ backgroundColor: TAG_COLOR_VALUES[color] }}
                            onClick={() => setTagColor(color)}
                        ></button>
                    ))}
                </div>
            </form>
            <button onClick={() => dispatch(restoreDefaultTags())}>Restore default tags</button>
        </div>
    );
}
