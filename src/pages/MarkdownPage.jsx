import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TopBar } from "../components/ui/MaterialComponents";

export default function MarkdownPage({ title = undefined, filePath }) {
    const [content, setContent] = useState("");
    const [firstHeading, setFirstHeading] = useState("");

    useEffect(() => {
        async function fetchContent() {
            const response = await fetch(filePath);
            const text = await response.text();

            const headings = text.split("\n").filter((line) => line.startsWith("#"));
            const firstHeadingMatch = headings.find((heading) => heading.startsWith("# "));
            if (firstHeadingMatch && !title) {
                setContent(text.replace(firstHeadingMatch, ""));
                setFirstHeading(firstHeadingMatch.trim().slice(2));
            } else {
                setContent(text);
            }
        }
        fetchContent();
    }, [filePath]);

    return (
        <div className="mx-auto max-w-[50rem]">
            <TopBar headline={title || firstHeading} />
            <ReactMarkdown className="p-4">{content}</ReactMarkdown>
        </div>
    );
}
