import { useRef } from "react";

export default function Button(props) {
    const { label, onClick } = props;
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
            onClick={onClick}
            onMouseDown={() => Object.assign(buttonRef.current.style, styles.down)}
            onMouseUp={() => Object.assign(buttonRef.current.style, styles.up)}
            onMouseLeave={() => Object.assign(buttonRef.current.style, styles.up)}
        >
            {label}
        </button>
    );
}
