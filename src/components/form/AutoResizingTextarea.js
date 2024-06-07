import React, { useRef, useLayoutEffect } from "react";

export default function AutoResizingTextarea(props) {
    const { value } = props;
    const textareaRef = useRef();

    useLayoutEffect(() => {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }, [value]);

    return <textarea className={`${props.className} auto-resizing-textarea`} ref={textareaRef} {...props} />;
}
