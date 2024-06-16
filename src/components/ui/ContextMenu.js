import { useState } from "react";
import { MechanicButton, SmallButton, ContextMenuOption } from "./StyledButtons";
import "../../css/ContextMenu.css";
import { nanoid } from "nanoid";

// TODO: Needs refactor

export default function ContextMenu(props) {
    const { label, icon, options, buttonType, menuStyle, buttonStyle } = props;
    const [visible, setVisible] = useState(false);

    const buttonProps = {
        label,
        icon,
        buttonStyle,
        onClick: toggleVisibility,
    };
    // TODO: Rename the buttons to kebab-case
    const buttonTypes = {
        "Mechanic Button": <MechanicButton {...buttonProps} />,
        "Small Button": <SmallButton {...buttonProps} />,
        "Context Menu Option": <ContextMenuOption {...buttonProps} />,
    };

    function toggleVisibility() {
        setVisible((prevHidden) => !prevHidden);
    }

    return (
        <div className="context-menu-container">
            {buttonTypes[buttonType] || buttonTypes["Mechanic Button"]}

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
                                    ></ContextMenuOption>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
