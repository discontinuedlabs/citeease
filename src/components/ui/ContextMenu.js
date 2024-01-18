import { useState } from "react";
import { MechanicButton, SmallButton } from "./StyledButtons";

export default function ContextMenu(props) {
    const { label, icon, options, buttonType, menuStyle, buttonStyle } = props;
    const [hidden, setHidden] = useState(true);

    const buttonProps = {
        label,
        icon,
        toggleVisibility,
        buttonStyle,
    };
    const BUTTON_TYPES = {
        mechanicButton: MechanicButton(buttonProps),
        smallButton: SmallButton(buttonProps),
    };

    function toggleVisibility() {
        setHidden((prevHidden) => !prevHidden);
    }

    return (
        <div className="context-menu-container">
            {BUTTON_TYPES[buttonType] || BUTTON_TYPES.mechanicButton}

            {!hidden && (
                <div className="context-menu" style={{ ...menuStyle }}>
                    {options &&
                        options.map((option) => (
                            <button
                                className="context-menu-option"
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
