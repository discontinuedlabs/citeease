import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import "../../css/SettingsComponents.css";

export function SettingsSection(props) {
    const { title, children } = props;
    return (
        <div className="settings-section">
            <h3>{title}</h3>
            {children}
        </div>
    );
}

export function SettingsInput(props) {
    const { value, placeholder, label, name = nanoid(), onChange } = props;

    return (
        <div className="settings-input">
            <label htmlFor={name} value={label}>
                <input type="text" value={value} placeholder={placeholder} id={name} name={name} onChange={onChange} />
            </label>
        </div>
    );
}

export function SettingsButton(props) {
    const { label, color, width = "fit-content", maxWidth = "unset", onClick } = props;

    return (
        <button className="settings-button" style={{ backgroundColor: color, width, maxWidth }} onClick={onClick}>
            {label}
        </button>
    );
}

export function SettingsNavigate(props) {
    const { label, to } = props;
    const navigate = useNavigate();

    return (
        <button className="settings-navigate" onClick={() => navigate(to)}>
            {label}
        </button>
    );
}

export function SettingsCheckButton(props) {
    const { label, subLabel, learnMoreLink, onChange } = props;

    return (
        <div className="settings-check-button">
            <label>{label}</label>
            <small>
                {subLabel}
                {learnMoreLink && (
                    <a href={learnMoreLink} target="blank">
                        Learn more
                    </a>
                )}
            </small>
            <input type="checkbox" onChange={onChange} />
        </div>
    );
}
