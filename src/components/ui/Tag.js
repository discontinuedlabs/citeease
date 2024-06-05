export default function Tag(props) {
    const { tagProps, onClick, showX } = props;

    const TAG_BG_IDLE_TRANSPARENCY = 0.2;
    const TAG_BG_HOVER_TRANSPARENCY = 0.3;
    const TAG_BG_CLICK_TRANSPARENCY = 0.4;

    const bgIdleColor = `rgba(${tagProps?.color?.slice(4, -1)}, ${TAG_BG_IDLE_TRANSPARENCY})`;
    const bgHoverColor = `rgba(${tagProps?.color?.slice(4, -1)}, ${TAG_BG_HOVER_TRANSPARENCY})`;
    const bgClickColor = `rgba(${tagProps?.color?.slice(4, -1)}, ${TAG_BG_CLICK_TRANSPARENCY})`;

    return (
        <button
            className="flex gap-1 font-bold p-1 rounded-md"
            style={{
                border: `${tagProps.color} solid 2px`,
                color: tagProps.color,
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
    );
}
