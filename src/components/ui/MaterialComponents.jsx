/* eslint-disable react/jsx-props-no-spreading, prettier/prettier */

import "@material/web/all";
import "../../material.css";

export function Fab({ label, className, onClick, ...rest }) {
    return <md-fab label={label} class={`font-sans ${className}`} onClick={onClick} {...rest} />;
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
