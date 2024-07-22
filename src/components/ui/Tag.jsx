import { TAG_COLOR_VALUES } from "../../data/store/slices/settingsSlice";
import { getGradient, getTagBgColors } from "../../utils/uiUtils.ts";
import Icon from "./Icon";

export default function Tag(props) {
    const { className, tagProps, onClick, showX } = props;
    const [bgIdleColor, bgHoverColor, bgClickColor] = getTagBgColors(tagProps?.color);

    return (
        <div className={`rounded-md bg-white ${className}`}>
            {/* eslint-disable no-param-reassign, no-return-assign */}
            <button
                type="button"
                className={`flex items-center gap-1 rounded-md p-1 font-bold transition duration-150 ease-in-out ${className}`}
                style={{
                    border: `${TAG_COLOR_VALUES[tagProps?.color]} solid 2px`,
                    color: TAG_COLOR_VALUES[tagProps?.color],
                    background: `linear-gradient(to bottom, ${getGradient(bgIdleColor)[0]}, ${getGradient(bgIdleColor)[1]}`,
                }}
                onMouseEnter={(event) =>
                    (event.currentTarget.style.background = `linear-gradient(to bottom, ${getGradient(bgHoverColor)[0]}, ${getGradient(bgHoverColor)[1]}`)
                }
                onMouseLeave={(event) =>
                    (event.currentTarget.style.background = `linear-gradient(to bottom, ${getGradient(bgIdleColor)[0]}, ${getGradient(bgIdleColor)[1]}`)
                }
                onTouchStart={(event) =>
                    (event.currentTarget.style.background = `linear-gradient(to bottom, ${getGradient(bgClickColor)[0]}, ${getGradient(bgClickColor)[1]}`)
                }
                onTouchEnd={(event) =>
                    (event.currentTarget.style.background = `linear-gradient(to bottom, ${getGradient(bgIdleColor)[0]}, ${getGradient(bgIdleColor)[1]}`)
                }
                onMouseDown={(event) =>
                    (event.currentTarget.style.background = `linear-gradient(to bottom, ${getGradient(bgClickColor)[0]}, ${getGradient(bgClickColor)[1]}`)
                }
                onMouseUp={(event) =>
                    (event.currentTarget.style.background = `linear-gradient(to bottom, ${getGradient(bgIdleColor)[0]}, ${getGradient(bgIdleColor)[1]}`)
                }
                onClick={() => (onClick ? onClick(tagProps) : "")}
            >
                {tagProps.label}
                {showX && <Icon className="align-middle text-sm" name="close" />}
            </button>
        </div>
    );
}
