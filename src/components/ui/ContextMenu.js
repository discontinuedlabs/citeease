import { useState } from "react";
import Button from "./Button";

export default function ContextMenu(props) {
    const { label, options, color, menuStyle } = props;
    const [hidden, setHidden] = useState(true);

    function toggleVisibility() {
        setHidden((prevHidden) => !prevHidden);
    }

    return (
        <div className="context-menu-container">
            <Button label={label} onClick={toggleVisibility} />

            {!hidden && (
                <div className="context-menu" style={{ ...menuStyle }}>
                    {options.map((option) => (
                        <button
                            className="option-button"
                            onClick={(event) => {
                                option.method(event);
                                setHidden(true);
                            }}
                            key={option.label}
                            style={{ ...option.style }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
