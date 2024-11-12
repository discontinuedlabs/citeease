/* eslint-disable react/jsx-props-no-spreading */

import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uid } from "../../utils/utils.ts";
import { useMetaThemeColor, useTheme } from "../../hooks/hooks.tsx";
import { hslToHsla } from "../../utils/conversionUtils.tsx";
import { colors as colorValues } from "../../assets/json/defaults.json";

export function Divider({ className = "", label = "", ...rest }) {
    const dividerClass = "h-[1px] w-full";
    const dividerStyle = { background: "var(--md-sys-color-outline-variant)" };

    return (
        <div className={`flex items-center ${className}`} {...rest}>
            <div className={dividerClass} style={dividerStyle} />
            {Boolean(label.length) && (
                <p
                    className="mx-1 my-0 whitespace-nowrap text-sm"
                    style={{
                        color: "var(--md-sys-color-outline)",
                    }}
                >
                    {label}
                </p>
            )}
            <div className={dividerClass} style={dividerStyle} />
        </div>
    );
}

export function CircularProgress({ className = "", value, ...rest }) {
    if (!value) return <md-circular-progress four-color indeterminate class={className} {...rest} />;
    return <md-circular-progress value={value} class={className} {...rest} />;
}

export function LinearProgress({ className = "", value, indeterminateWithValue = false, ...rest }) {
    if (!value) {
        return <md-linear-progress four-color indeterminate class={className} {...rest} />;
    }
    if (indeterminateWithValue) {
        return (
            <div className={`relative h-1 ${className}`} {...rest}>
                <md-linear-progress value={value} class="absolute start-0 top-0 w-full" />
                <md-linear-progress four-color indeterminate class="absolute start-0 top-0 w-full opacity-30" />
            </div>
        );
    }
    return <md-linear-progress value={value} class={className} {...rest} />;
}

export const TextField = forwardRef(function TextField(props, parentRef) {
    const {
        className,
        type = "text",
        label,
        value,
        placeholder,
        error = false,
        supportingText,
        disabled,
        ...rest
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const localRef = useRef(null);
    const id = props?.id || uid();
    const conatinerId = uid();

    useImperativeHandle(parentRef, () => localRef, []);

    useEffect(() => {
        function checkFocus() {
            setIsFocused(document.activeElement === localRef.current);
        }

        checkFocus();

        const element = localRef.current;
        element.addEventListener("focus", checkFocus);
        element.addEventListener("blur", checkFocus);

        return () => {
            element.removeEventListener("focus", checkFocus);
            element.removeEventListener("blur", checkFocus);
        };
    }, []);

    function handleFocus() {
        if (!disabled) {
            const element = localRef.current;
            element.focus();
        }
    }

    function getIndicatorsColor() {
        if (error) return "var( --md-sys-color-error)";
        if (isFocused) return "var(--md-sys-color-primary)";
        return "var(--md-sys-color-on-surface-variant)";
    }

    const textFieldProps = {
        ref: localRef,
        type,
        id,
        value,
        placeholder: isFocused ? placeholder : "",
        disabled,
        className: `resize-none w-full rounded-t-[4px] border-0 px-4 font-sans text-base ${
            label && label.length ? "mb-2 mt-6" : "my-4"
        } ${disabled ? "opacity-60" : ""}`,
        style: {
            background: "var(--md-sys-color-inverse-surface)",
            caretColor: "var(--md-sys-color-primary)",
        },
        ...rest,
    };

    return (
        <div>
            {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}

            <div
                id={conatinerId}
                className={`relative ${className}`}
                onClick={handleFocus}
                style={{
                    background: "var(--md-sys-color-inverse-surface)",
                }}
            >
                {!disabled && <md-ripple part="ripple" htmlFor={conatinerId} aria-hidden />}

                {/* Label */}
                <div className="absolute start-0 top-0 z-[1] h-14 w-full select-none bg-transparent text-transparent">
                    ###
                    <div
                        className={`absolute start-4 w-10/12 overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-200 ease-out ${
                            isFocused || (value && value.length) || localRef.current?.value
                                ? "top-2 text-xs"
                                : "top-1/2 -translate-y-1/2 text-base"
                        } ${disabled ? "opacity-60" : ""}`}
                        style={{ color: getIndicatorsColor() }}
                    >
                        {label}
                    </div>
                </div>

                {/* Text Field */}
                {type === "textarea" ? <textarea {...textFieldProps} /> : <input {...textFieldProps} />}

                {/* Focus Indicator */}
                <div
                    className={`absolute bottom-0 w-full transition-all duration-200 ease-out ${
                        isFocused ? "h-[3px]" : "h-[1px]"
                    } ${disabled ? "opacity-60" : ""}`}
                    style={{ background: getIndicatorsColor() }}
                />
            </div>

            {/* Supporting Text */}
            {Boolean(supportingText && supportingText.length) && (
                <small
                    className="mx-4"
                    style={{ color: error ? "var( --md-sys-color-error)" : "var(--md-sys-color-on-surface-variant)" }}
                >
                    {supportingText}
                </small>
            )}

            {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        </div>
    );
});

export const Checkbox = forwardRef(function Checkbox(props, parentRef) {
    const {
        className = "",
        id = "",
        onChange = () => undefined,
        checked = false,
        indeterminate = false,
        ...rest
    } = props;
    const localRef = useRef();

    useImperativeHandle(parentRef, () => localRef?.current, []);

    useEffect(() => {
        const currentRef = localRef?.current;
        if (currentRef) {
            currentRef.addEventListener("input", onChange);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener("input", onChange);
            }
        };
    }, []);

    const nClass = `m-0 align-middle ${className}`;
    if (checked) return <md-checkbox id={id} ref={localRef} class={nClass} touch-target="wrapper" checked {...rest} />;
    if (indeterminate)
        return <md-checkbox id={id} ref={localRef} class={nClass} touch-target="wrapper" indeterminate {...rest} />;
    return <md-checkbox id={id} ref={localRef} class={nClass} touch-target="wrapper" {...rest} />;
});

export const Switch = forwardRef(function Switch(props, parentRef) {
    const { className = "", label = "", id = undefined, onChange = () => undefined, selected = false, ...rest } = props;
    const localRef = useRef();
    const uuid = uid();
    const nClass = `flex justify-between items-center ${className}`;

    useImperativeHandle(parentRef, () => localRef?.current, []);

    useEffect(() => {
        const currentRef = localRef?.current;
        if (currentRef) {
            currentRef.addEventListener("input", onChange);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener("input", onChange);
            }
        };
    }, []);

    if (selected)
        return (
            <label className={nClass} htmlFor={id || uuid}>
                {label}
                <md-switch ref={localRef} aria-label={label} id={id || uuid} selected {...rest} />
            </label>
        );
    return (
        <label className={nClass} htmlFor={id || uuid}>
            {label}
            <md-switch ref={localRef} aria-label={label} id={id || uuid} {...rest} />
        </label>
    );
});

export function Icon({ name, className = "", ...rest }) {
    return (
        <md-icon slot="icon" class={`align-middle ${className}`} {...rest}>
            {name}
        </md-icon>
    );
}

export function Fab({ label, icon, className = "", disabled = false, onClick, ...rest }) {
    if (disabled) {
        return (
            <md-fab disabled label={label} class={`font-sans ${className}`} onClick={onClick} {...rest}>
                <md-icon slot="icon">{icon}</md-icon>
            </md-fab>
        );
    }
    return (
        <md-fab label={label} class={`font-sans ${className}`} onClick={onClick} {...rest}>
            <md-icon slot="icon">{icon}</md-icon>
        </md-fab>
    );
}

export function FilledButton({ className = "", onClick, type = "button", disabled = false, children, ...rest }) {
    if (disabled) {
        return (
            <md-filled-button
                disabled
                type={type}
                class={`px-6 py-2 font-sans ${className}`}
                onClick={onClick}
                {...rest}
            >
                {children}
            </md-filled-button>
        );
    }
    return (
        <md-filled-button type={type} class={`px-6 py-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-filled-button>
    );
}

export function TextButton({ className = "", onClick, disabled = false, type = "button", children, ...rest }) {
    if (disabled) {
        return (
            <md-text-button disabled type={type} class={`px-6 py-2 font-sans ${className}`} onClick={onClick} {...rest}>
                {children}
            </md-text-button>
        );
    }
    return (
        <md-text-button type={type} class={`px-6 py-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-text-button>
    );
}

export function OutlinedButton({ className = "", onClick, disabled = false, type = "button", children, ...rest }) {
    if (disabled) {
        return (
            <md-outlined-button
                disabled
                type={type}
                class={`px-6 py-2 font-sans ${className}`}
                onClick={onClick}
                {...rest}
            >
                {children}
            </md-outlined-button>
        );
    }
    return (
        <md-outlined-button type={type} class={`px-6 py-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-outlined-button>
    );
}

export function IconButton({ className = "", onClick, disabled = false, type = "button", name, iconStyle, ...rest }) {
    if (disabled) {
        return (
            <md-icon-button disabled type={type} class={className} onClick={onClick} {...rest}>
                <md-icon style={iconStyle}>{name}</md-icon>
            </md-icon-button>
        );
    }
    return (
        <md-icon-button type={type} class={className} onClick={onClick} {...rest}>
            <md-icon style={iconStyle}>{name}</md-icon>
        </md-icon-button>
    );
}

export function OutlinedIconButton({ className = "", onClick, type = "button", name, ...rest }) {
    return (
        <md-outlined-icon-button type={type} class={className} onClick={onClick} {...rest}>
            <md-icon>{name}</md-icon>
        </md-outlined-icon-button>
    );
}

// TODO: Remake this component from scratch
export function List({ items = [], className = "", ...rest }) {
    return (
        <md-list class={className} {...rest}>
            {items.map((item) => {
                if (typeof item === "string" && /divider/i.test(item)) {
                    return <Divider key={uid()} />;
                }
                if (!item) return null;
                if (item?.disabled) {
                    return (
                        <md-list-item disabled class="" {...item} type="button" onClick={item?.onClick} key={uid()}>
                            {item?.start && <div slot="start">{item.start}</div>}
                            {item?.title && <div slot="headline">{item.title}</div>}
                            {item?.description && (
                                <div className="grid gap-2" slot="supporting-text">
                                    {item.description}
                                    {item.content}
                                </div>
                            )}
                            {item?.end && <div slot="end">{item.end}</div>}
                        </md-list-item>
                    );
                }
                delete item?.disabled; // eslint-disable-line no-param-reassign
                return (
                    <md-list-item class="" {...item} type="button" onClick={item?.onClick} key={uid()}>
                        {item?.start && <div slot="start">{item.start}</div>}
                        {item?.title && <div slot="headline">{item.title}</div>}
                        {item?.description && (
                            <div className="grid gap-2" slot="supporting-text">
                                {item.description}
                                {item.content}
                            </div>
                        )}
                        {item?.end && <div slot="end">{item.end}</div>}
                    </md-list-item>
                );
            })}
        </md-list>
    );
}

// FIXME: No focus
export const Select = forwardRef(function Select(props, parentRef) {
    const {
        className = "",
        label = "",
        options: passedOptions = [],
        onChange = () => undefined,
        disabled = false,
        ...rest
    } = props;

    const options = passedOptions.map((option) => ({ ...option, id: uid() }));
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const localRef = useRef(null);
    const id = uid();

    useImperativeHandle(parentRef, () => localRef, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (localRef.current && !localRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        function checkFocus() {
            setIsFocused(document.activeElement === localRef.current);
        }

        checkFocus();

        const element = localRef.current;
        element.addEventListener("focus", checkFocus);
        element.addEventListener("blur", checkFocus);

        return () => {
            element.removeEventListener("focus", checkFocus);
            element.removeEventListener("blur", checkFocus);
        };
    }, []);

    function toggleDropdown() {
        setIsOpen((prev) => !prev);
    }

    function handleOptionClick(option) {
        setSelectedOption(option);
        setIsOpen(false);

        onChange(option.value);
    }

    return (
        <div className={`relative min-w-40 ${className}`} ref={localRef} {...rest}>
            {!props.disabled && <md-ripple part="ripple" htmlFor={id} aria-hidden />}

            {/* Label */}
            <div
                className={`absolute start-4 overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-200 ease-out ${
                    isFocused || selectedOption.headline ? "top-2 text-xs" : "top-1/2 -translate-y-1/2 text-base"
                } ${disabled ? "opacity-60" : ""}`}
                style={{
                    color:
                        isFocused || isOpen ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
                }}
            >
                {label}
            </div>

            {/* Select Display */}
            <button
                id={id}
                type="button"
                className={`flex min-h-14 min-w-full cursor-pointer items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-t-[4px] border-0 pe-6 ps-4 font-sans text-base ${
                    label.length ? "pb-2 pt-6" : "py-4"
                }`}
                style={{ background: "var(--md-sys-color-inverse-surface)" }}
                disabled={disabled}
                onClick={toggleDropdown}
            >
                <span className={`${disabled ? "opacity-60" : ""}`}>{selectedOption.headline}</span>
            </button>

            {/* Options Dropdown */}
            {isOpen && (
                <div
                    className="absolute z-50 w-full rounded-md py-2 text-base shadow-lg drop-shadow-md"
                    style={{ background: "var(--md-sys-color-inverse-surface)" }}
                >
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.id}
                            value={option.value}
                            className="relative block min-h-14 w-full border-none bg-transparent p-0 px-3 py-4 text-start font-sans text-base"
                            onClick={() => handleOptionClick(option)}
                            style={{
                                background:
                                    option.value === selectedOption.value
                                        ? "var(--md-sys-color-primary-container)"
                                        : "",
                            }}
                        >
                            <md-ripple part="ripple" htmlFor={option.id} aria-hidden />
                            {option.headline}
                        </button>
                    ))}
                </div>
            )}

            {/* Dropdown Arrow */}
            <span
                className={`absolute end-3 top-1/2 -translate-y-1/2 text-base ${
                    isOpen ? "rotate-180" : "rotate-0"
                } ${disabled ? "opacity-60" : ""}`}
                style={{
                    color:
                        isFocused || isOpen ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
                }}
            >
                &#9662;
            </span>

            {/* Focus Indicator */}
            <div
                className={`absolute bottom-0 w-full transition-all duration-200 ease-out ${
                    isOpen || isFocused ? "h-[3px]" : "h-[1px]"
                } ${disabled ? "opacity-60" : ""}`}
                style={{
                    background:
                        isOpen || isFocused ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
                }}
            />
        </div>
    );
});

export function Menu({ items, className, children, ...rest }) {
    const usageSubmenuRef = useRef();
    const usageSubmenuAnchorId = useId().replace(/:/g, "");

    function toggleMenu() {
        usageSubmenuRef.current.open = !usageSubmenuRef.current.open;
    }

    function renderMenuItems(menuItems) {
        return menuItems.map((item) => {
            if (item.subItems) {
                return (
                    <md-sub-menu key={uid()} menu-corner="start-end" anchor-corner="start-start">
                        <md-menu-item slot="item" class="m-0 p-0">
                            <div slot="headline" className="m-0 whitespace-nowrap p-0">
                                {item.headline}
                            </div>
                            <Icon name="arrow_right" slot="end" />
                        </md-menu-item>

                        <md-menu slot="menu" class="m-0 p-0">
                            {renderMenuItems(item.subItems)}
                        </md-menu>
                    </md-sub-menu>
                );
            }
            return (
                <md-menu-item class="" key={uid()} onClick={item.onClick}>
                    <div slot="headline" className="m-0 whitespace-nowrap p-0">
                        {item.headline}
                    </div>
                </md-menu-item>
            );
        });
    }

    return (
        <span className="relative">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div onClick={toggleMenu} id={usageSubmenuAnchorId}>
                {children}
            </div>

            <md-menu class={className} has-overflow ref={usageSubmenuRef} anchor={usageSubmenuAnchorId} {...rest}>
                {renderMenuItems(items)}
            </md-menu>
        </span>
    );
}

export function TopBar({ headline, description, showBackButton = true, options }) {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const metaThemeColor = useMetaThemeColor();

    const handleScroll = () => {
        const show = window.scrollY > 60;
        setIsScrolled(show);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isScrolled) {
            const scrolledColor = window
                .getComputedStyle(document.documentElement)
                .getPropertyValue("--md-sys-color-surface-container");
            metaThemeColor(scrolledColor);
        } else {
            const unscrolledColor = window
                .getComputedStyle(document.documentElement)
                .getPropertyValue("background-color");
            metaThemeColor(unscrolledColor);
        }
    }, [isScrolled]);

    return (
        <>
            <div
                className="sticky top-0 z-[1] flex h-12 items-center justify-between px-2 py-8"
                style={{
                    background: isScrolled ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
                }}
            >
                <div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
                    {showBackButton && (
                        <IconButton className="min-w-10" name="arrow_back" onClick={() => navigate(-1)} />
                    )}

                    <h2
                        className={`mx-2 overflow-hidden text-ellipsis whitespace-nowrap text-xl font-normal transition duration-150 ease-out ${isScrolled ? "translate-y-0" : "translate-y-4 opacity-0"}`}
                    >
                        {headline}
                    </h2>
                </div>

                {options && (
                    <Menu items={options}>
                        <IconButton name="more_vert" />
                    </Menu>
                )}
            </div>
            <div
                className="p-4 pt-10"
                style={{
                    background: isScrolled ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
                }}
            >
                <h1 className="m-0 text-3xl font-normal">{headline}</h1>
                <div>{description}</div>
            </div>
        </>
    );
}

function Chip(props) {
    const { className, onClick, start, label, end, selected, color, ...rest } = props;
    const [theme] = useTheme();
    const id = uid();

    const targetColor = colorValues[theme][color];

    const style = {
        background: selected ? hslToHsla(targetColor, 0.25) : "transparent",
        border: `1px solid ${selected ? "transparent" : targetColor}`,
    };

    return (
        <div id={id} className={`relative *:rounded-[8px] ${className}`} {...rest}>
            <md-focus-ring part="focus-ring" htmlFor={id} aria-hidden />
            <md-ripple part="ripple" htmlFor={id} aria-hidden />
            <button
                className="flex items-center justify-between gap-1 p-[0.4rem] font-sans font-semibold"
                style={style}
                onClick={onClick}
                type="button"
                id={id}
            >
                {start}
                {label}
                {end}
            </button>
        </div>
    );
}

export function ChipSet(props) {
    const { chips = [], className = "", ...rest } = props;
    const [theme] = useTheme();

    return (
        <div className={`flex flex-wrap gap-1 ${className}`} {...rest}>
            {chips.map((chip) => {
                if (!chip || !colorValues[theme]) return undefined;

                return <Chip key={uid()} {...chip} />;
            })}
        </div>
    );
}

export function EmptyPage({ icon = "error", title, message, actions = [] }) {
    return (
        <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center p-5 font-sans">
            <div className="text-center">
                <Icon style={{ color: "var(--md-sys-color-outline)" }} className="h-32 w-32 text-9xl" name={icon} />
                {title && <h3>{title}</h3>}
                {message && <p>{message}</p>}
                {actions.length !== 0 && (
                    <div className="flex justify-center gap-2">
                        {actions.map((action) => {
                            return (
                                <FilledButton key={uid()} onClick={action[1]}>
                                    {action[0]}
                                </FilledButton>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
