import { TAG_COLOR_VALUES } from "../../data/store/slices/settingsSlice";
import { getGradient, getTagBgColors } from "../../utils/uiUtils.ts";

export default function Tag(props) {
    const { tagProps, onClick, showX } = props;
    const [bgIdleColor, bgHoverColor, bgClickColor] = getTagBgColors(tagProps?.color);

    return (
        <div className="rounded-md bg-white">
            {/* eslint-disable no-param-reassign, no-return-assign */}
            <button
                type="button"
                className="flex gap-1 rounded-md p-1 font-bold transition duration-150 ease-in-out"
                style={{
                    border: `${TAG_COLOR_VALUES[tagProps?.color]} solid 2px`,
                    color: TAG_COLOR_VALUES[tagProps?.color],
                    background: getGradient(bgIdleColor),
                }}
                onMouseEnter={(event) => (event.currentTarget.style.background = getGradient(bgHoverColor))}
                onMouseLeave={(event) => (event.currentTarget.style.background = getGradient(bgIdleColor))}
                onTouchStart={(event) => (event.currentTarget.style.background = getGradient(bgClickColor))}
                onTouchEnd={(event) => (event.currentTarget.style.background = getGradient(bgIdleColor))}
                onMouseDown={(event) => (event.currentTarget.style.background = getGradient(bgClickColor))}
                onMouseUp={(event) => (event.currentTarget.style.background = getGradient(bgIdleColor))}
                onClick={() => (onClick ? onClick(tagProps) : "")}
            >
                {tagProps.label}
                {showX && <div>X</div>}
            </button>
        </div>
    );
}
