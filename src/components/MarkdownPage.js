import { useState, useEffect } from "react";
import { useDocumentTitle } from "../utils";
import ReactMarkdown from "react-markdown";

export default function MarkdownPage(props) {
    const { title, filePath } = props;
    useDocumentTitle(title);
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
            <ReactMarkdown children={content} />
        </div>
    );
}
