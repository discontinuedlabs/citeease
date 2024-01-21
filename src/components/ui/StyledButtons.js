import { useRef } from "react";
import "../../css/StyledButtons.css";

export function Button(props) {
    const { label, onClick, icon, buttonStyle, className, styles } = props;
    const buttonRef = useRef(null);

    return (
        <button
            ref={buttonRef}
            className={className}
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

export function MechanicButton(props) {
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
    return <Button {...props} className="mechanic-button" styles={styles} />;
}

export function SmallButton(props) {
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
    return <Button {...props} className="small-button" styles={styles} />;
}
