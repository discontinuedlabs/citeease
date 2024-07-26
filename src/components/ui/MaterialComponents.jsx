/* eslint-disable react/jsx-props-no-spreading, prettier/prettier */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uid } from "../../utils/utils.ts";
import ContextMenu from "./ContextMenu";

export function Fab({ label, icon, className, onClick, ...rest }) {
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = () => {
        const show = window.scrollY > 40;
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
                if (typeof item === "string" && /devider/i.test(item)) {
                    return <md-devider />;
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
        const show = window.scrollY > 40;
        setIsScrolled(show);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div
                className={`sticky top-0 z-50 flex h-12 items-center justify-between bg-[#fcf7fc] py-8 ${isScrolled ? "bg-[#f3e2f3]" : ""}`}
            >
                <div className={`${showBackButton ? "mx-2" : "mx-4"} flex items-center`}>
                    {showBackButton && <IconButton name="arrow_back" onClick={() => navigate(-1)} />}

                    <h2
                        className={`transition duration-150 ease-in-out ${isScrolled ? "translate-y-0" : "translate-y-4 opacity-0"}`}
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
            <h1 className="m-4">{headline}</h1>
        </>
    );
}