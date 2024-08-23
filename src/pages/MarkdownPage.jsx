import { useState, useEffect } from "react";
import { TopBar } from "../components/ui/MaterialComponents";
import { markdownToHtml, parseHtmlToJsx } from "../utils/conversionUtils.tsx";

export default function MarkdownPage({ title, filePath }) {
    const [content, setContent] = useState("");

    useEffect(() => {
        async function fetchContent() {
            const response = await fetch(filePath);
            const text = await response.text();
            const htmlContent = markdownToHtml(text);
            setContent(htmlContent);
        }
        fetchContent();
    }, [filePath]);

    return (
        <div className="mx-auto max-w-[50rem]">
            <TopBar headline={title} />
            <div style={{ paddingInline: "1rem" }}>{parseHtmlToJsx(content)}</div>
        </div>
    );
}
