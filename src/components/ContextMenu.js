import { useState } from "react";

export default function ContextMenu(props) {
    const { label, options, color, style } = props;
    const [hidden, setHidden] = useState(true);

    function toggleVisibility() {
        setHidden((prevHidden) => !prevHidden);
    }

    return (
        <div className="context-menu-container">
            <button className="context-menu-button" onClick={toggleVisibility}>
                {label}
            </button>
            {!hidden && (
                <div className="context-menu" style={style}>
                    {options.map((option) => (
                        <button
                            className="option-button"
                            onClick={(event) => {
                                option.method(event);
                                setHidden(true);
                            }}
                            key={option.label}
                            style={option.style}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
