import { useDispatch, useSelector } from "react-redux";
import { TAG_COLORS, TAG_COLOR_VALUES, deleteTag } from "../store/slices/settingsSlice";
import Tag from "./ui/Tag";
import { useState } from "react";
import { nanoid } from "nanoid";

export function TagsManager(props) {
    const { setTagsManagerVisible: setIsVisible } = props;
    const settings = useSelector((state) => state.settings);
    const [tagLabel, setTagLabel] = useState("");
    const [tagColor, setTagColor] = useState("");
    const dispatch = useDispatch();

    function addTagToBib() {
        dispatch({ tag: { label: tagLabel, color: tagColor, id: nanoid() } });
    }

    return (
        <div>
            <button onClick={() => setIsVisible(false)}>X</button>
            <div className="flex gap-1 flex-wrap">
                {settings.tags?.map((tag, index) => {
                    return <Tag key={index} tagProps={tag} showX onClick={dispatch(deleteTag({ tagId: tag.id }))} />;
                })}
            </div>
            <form onSubmit={addTagToBib}>
                <input
                    type="text"
                    placeholder="Tag label"
                    value={tagLabel}
                    onChange={(event) => setTagLabel(event.target.value)}
                />
                <button type="submit">Add tag</button>
                <div>
                    {TAG_COLORS.map((color) => {
                        return (
                            <button
                                style={{ backgroundColor: TAG_COLOR_VALUES[color] }}
                                onClick={() => setTagColor(color)}
                            ></button>
                        );
                    })}
                </div>
            </form>
        </div>
    );
}
