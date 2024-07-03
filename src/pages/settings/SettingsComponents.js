import { useId } from "react";
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
    const { value, placeholder, label, onChange } = props;
    const id = useId();

    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input type="text" value={value} placeholder={placeholder} id={id} onChange={onChange} />
        </div>
    );
}

export function SettingsButton(props) {
    const { children } = props;

    return (
        <>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <button {...props} type="button">
                {children}
            </button>
        </>
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
            type="button"
        >
            {children}
        </button>
    );
}

export function SettingsCheckButton(props) {
    const { label, subLabel, learnMoreLink, onChange } = props;
    const id = useId();

    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <small>
                {subLabel}
                {learnMoreLink && (
                    <a href={learnMoreLink} target="blank">
                        Learn more
                    </a>
                )}
            </small>
            <input id={id} type="checkbox" onChange={onChange} />
        </div>
    );
}
