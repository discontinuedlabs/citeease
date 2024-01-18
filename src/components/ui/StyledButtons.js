import { useRef } from "react";

export function MechanicButton(props) {
    const { label, onClick, icon, buttonStyle } = props;
    const buttonRef = useRef(null);
    const styles = {
        down: {
            transform: "translateY(0.4rem)",
            boxShadow: "0 0 0 transparent",
        },
        up: {
            transform: "",
            boxShadow: "0 0.4rem 0 var(--dark-blue)",
        },
    };

    return (
        <button
            ref={buttonRef}
            className="styled-button"
            style={{ ...buttonStyle }}
            onClick={onClick}
            onTouchStart={() => Object.assign(buttonRef.current.style, styles.down)}
            onTouchEnd={() => Object.assign(buttonRef.current.style, styles.up)}
            onMouseDown={() => Object.assign(buttonRef.current.style, styles.down)}
            onMouseUp={() => Object.assign(buttonRef.current.style, styles.up)}
            onMouseLeave={() => Object.assign(buttonRef.current.style, styles.up)}
        >
            <i className="material-icons-round">{icon}</i>
            {label}
        </button>
    );
}

export function SmallButton(props) {
    const { label, onClick, icon, buttonStyle } = props;
    const buttonRef = useRef(null);
    const styles = {
        down: {
            transform: "translateY(0.4rem)",
            boxShadow: "0 0 0 transparent",
        },
        up: {
            transform: "",
            boxShadow: "0 0.4rem 0 var(--dark-blue)",
        },
    };

    return (
        <button
            ref={buttonRef}
            className="small-button"
            style={{ ...buttonStyle }}
            onClick={onClick}
            onTouchStart={() => Object.assign(buttonRef.current.style, styles.down)}
            onTouchEnd={() => Object.assign(buttonRef.current.style, styles.up)}
            onMouseDown={() => Object.assign(buttonRef.current.style, styles.down)}
            onMouseUp={() => Object.assign(buttonRef.current.style, styles.up)}
            onMouseLeave={() => Object.assign(buttonRef.current.style, styles.up)}
        >
            <i className="material-icons-round">{icon}</i>
            {label}
        </button>
    );
}
