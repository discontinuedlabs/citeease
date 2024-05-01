import { useState } from "react";
import { MechanicButton, SmallButton, ContextMenuOption } from "./StyledButtons";
import "../../css/ContextMenu.css";

export default function ContextMenu(props) {
    const { label, icon, options, buttonType, menuStyle, buttonStyle, _isNestedContextMenu } = props;
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
        <div className="context-menu-container" style={_isNestedContextMenu ? { width: "100%" } : {}}>
            {buttonTypes[buttonType] || buttonTypes.mechanicButton}

            {visible && (
                <div
                    className="context-menu-overlay"
                    onClick={() => {
                        if (!_isNestedContextMenu) setVisible(false);
                    }}
                >
                    <div className="context-menu" style={{ ...menuStyle }}>
                        {options &&
                            options.map((option) => {
                                if (typeof option === "string" && /devider/i.test(option)) {
                                    return <hr className="solid" />;
                                }

                                // If the method is an array, it will be converted to a nested context menu
                                if (Array.isArray(option.method)) {
                                    return (
                                        <ContextMenu
                                            label={option.label}
                                            options={option.method.map((nestedOption) => ({
                                                label: nestedOption.label,
                                                method: nestedOption.method,
                                            }))}
                                            buttonType={"Context Menu Option"}
                                            buttonStyle={{ width: "100%" }}
                                            _isNestedContextMenu={true}
                                        />
                                    );
                                }

                                // Handle regular options
                                return (
                                    <ContextMenuOption
                                        onClick={(event) => {
                                            if (!_isNestedContextMenu) {
                                                option.method(event);
                                                setVisible(false);
                                            }
                                        }}
                                        key={option?.label}
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
