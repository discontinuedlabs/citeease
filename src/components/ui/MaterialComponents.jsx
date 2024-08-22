/* eslint-disable react/jsx-props-no-spreading, prettier/prettier */

import React, { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uid } from "../../utils/utils.tsx";
import { TAG_COLOR_VALUES } from "../../data/store/slices/settingsSlice";
import { useMetaThemeColor } from "../../hooks/hooks.tsx";

export function Checkbox({ className, onChange, checked = false, indeterminate = false, ...rest }) {
    const ref = useRef();

    useEffect(() => {
        ref?.current?.addEventListener("change", onChange);

        // eslint-disable-next-line consistent-return
        return () => ref?.current?.removeEventListener("change", onChange);
    }, []);

    const nClass = `m-0 align-middle ${className}`;
    if (checked) return <md-checkbox ref={ref} class={nClass} touch-target="wrapper" checked />;
    if (indeterminate) return <md-checkbox ref={ref} class={nClass} touch-target="wrapper" indeterminate {...rest} />;
    return <md-checkbox ref={ref} class={nClass} touch-target="wrapper" {...rest} />;
}

export function Icon({ name, className, ...rest }) {
    return (
        <md-icon slot="icon" {...rest} class={`align-middle ${className}`}>
            {name}
        </md-icon>
    );
}

export function Fab({ label, icon, className, onClick, ...rest }) {
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = () => {
        const show = window.scrollY > 50;
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

export function FilledButton({ className, onClick, children, ...rest }) {
    return (
        <md-filled-button class={`p-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-filled-button>
    );
}

export function ElevatedButton({ className, onClick, children, ...rest }) {
    return (
        <md-elevated-button class={`p-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-elevated-button>
    );
}

export function OutlinedButton({ className, onClick, children, ...rest }) {
    return (
        <md-outlined-button class={`p-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-outlined-button>
    );
}

export function FilledTonalButton({ className, onClick, children, ...rest }) {
    return (
        <md-filled-tonal-button class={`p-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-filled-tonal-button>
    );
}

export function TextButton({ className, onClick, children, ...rest }) {
    return (
        <md-text-button class={`p-2 font-sans ${className}`} onClick={onClick} {...rest}>
            {children}
        </md-text-button>
    );
}

export function IconButton({ className, onClick, name, ...rest }) {
    return (
        <md-icon-button class={` ${className}`} onClick={onClick} {...rest}>
            <md-icon>{name}</md-icon>
        </md-icon-button>
    );
}

export function List({ items = [], className, ...rest }) {
    return (
        <md-list class={className} {...rest}>
            {items.map((item) => {
                if (typeof item === "string" && /divider/i.test(item)) {
                    return <md-divider key={uid()} />;
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

export function Menu({ items, children }) {
    const usageSubmenuRed = useRef();
    const usageSubmenuAnchorId = useId().replace(/:/g, "");

    function toggleMenu() {
        usageSubmenuRed.current.open = !usageSubmenuRed.current.open;
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

            <md-menu has-overflow ref={usageSubmenuRed} anchor={usageSubmenuAnchorId}>
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
        const show = window.scrollY > 50;
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
                className="sticky top-0 z-10 flex h-12 items-center justify-between px-2 py-8"
                style={{
                    background: isScrolled ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
                }}
            >
                <div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
                    {showBackButton && (
                        <IconButton className="min-w-10" name="arrow_back" onClick={() => navigate(-1)} />
                    )}

                    <h2
                        className={`mx-2 overflow-hidden text-ellipsis whitespace-nowrap transition duration-150 ease-in-out ${isScrolled ? "translate-y-0" : "translate-y-4 opacity-0"}`}
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
                className="p-4"
                style={{
                    background: isScrolled ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
                }}
            >
                <h1 className="m-0">{headline}</h1>
                <div>{description}</div>
            </div>
        </>
    );
}

export function ChipSet({ chips = [], removable = false, className, ...rest }) {
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
        <div className="flex h-full w-full items-center justify-center p-5 font-sans">
            <div className="text-center">
                <Icon style={{ color: "var(--md-sys-color-outline)" }} className="h-32 w-32 text-9xl" name={icon} />
                {title && <h3>{title}</h3>}
                {message && <p>{message}</p>}
                {actions.length !== 0 && (
                    <div className="flex justify-center gap-2">
                        {actions.map((action) => {
                            return <FilledButton onClick={action[1]}>{action[0]}</FilledButton>;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
