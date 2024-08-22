import React from "react";

/**
 * Generates a unique identifier of a specified length.
 *
 * This function creates a unique ID by generating a sequence of characters from a predefined alphabet.
 * It uses a pool of random bytes to select characters from the alphabet, ensuring uniqueness.
 *
 * @param {number} length - The desired length of the unique ID.
 * @returns {string} A unique identifier of the specified length.
 */
export function uid(length: number = 20): string {
    const POOL_SIZE_MULTIPLIER = 128;
    const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

    let pool: Uint8Array | undefined;
    let poolOffset: number = 0;

    function refillRandomValuePool(byteCount: number): void {
        if (!pool || pool.length < byteCount) {
            pool = new Uint8Array(POOL_SIZE_MULTIPLIER * byteCount);
            window.crypto.getRandomValues(pool);
            poolOffset = 0;
        } else if (poolOffset + byteCount > pool.length) {
            window.crypto.getRandomValues(pool.subarray(poolOffset, poolOffset + byteCount));
            poolOffset = 0;
        }
        poolOffset += byteCount;
    }

    refillRandomValuePool(length);

    let uniqueId: string = "";
    for (let index = 0; index < length; index += 1) {
        if (!pool) {
            throw new Error("Pool is unexpectedly undefined.");
        }
        uniqueId += ALLOWED_CHARS[pool[index + poolOffset] % ALLOWED_CHARS.length];
    }
    return uniqueId;
}

/**
 * Calculates the relative time from the given date to now.
 *
 * @param dateString - The date string to calculate the time difference from. This should be a valid ISO 8601 date string.
 * @returns A string representing the time elapsed since the given date in a human-readable format.
 */
export function timeAgo(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);

    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    let formattedTime: string;

    if (diffInSeconds < 60) {
        // Less than a minute
        formattedTime = "just now";
    } else if (diffInSeconds < 3600) {
        // Less than an hour
        formattedTime = `${Math.floor(diffInSeconds / 60)} ${
            Math.floor(diffInSeconds / 60) === 1 ? "minute" : "minutes"
        } ago`;
    } else if (diffInSeconds < 86400) {
        // Less than 24 hours
        formattedTime = `${Math.floor(diffInSeconds / 3600)} ${
            Math.floor(diffInSeconds / 3600) === 1 ? "hour" : "hours"
        } ago`;
    } else if (diffInSeconds < 604800) {
        // Less than a week
        formattedTime = `${Math.floor(diffInSeconds / 86400)} ${
            Math.floor(diffInSeconds / 86400) === 1 ? "day" : "days"
        } ago`;
    } else if (diffInSeconds < 1209600) {
        // More than a week but less than two weeks
        formattedTime = `${Math.floor(diffInSeconds / 604800)} ${
            Math.floor(diffInSeconds / 604800) === 1 ? "week" : "weeks"
        } ago`;
    } else if (diffInSeconds < 31536000) {
        // More than two weeks but less than a year
        formattedTime = `${then.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    } else {
        // More than a year
        formattedTime = `${then.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        })}`;
    }

    return formattedTime;
}

/**
 * Parses a URL query string into an object where keys are the names of the query parameters and values are their corresponding values.
 *
 * @param {string} query - The query string to parse, e.g., "key=value&anotherKey=anotherValue".
 * @returns {Record<string, string>} An object representing the parsed query string, where each key-value pair corresponds to a query parameter and its value.
 */
export function parseQueryString(query: string): Record<string, string> {
    return query
        .replace(/^\?/, "")
        .split("&")
        .reduce(
            (acc: Record<string, string>, keyValue) => {
                const [key, value] = keyValue.split("=");
                acc[key] = value;
                return acc;
            },
            {} as Record<string, string>
        );
}

/**
 * Converts an HTML string to a Markdown-formatted string.
 *
 * This function handles the conversion of various HTML tags,
 * including those with attributes, into their Markdown equivalents.
 * It supports headings, paragraphs, emphasis, strong text, links,
 * images, lists, blockquotes, inline code, and code blocks.
 *
 * @param {string} html - The HTML string to convert to Markdown.
 * @returns {string} The converted Markdown string.
 *
 * @example
 * htmlToMarkdown("<h1>Title</h1><p><em>Text</em></p>");
 * // Returns: "# Title\n\n_Text_\n\n"
 */
/* eslint-disable no-param-reassign */
export function htmlToMarkdown(html: string): string {
    // Replace <h1> to <h6> with Markdown equivalents, accounting for attributes
    html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gis, "# $1\n\n");
    html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gis, "## $1\n\n");
    html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gis, "### $1\n\n");
    html = html.replace(/<h4[^>]*>(.*?)<\/h4>/gis, "#### $1\n\n");
    html = html.replace(/<h5[^>]*>(.*?)<\/h5>/gis, "##### $1\n\n");
    html = html.replace(/<h6[^>]*>(.*?)<\/h6>/gis, "###### $1\n\n");

    // Replace <p> or <div> with double newlines (Markdown paragraph), accounting for attributes
    html = html.replace(/<p[^>]*>(.*?)<\/p>/gis, "$1\n\n");
    html = html.replace(/<div[^>]*>(.*?)<\/div>/gis, "$1\n\n");

    // Replace <em> or <i> with underscores for emphasis, accounting for attributes
    html = html.replace(/<em[^>]*>(.*?)<\/em>/gis, "_$1_");
    html = html.replace(/<i[^>]*>(.*?)<\/i>/gis, "_$1_");

    // Replace <strong> or <b> with double asterisks for bold, accounting for attributes
    html = html.replace(/<strong[^>]*>(.*?)<\/strong>/gis, "**$1**");
    html = html.replace(/<b[^>]*>(.*?)<\/b>/gis, "**$1**");

    // Replace <a> with Markdown link format, accounting for attributes
    html = html.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gis, "[$2]($1)");

    // Replace <img> with Markdown image format, accounting for attributes
    html = html.replace(/<img[^>]*src="(.*?)"[^>]*alt="(.*?)"[^>]*>/gis, "![$2]($1)");

    // Replace <ul> and <ol> with appropriate Markdown list formats, accounting for attributes
    html = html.replace(
        /<ul[^>]*>(.*?)<\/ul>/gis,
        (match, content) => `${content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")}\n`
    );
    html = html.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
        let i = 1;
        const newHtml = `${content.replace(/<li[^>]*>(.*?)<\/li>/gi, `${(i += 1)}. $1\n`)}\n`;
        return newHtml;
    });

    // Replace <blockquote> with Markdown blockquote, accounting for attributes
    html = html.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, "> $1\n");

    // Replace <code> with backticks for inline code, accounting for attributes
    html = html.replace(/<code[^>]*>(.*?)<\/code>/gis, "`$1`");

    // Replace <pre> with triple backticks for code blocks, accounting for attributes
    html = html.replace(/<pre[^>]*>(.*?)<\/pre>/gis, "```\n$1\n```");

    // Remove remaining HTML tags
    html = html.replace(/<\/?[^>]+(>|$)/g, "");

    return html.trim();
}
/* eslint-enable no-param-reassign */

/**
 * Converts a Markdown string to an HTML-formatted string.
 *
 * This function handles the conversion of various Markdown elements,
 * including headers, bold and emphasis text, links, images, lists,
 * blockquotes, code blocks, and paragraphs into their HTML equivalents.
 *
 * @param {string} markdown - The Markdown string to convert to HTML.
 * @returns {string} The converted HTML string.
 *
 * @example
 * markdownToHtml("[CiteEase](https://discontinuedlabs.github.io/citeease)");
 * // Returns: '<a href="https://discontinuedlabs.github.io/citeease">CiteEase</a>'
 */
/* eslint-disable no-param-reassign, quotes */
export function markdownToHtml(markdown: string): string {
    // Replace Markdown headers with HTML headers
    markdown = markdown.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
    markdown = markdown.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
    markdown = markdown.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
    markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Replace Markdown bold with HTML <strong>
    markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

    // Replace Markdown emphasis with HTML <em>
    markdown = markdown.replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // Replace Markdown links with HTML <a>
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

    // Replace Markdown images with HTML <img>
    markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />');

    // Replace Markdown unordered lists with HTML <ul> and <li>
    markdown = markdown.replace(/^\s*-\s+(.*$)/gim, "<li>$1</li>");
    markdown = markdown.replace(/<\/li>\n<li>/gim, "</li><li>");
    markdown = markdown.replace(/<li>(.*?)<\/li>/gim, "<ul><li>$1</li></ul>");
    markdown = markdown.replace(/<\/ul>\n<ul>/gim, "");

    // Replace Markdown ordered lists with HTML <ol> and <li>
    markdown = markdown.replace(/^\s*\d+\.\s+(.*$)/gim, "<li>$1</li>");
    markdown = markdown.replace(/<\/li>\n<li>/gim, "</li><li>");
    markdown = markdown.replace(/<li>(.*?)<\/li>/gim, "<ol><li>$1</li></ol>");
    markdown = markdown.replace(/<\/ol>\n<ol>/gim, "");

    // Replace Markdown blockquotes with HTML <blockquote>
    markdown = markdown.replace(/^\s*>\s+(.*$)/gim, "<blockquote>$1</blockquote>");

    // Replace Markdown inline code with HTML <code>
    markdown = markdown.replace(/`(.*?)`/gim, "<code>$1</code>");

    // Replace Markdown code blocks with HTML <pre><code>
    markdown = markdown.replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>");

    // Replace Markdown paragraphs with HTML <p>
    markdown = markdown.replace(/^\s*(.*[^\n])\n+/gim, "<p>$1</p>");

    // Trim leading and trailing whitespace
    markdown = markdown.trim();

    return markdown;
}
/* eslint-enable no-param-reassign, quotes */

/**
 * Parses an HTML string and returns a DocumentFragment.
 *
 * @param {string} htmlString - The HTML string to be parsed.
 * @returns {DocumentFragment} A DocumentFragment containing the content of the parsed HTML string.
 */
export function parseHtmlString(htmlString: string): DocumentFragment {
    const parser = new DOMParser();

    const doc = parser.parseFromString(htmlString, "text/html");

    // Remove the <head> element
    const { head } = doc;
    if (head) {
        head.remove();
    }

    // Create a DocumentFragment to hold the content
    const fragment = document.createDocumentFragment();
    const bodyContent = doc.body;
    while (bodyContent.firstChild) {
        fragment.appendChild(bodyContent.firstChild);
    }

    return fragment;
}

/**
 * Converts an HTML string into a React element.
 *
 * This function parses an HTML string and converts it into a React element
 * using a recursive traversal of the DOM nodes. It supports common HTML tags
 * and returns the corresponding React components.
 *
 * @param {string} htmlString - The HTML string to be converted to JSX.
 * @returns {React.ReactNode} - A React node representing the parsed HTML.
 */
/* eslint-disable indent */
export function parseHtmlToJsx(htmlString: string): React.ReactNode {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const rootElement = doc.body;

    function traverseNodes(node: ChildNode | HTMLElement): React.ReactNode {
        if (node.nodeType === Node.TEXT_NODE) {
            return (node as Text).textContent;
        }

        const children = Array.from(node.childNodes).map((childNode) => traverseNodes(childNode));

        switch (node.nodeName) {
            case "P":
                return <p key={uid()}>{children}</p>;
            case "H1":
                return <h1 key={uid()}>{children}</h1>;
            case "H2":
                return <h2 key={uid()}>{children}</h2>;
            case "H3":
                return <h3 key={uid()}>{children}</h3>;
            case "H4":
                return <h4 key={uid()}>{children}</h4>;
            case "H5":
                return <h5 key={uid()}>{children}</h5>;
            case "H6":
                return <h6 key={uid()}>{children}</h6>;
            case "UL":
                return <ul key={uid()}>{children}</ul>;
            case "OL":
                return <ol key={uid()}>{children}</ol>;
            case "LI":
                return <li key={uid()}>{children}</li>;
            case "BLOCKQUOTE":
                return <blockquote key={uid()}>{children}</blockquote>;
            case "PRE":
                return <pre key={uid()}>{children}</pre>;
            case "CODE":
                return <code key={uid()}>{children}</code>;
            case "STRONG":
                return <strong key={uid()}>{children}</strong>;
            case "EM":
                return <em key={uid()}>{children}</em>;
            case "A":
                return (
                    <a key={uid()} href={(node as HTMLAnchorElement).href}>
                        {children}
                    </a>
                );
            case "IMG":
                return <img key={uid()} src={(node as HTMLImageElement).src} alt={(node as HTMLImageElement).alt} />;
            default:
                return children;
        }
    }

    return traverseNodes(rootElement);
}

/* eslint-enable indent */
