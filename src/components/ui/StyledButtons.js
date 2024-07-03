import { useState } from "react";
import "../../css/StyledButtons.css";

export function Button(props) {
    const { label, onClick, icon, buttonStyle, className, styles, badge } = props;
    const [originalStyle, setOriginalStyle] = useState({});

    return (
        <button
            type="button"
            className={`${className} styled-button`}
            style={{ ...originalStyle, ...buttonStyle }}
            onClick={onClick}
            onTouchStart={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.down }))}
            onTouchEnd={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.up }))}
            onMouseDown={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.down }))}
            onMouseUp={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.up }))}
        >
            <i className="material-icons-round">{icon}</i>
            {label}
            <div
                className="context-menu-badge"
                style={{ color: badge?.color, backgroundColor: badge?.backgroundColor }}
            >
                {badge?.label}
            </div>
        </button>
    );
}

export function MechanicButton(props) {
    const styles = {
        down: {
            transform: "translateY(0.4rem)",
            boxShadow: "0 0 0 var(--dark-blue)",
        },
        up: {
            transform: "translateY(0rem)",
            boxShadow: "0 0.4rem 0 var(--dark-blue)",
        },
    };
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...props} className="mechanic-button" styles={styles} />;
}

export function SmallButton(props) {
    const styles = {
        down: {
            backgroundColor: "var(--light-blue)",
        },
        up: {
            backgroundColor: "",
        },
    };
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...props} className="small-button" styles={styles} />;
}

// TODO: Make this type use Button component
export function ContextMenuOption(props) {
    const { onClick, buttonStyle, icon, label, badge } = props;
    const [originalStyle, setOriginalStyle] = useState({});
    const styles = {
        down: {
            backgroundColor: "var(--light-blue)",
        },
        up: {
            backgroundColor: "",
        },
    };

    return (
        <button
            type="button"
            className="styled-button context-menu-option"
            onClick={onClick}
            style={{ ...originalStyle, ...buttonStyle }}
            onTouchStart={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.down }))}
            onTouchEnd={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.up }))}
            onMouseDown={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.down }))}
            onMouseUp={() => setOriginalStyle((prevStyle) => ({ ...prevStyle, ...styles.up }))}
        >
            <i className="material-icons-round">{icon}</i>
            {label}
            <div
                className="context-menu-badge"
                style={{ color: badge?.color, backgroundColor: badge?.backgroundColor }}
            >
                {badge?.label}
            </div>
        </button>
    );
}
