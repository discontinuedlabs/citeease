/* eslint-disable react/jsx-props-no-spreading, prettier/prettier */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uid } from "../../utils/utils.ts";
import ContextMenu from "./ContextMenu";
import { TAG_COLOR_VALUES } from "../../data/store/slices/settingsSlice";

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
        <md-icon-button class={className} onClick={onClick} {...rest}>
            <md-icon>{name}</md-icon>
        </md-icon-button>
    );
}

export function List({ items = [], className, ...rest }) {
    return (
        <md-list class={className} {...rest}>
            {items.map((item) => {
                if (typeof item === "string" && /divider/i.test(item)) {
                    return <md-divider />;
                }
                return (
                    <md-list-item type="button" onClick={item.onClick} key={uid()}>
                        {item?.title && <div slot="headline">{item.title}</div>}
                        {item?.description && <div slot="supporting-text">{item.description}</div>}
                        {item?.content && <div slot="supporting-text">{item.content}</div>}
                    </md-list-item>
                );
            })}
        </md-list>
    );
}

export function TopBar({ headline, showBackButton = true, options }) {
    const navigate = useNavigate();
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
        <>
            <div
                className="sticky top-0 z-10 flex h-12 items-center justify-between px-2 py-8"
                style={{
                    background: isScrolled ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
                }}
            >
                <div className="flex items-center">
                    {showBackButton && <IconButton name="arrow_back" onClick={() => navigate(-1)} />}

                    <h2
                        className={`mx-2 transition duration-150 ease-in-out ${isScrolled ? "translate-y-0" : "translate-y-4 opacity-0"}`}
                    >
                        {headline}
                    </h2>
                </div>

                {options && (
                    <ContextMenu options={options}>
                        <IconButton name="more_vert" />
                    </ContextMenu>
                )}
            </div>
            <div
                className="p-4"
                style={{
                    background: isScrolled ? "var(--md-sys-color-surface-container)" : "var(--md-sys-color-surface)",
                }}
            >
                <h1 className="m-0">{headline}</h1>
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
