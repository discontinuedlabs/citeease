import { useState, useEffect } from "react";
import { EmptyPage, CircularProgress, TopBar } from "../components/ui/MaterialComponents";
import { markdownToHtml, parseHtmlToJsx } from "../utils/conversionUtils.tsx";
import useOnlineStatus from "../hooks/hooks.tsx";

export default function MarkdownPage({ title, filePath }) {
    const [content, setContent] = useState();
    const [loading, setLoading] = useState(false);
    const online = useOnlineStatus();

    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            const response = await fetch(filePath);
            const text = await response.text();
            const htmlContent = markdownToHtml(text);
            setContent(htmlContent);
            setLoading(false);
        }

        if (!content) {
            try {
                fetchContent();
            } catch (error) {
                console.error(error);
            }
        }
    }, [filePath, online]);

    return (
        <div className="bottom-0 left-0 right-0 top-0 mx-auto max-w-[50rem]">
            <TopBar headline={title} />
            {(!online && !content && <EmptyPage title="You are offline!" />) ||
                (loading && (
                    <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
                        <CircularProgress />
                    </div>
                )) || <div className="px-4">{parseHtmlToJsx(content)}</div>}
        </div>
    );
}
