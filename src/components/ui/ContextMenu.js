import { useState } from "react";
import { MechanicButton, SmallButton } from "./StyledButtons";
import "../../css/ContextMenu.css";

export default function ContextMenu(props) {
    const { label, icon, options, buttonType, menuStyle, buttonStyle } = props;
    const [hidden, setHidden] = useState(true);

    const buttonProps = {
        label,
        icon,
        buttonStyle,
        onClick: toggleVisibility,
    };
    const buttonTypes = {
        mechanicButton: <MechanicButton {...buttonProps} />,
        smallButton: <SmallButton {...buttonProps} />,
    };

    function toggleVisibility() {
        setHidden((prevHidden) => !prevHidden);
    }

    return (
        <div className="context-menu-container">
            {buttonTypes[buttonType] || buttonTypes.mechanicButton}

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
