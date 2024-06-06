import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownPage(props) {
    const { title, filePath } = props;
    const [content, setContent] = useState("");

    useEffect(() => {
        async function fetchContent() {
            const response = await fetch(filePath);
            const text = await response.text();
            setContent(text);
        }
        fetchContent();
    }, [filePath]);

    return (
        <div>
            <h1 className="hidden">{title}</h1> {/* For screen readers and tab title */}
            <ReactMarkdown children={content} />
        </div>
    );
}
