import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

export function SettingsSection(props) {
    const { title, children } = props;
    return (
        <div>
            <h3>{title}</h3>
            {children}
        </div>
    );
}

export function SettingsInput(props) {
    const { value, placeholder, label, name = nanoid(), onChange } = props;

    return (
        <div>
            <label htmlFor={name} value={label}>
                <input type="text" value={value} placeholder={placeholder} id={name} name={name} onChange={onChange} />
            </label>
        </div>
    );
}

export function SettingsButton(props) {
    const { children, style = {}, onClick } = props;

    return (
        <button
            style={style}
            onClick={(event) => {
                if (onClick) onclick(event);
            }}
        >
            {children}
        </button>
    );
}

export function SettingsNavigate(props) {
    const { children, to, onClick } = props;
    const navigate = useNavigate();

    return (
        <button
            className="w-full p-2 bg-transparent border-transparent rounded-md mb-2 text-start transition duration-150 ease-in-out transform hover:bg-neutral-transparentGray"
            onClick={(event) => {
                if (to) navigate(to);
                if (onClick) onClick(event);
            }}
        >
            {children}
        </button>
    );
}

export function SettingsCheckButton(props) {
    const { label, subLabel, learnMoreLink, onChange } = props;

    return (
        <div>
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
