import { useState } from "react";
import { MechanicButton, SmallButton, ContextMenuOption } from "./StyledButtons";
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
                <div className="context-menu-overlay" onClick={toggleVisibility}>
                    <div className="context-menu" style={{ ...menuStyle }}>
                        {options &&
                            options.map((option) => {
                                if (/devider/i.test(option)) {
                                    return <hr className="solid" />;
                                }

                                return (
                                    <ContextMenuOption
                                        onClick={(event) => {
                                            option.method(event);
                                            setHidden(true);
                                        }}
                                        key={option?.label}
                                        buttonStyle={{ ...option?.style }}
                                        icon={option?.icon}
                                        label={option?.label}
                                    ></ContextMenuOption>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
