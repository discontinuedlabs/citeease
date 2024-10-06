/* eslint-disable react/jsx-props-no-spreading, prettier/prettier */

import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uid } from "../../utils/utils.ts";
import { TAG_COLOR_VALUES } from "../../data/store/slices/settingsSlice";
import { useMetaThemeColor } from "../../hooks/hooks.tsx";

export function Divider({ className = "", label, ...rest }) {
    if (label)
        return (
            <div className={`flex items-center justify-between ${className}`}>
                <md-divider />
                <p
                    className="mx-1 my-0"
                    style={{
                        color: "var(--md-sys-color-outline)",
                    }}
                >
                    {label}
                </p>
                <md-divider />
            </div>
        );
    return <md-divider class={className} {...rest} />;
}

export function CircularProgress({ className = "", value, ...rest }) {
    if (!value) return <md-circular-progress four-color indeterminate class={className} {...rest} />;
    return <md-circular-progress value={value} class={className} {...rest} />;
}

export function LinearProgress({ className = "", value, ...rest }) {
    if (!value) return <md-linear-progress four-color indeterminate class={className} {...rest} />;
    return <md-linear-progress value={value} class={className} {...rest} />;
}

export const TextField = forwardRef(function TextField(props, parentRef) {
    const {
        className = "",
        label,
        onChange,
        prefixText,
        suffixText,
        errorText,
        supportingText,
        error = false,
        disabled = false,
        ...rest
    } = props;

    const localRef = useRef();

    useImperativeHandle(parentRef, () => localRef?.current, []);

    useEffect(() => {
        const currentRef = localRef?.current;
        if (currentRef) {
            currentRef.addEventListener("change", onChange);
            currentRef.addEventListener("input", onChange);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener("change", onChange);
                currentRef.removeEventListener("input", onChange);
            }
        };
    }, [onChange, localRef]);

    if (error)
        return (
            <md-filled-text-field
                ref={localRef}
                class={className}
                label={label}
                prefix-text={prefixText}
                suffix-text={suffixText}
                supporting-text={supportingText}
                error={error}
                error-text={errorText}
                {...rest}
            />
        );
    if (disabled)
        return (
            <md-filled-text-field
                ref={localRef}
                class={className}
                label={label}
                prefix-text={prefixText}
                suffix-text={suffixText}
                supporting-text={supportingText}
                disabled
                {...rest}
            />
        );
    return (
        <md-filled-text-field
            ref={localRef}
            class={className}
            label={label}
            prefix-text={prefixText}
            suffix-text={suffixText}
            supporting-text={supportingText}
            {...rest}
        />
    );
});

export const Checkbox = forwardRef(function Checkbox(props, parentRef) {
    const { className = "", onChange = () => undefined, checked = false, indeterminate = false, ...rest } = props;
    const localRef = useRef();

    useImperativeHandle(parentRef, () => localRef?.current, []);

    useEffect(() => {
        const currentRef = localRef?.current;
        if (currentRef) {
            currentRef.addEventListener("change", onChange);
            currentRef.addEventListener("input", onChange);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener("change", onChange);
                currentRef.removeEventListener("input", onChange);
            }
        };
    }, []);

    const nClass = `m-0 align-middle ${className}`;
    if (checked) return <md-checkbox ref={localRef} class={nClass} touch-target="wrapper" checked {...rest} />;
    if (indeterminate)
        return <md-checkbox ref={localRef} class={nClass} touch-target="wrapper" indeterminate {...rest} />;
    return <md-checkbox ref={localRef} class={nClass} touch-target="wrapper" {...rest} />;
});

export function Icon({ name, className = "", ...rest }) {
    return (
        <md-icon slot="icon" {...rest} class={`align-middle ${className}`}>
            {name}
        </md-icon>
    );
}

export function Fab({ label, icon, className = "", onClick, ...rest }) {
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = () => {
        const show = window.scrollY > 60;
        setIsScrolled(show);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <md-fab
            label={isScrolled ? "" : label}
            class={`font-sans transition duration-150 ease-in-out ${className}`}
            onClick={onClick}
            {...rest}
        >
            <md-icon slot="icon">{icon}</md-icon>
        </md-fab>
    );
}

export function FilledButton({ className = "", onClick, type = "button", children, ...rest }) {
    return (
        <md-filled-button type={type} class={`px-6 py-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-filled-button>
    );
}

export function TextButton({ className = "", onClick, type = "button", children, ...rest }) {
    return (
        <md-text-button type={type} class={`px-6 py-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-text-button>
    );
}

export function IconButton({ className = "", onClick, type = "button", name, ...rest }) {
    return (
        <md-icon-button type={type} class={className} onClick={onClick} {...rest}>
            <md-icon>{name}</md-icon>
        </md-icon-button>
    );
}

export function List({ items = [], className = "", ...rest }) {
    return (
        <md-list class={className} {...rest}>
            {items.map((item) => {
                if (typeof item === "string" && /divider/i.test(item)) {
                    return <Divider key={uid()} />;
                }
                return (
                    <md-list-item class="" {...item} type="button" onClick={item?.onClick} key={uid()}>
                        {item?.start && <div slot="start">{item.start}</div>}
                        {item?.title && <div slot="headline">{item.title}</div>}
                        {item?.description && <div slot="supporting-text">{item.description}</div>}
                        {item?.content && <div slot="supporting-text">{item.content}</div>}
                        {item?.end && <div slot="end">{item.end}</div>}
                    </md-list-item>
                );
            })}
        </md-list>
    );
}

export const Select = forwardRef(function Select(props, parentRef) {
    const { options, onChange, disabled = false, ...rest } = props;
    const localRef = useRef();

    useImperativeHandle(parentRef, () => localRef?.current, []);

    useEffect(() => {
        const currentRef = localRef?.current;
        if (currentRef) {
            currentRef.addEventListener("change", onChange);
            currentRef.addEventListener("input", onChange);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener("change", onChange);
                currentRef.removeEventListener("input", onChange);
            }
        };
    }, [onChange, localRef]);

    if (disabled) {
        return (
            <md-filled-select disabled ref={localRef} {...rest}>
                {options.map((option) => {
                    if (localRef?.current?.value === option.value) {
                        return (
                            <md-select-option key={option.value} selected value={option.value}>
                                <div slot="headline">{option.headline}</div>
                            </md-select-option>
                        );
                    }
                    return (
                        <md-select-option key={option.value} value={option.value}>
                            <div slot="headline">{option.headline}</div>
                        </md-select-option>
                    );
                })}
            </md-filled-select>
        );
    }

    return (
        <md-filled-select ref={localRef} {...rest}>
            {options.map((option) => {
                if (localRef?.current?.value === option.value) {
                    return (
                        <md-select-option key={option.value} selected value={option.value}>
                            <div slot="headline">{option.headline}</div>
                        </md-select-option>
                    );
                }
                return (
                    <md-select-option key={option.value} value={option.value}>
                        <div slot="headline">{option.headline}</div>
                    </md-select-option>
                );
            })}
        </md-filled-select>
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
                        className={`mx-2 overflow-hidden text-ellipsis whitespace-nowrap text-xl font-normal transition duration-150 ease-in-out ${isScrolled ? "translate-y-0" : "translate-y-4 opacity-0"}`}
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

export function ChipSet({ chips = [], removable = false, className = "", ...rest }) {
    return (
        <md-chip-set class={className} {...rest}>
            {chips.map((chip) => {
                const chipStyle = {
                    "--md-assist-chip-outline-color": TAG_COLOR_VALUES[chip.color],
                    "--md-assist-chip-label-text-color": TAG_COLOR_VALUES[chip.color],
                };
                if (removable) {
                    return (
                        <md-input-chip style={chipStyle} key={uid()} label={chip.label}>
                            <md-icon slot-icon>close</md-icon>
                        </md-input-chip>
                    );
                }
                return <md-assist-chip style={chipStyle} key={uid()} label={chip.label} />;
            })}
        </md-chip-set>
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
