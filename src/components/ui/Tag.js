import { useTagBgColor } from "../../hooks/hooks.ts";
import { TAG_COLOR_VALUES } from "../../data/store/slices/settingsSlice";

export default function Tag(props) {
    const { tagProps, onClick, showX } = props;
    const [bgIdleColor, bgHoverColor, bgClickColor] = useTagBgColor(tagProps?.color);

    return (
        <div className="bg-white rounded-md">
            <button
                className="flex gap-1 font-bold p-1 rounded-md transition duration-150 ease-in-out"
                style={{
                    border: `${TAG_COLOR_VALUES[tagProps?.color]} solid 2px`,
                    color: TAG_COLOR_VALUES[tagProps?.color],
                    backgroundColor: bgIdleColor,
                }}
                onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = bgHoverColor)}
                onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = bgIdleColor)}
                onTouchStart={(event) => (event.currentTarget.style.backgroundColor = bgClickColor)}
                onTouchEnd={(event) => (event.currentTarget.style.backgroundColor = bgIdleColor)}
                onMouseDown={(event) => (event.currentTarget.style.backgroundColor = bgClickColor)}
                onMouseUp={(event) => (event.currentTarget.style.backgroundColor = bgIdleColor)}
                onClick={() => (onClick ? onClick(tagProps) : "")}
            >
                {tagProps.label}
                {showX && <div>X</div>}
            </button>
        </div>
    );
}
