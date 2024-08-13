import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TopBar } from "../components/ui/MaterialComponents";

export default function MarkdownPage({ title, filePath }) {
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
        <div className="mx-auto max-w-[50rem]">
            <TopBar headline={title} />
            <ReactMarkdown className="p-4">{content}</ReactMarkdown>
        </div>
    );
}
