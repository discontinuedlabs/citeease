import { useState } from "react";
import { nanoid } from "nanoid";
import { MechanicButton, SmallButton, ContextMenuOption } from "./StyledButtons";
import "../../css/ContextMenu.css";

// TODO: Needs refactor

export default function ContextMenu(props) {
    const { label, icon, options, buttonType, menuStyle, buttonStyle } = props;
    const [visible, setVisible] = useState(false);

    function toggleVisibility() {
        setVisible((prevHidden) => !prevHidden);
    }

    const buttonProps = {
        label,
        icon,
        buttonStyle,
        onClick: toggleVisibility,
    };

    // TODO: Rename the buttons to kebab-case
    const buttonTypes = {
        /* eslint-disable react/jsx-props-no-spreading */
        "Mechanic Button": <MechanicButton {...buttonProps} />,
        "Small Button": <SmallButton {...buttonProps} />,
        "Context Menu Option": <ContextMenuOption {...buttonProps} />,
    };

    return (
        <div className="context-menu-container">
            {buttonTypes[buttonType] || buttonTypes["Mechanic Button"]}

            {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            {visible && (
                <div className="context-menu-overlay" onClick={() => setVisible(false)}>
                    <div className="context-menu" style={{ ...menuStyle }}>
                        {options &&
                            options.map((option) => {
                                if (typeof option === "string" && /devider/i.test(option)) {
                                    return <hr className="solid" key={nanoid()} />;
                                }

                                return (
                                    <ContextMenuOption
                                        onClick={(event) => {
                                            option.method(event);
                                            setVisible(false);
                                        }}
                                        key={nanoid()}
                                        buttonStyle={{ ...option?.style }}
                                        icon={option?.icon}
                                        label={option?.label}
                                        badge={option.badge}
                                    />
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
