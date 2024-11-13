import React from "react";
import { BibJson, CslJson } from "../types/types.ts";
import { uid } from "./utils.ts";
import { createDateObject } from "./citationUtils.ts";

/**
 * Converts an HSL string to an HSLA string with a specified alpha value.
 *
 * @param {string} hslString - The HSL string in the format "hsl(h, s%, l%)".
 * @param {number} alpha - The alpha value for the HSLA string (between 0 and 1).
 * @returns {string | undefined} The corresponding HSLA string in the format "hsla(h, s%, l%, a)", or `undefined` if the input HSL string is invalid.
 */
export function hslToHSLA(hsl: string, alpha: number): string | undefined {
    const hslValues = hsl?.match(/\d+(\.\d+)?/g);

    if (hslValues && hslValues.length === 3) {
        const [h, s, l] = hslValues;
        return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
    }
    return undefined;
}

/**
 * Converts a hex color code to HSL (Hue, Saturation, Lightness) format.
 *
 * @param {string} hex - The hex color code (e.g., "#RRGGBB" or "RRGGBB").
 * @param {boolean} [stringified=true] - If true, returns the HSL value as a formatted string. If false, returns an object with `h`, `s`, and `l` properties.
 * @returns {string | { h: number, s: number, l: number }} - The HSL representation of the color. Returns a string in the format "hsl(h, s%, l%)" if `stringified` is true, otherwise an object with properties `h`, `s`, and `l`.
 */
export function hexToHSL(hex: string, stringified: boolean = true): string | { h: number; s: number; l: number } {
    const cleanedHex = hex.replace(/^#/, "");

    const r = parseInt(cleanedHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanedHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanedHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let l = (max + min) / 2;

    let s = 0;
    if (max !== min) {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    }

    let h = 0;
    if (max === r) {
        h = (g - b) / (max - min);
    } else if (max === g) {
        h = 2 + (b - r) / (max - min);
    } else if (max === b) {
        h = 4 + (r - g) / (max - min);
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return stringified ? `hsl(${h}, ${s}, ${l})` : { h, s, l };
}

/**
 * Converts an HTML string to a Markdown-formatted string.
 *
 * Note: This is a basic function designed to meet the specific needs of
 * CiteEase. It is not comprehensive and should not be considered a
 * replacement for full-fledged HTML-to-markdown libraries.
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
 * Note: This is a basic function designed to meet the specific needs of
 * CiteEase. It is not comprehensive and should not be considered a
 * replacement for full-fledged markdown-to-HTML libraries.
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

    // Replace Markdown bold with HTML <b>
    markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");

    // Replace Markdown emphasis with HTML <i>
    markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");
    markdown = markdown.replace(/_(.*?)_/gim, "<i>$1</i>");

    // Replace Markdown images with HTML <img>
    markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />');

    // Replace Markdown links with HTML <a>
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

    // Replace Markdown unordered lists with HTML <ul> and <li>
    markdown = markdown.replace(/(?:^\s*-\s+.*$\n?)+/gim, (match) => {
        const items = match
            .trim()
            .split("\n")
            .map((line) => `${line.replace(/^\s*-\s+/, "<li>")}</li>`);
        return `<ul>${items.join("")}</ul>`;
    });

    // Replace Markdown ordered lists with HTML <ol> and <li>
    markdown = markdown.replace(/(?:^\s*\d+\.\s+.*$\n?)+/gim, (match) => {
        const items = match
            .trim()
            .split("\n")
            .map((line) => `${line.replace(/^\s*\d+\.\s+/, "<li>")}</li>`);
        return `<ol>${items.join("")}</ol>`;
    });

    // Replace Markdown blockquotes with HTML <blockquote>
    markdown = markdown.replace(/^\s*>\s+(.*$)/gim, "<blockquote>$1</blockquote>");

    // Replace Markdown inline code with HTML <code>
    markdown = markdown.replace(/`(.*?)`/gim, "<code>$1</code>");

    // Replace Markdown code blocks with HTML <pre><code>
    markdown = markdown.replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>");

    // Replace Markdown paragraphs with HTML <p>
    markdown = markdown.replace(/^(?!\s*<\/?\w+[^>]*>)(.+)$/gm, "<p>$1</p>");

    // Trim leading and trailing whitespace
    markdown = markdown.trim();

    return markdown;
}
/* eslint-enable no-param-reassign, quotes */

/**
 * Parses an HTML string and returns the content of the <body> element.
 *
 * @param {string} htmlString - The HTML string to be parsed.
 * @returns {HTMLElement} An HTMLElement containing the content from the HTML string.
 */
export function parseHtmlString(htmlString: string): HTMLElement {
    const parser = new DOMParser();

    const doc = parser.parseFromString(htmlString, "text/html");

    const { head } = doc;
    if (head) {
        head.remove();
    }

    return doc.body;
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
/* eslint-disable indent, react/jsx-props-no-spreading */
export function parseHtmlToJsx(htmlString: string): React.ReactNode {
    function traverseNodes(node: ChildNode | HTMLElement): React.ReactNode {
        if (node.nodeType === Node.TEXT_NODE) {
            return (node as Text).textContent;
        }

        const children = Array.from(node.childNodes).map((childNode) => traverseNodes(childNode));

        const element = node as HTMLElement;
        const props: React.HTMLProps<HTMLElement> = {};

        Array.from(element.attributes).forEach((attr) => {
            if (attr.name === "class") {
                props.className = attr.value;
            } else {
                props[attr.name] = attr.value;
            }
        });

        switch (node.nodeName) {
            case "P":
                return (
                    <p key={uid()} {...(props as React.HTMLProps<HTMLParagraphElement>)}>
                        {children}
                    </p>
                );

            case "DIV":
                return (
                    <div key={uid()} {...(props as React.HTMLProps<HTMLDivElement>)}>
                        {children}
                    </div>
                );

            case "H1":
                return (
                    <h1 key={uid()} {...(props as React.HTMLProps<HTMLHeadingElement>)}>
                        {children}
                    </h1>
                );
            case "H2":
                return (
                    <h2 key={uid()} {...(props as React.HTMLProps<HTMLHeadingElement>)}>
                        {children}
                    </h2>
                );
            case "H3":
                return (
                    <h3 key={uid()} {...(props as React.HTMLProps<HTMLHeadingElement>)}>
                        {children}
                    </h3>
                );
            case "H4":
                return (
                    <h4 key={uid()} {...(props as React.HTMLProps<HTMLHeadingElement>)}>
                        {children}
                    </h4>
                );
            case "H5":
                return (
                    <h5 key={uid()} {...(props as React.HTMLProps<HTMLHeadingElement>)}>
                        {children}
                    </h5>
                );
            case "H6":
                return (
                    <h6 key={uid()} {...(props as React.HTMLProps<HTMLHeadingElement>)}>
                        {children}
                    </h6>
                );
            case "UL":
                return (
                    <ul key={uid()} {...(props as React.HTMLProps<HTMLUListElement>)}>
                        {children}
                    </ul>
                );
            case "OL":
                return (
                    <ol key={uid()} {...(props as React.OlHTMLAttributes<HTMLOListElement>)}>
                        {children}
                    </ol>
                );
            case "LI":
                return (
                    <li key={uid()} {...(props as React.HTMLProps<HTMLLIElement>)}>
                        {children}
                    </li>
                );
            case "BLOCKQUOTE":
                return (
                    <blockquote key={uid()} {...(props as React.HTMLProps<HTMLQuoteElement>)}>
                        {children}
                    </blockquote>
                );
            case "PRE":
                return (
                    <pre key={uid()} {...(props as React.HTMLProps<HTMLPreElement>)}>
                        {children}
                    </pre>
                );
            case "CODE":
                return (
                    <code key={uid()} {...(props as React.HTMLProps<HTMLElement>)}>
                        {children}
                    </code>
                );
            case "B":
                return (
                    <b key={uid()} {...(props as React.HTMLProps<HTMLElement>)}>
                        {children}
                    </b>
                );
            case "STRONG":
                return (
                    <strong key={uid()} {...(props as React.HTMLProps<HTMLElement>)}>
                        {children}
                    </strong>
                );
            case "I":
                return (
                    <i key={uid()} {...(props as React.HTMLProps<HTMLElement>)}>
                        {children}
                    </i>
                );
            case "EM":
                return (
                    <em key={uid()} {...(props as React.HTMLProps<HTMLEmbedElement>)}>
                        {children}
                    </em>
                );
            case "A":
                return (
                    <a key={uid()} {...(props as React.HTMLProps<HTMLAnchorElement>)}>
                        {children}
                    </a>
                );
            case "IMG":
                return <img key={uid()} alt={props.alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
            default:
                return children;
        }
    }

    const element = parseHtmlString(htmlString);
    return traverseNodes(element);
}
/* eslint-enable indent, react/jsx-props-no-spreading */

/**
 * Converts a CSL-JSON object to a BibJSON object.
 *
 * @param {CslJson} cslJson - The CSL-JSON object to be converted.
 * @returns {BibJson} - The resulting BibJSON object containing bibliographic data in BibJSON format.
 */
export function cslToBibJSON(cslJson: CslJson): BibJson {
    const bibJson: BibJson = {};

    // Title and subtitle
    if (cslJson.title) bibJson.title = cslJson.title;
    if (cslJson.subtitle) bibJson.subtitle = cslJson.subtitle;

    // Authors
    if (cslJson.author) {
        bibJson.author = cslJson.author.map((author) => {
            let name = "";
            if (author.given) name += `${author.given} `;
            if (author.family) name += author.family;
            return { name: name.trim(), firstname: author.given, lastname: author.family };
        });
    }

    // Editors
    if (cslJson.editor) {
        bibJson.editor = cslJson.editor.map((editor) => {
            let name = "";
            if (editor.given) name += `${editor.given} `;
            if (editor.family) name += editor.family;
            return { name: name.trim(), firstname: editor.given, lastname: editor.family };
        });
    }

    // Translators
    if (cslJson.translator) {
        bibJson.translator = cslJson.translator.map((translator) => {
            let name = "";
            if (translator.given) name += `${translator.given} `;
            if (translator.family) name += translator.family;
            return { name: name.trim(), firstname: translator.given, lastname: translator.family };
        });
    }

    // Date issued (year)
    if (cslJson.issued && cslJson.issued["date-parts"] && cslJson.issued["date-parts"][0]) {
        bibJson.year = cslJson.issued["date-parts"][0][0]?.toString();
    }

    // Date accessed
    if (cslJson.accessed && cslJson.accessed["date-parts"] && cslJson.accessed["date-parts"][0]) {
        bibJson.accessed = cslJson.accessed["date-parts"][0].join("-");
    }

    // Publisher
    if (cslJson.publisher) bibJson.publisher = cslJson.publisher;
    if (cslJson["publisher-place"]) bibJson.pubplace = cslJson["publisher-place"];

    // Journal title
    if (cslJson["container-title"]) [bibJson.journal] = cslJson["container-title"];

    // Volume, issue, and page range
    if (cslJson.volume) bibJson.volume = cslJson.volume;
    if (cslJson.issue) bibJson.issue = cslJson.issue;
    if (cslJson.page) bibJson.pages = cslJson.page;

    // Identifiers (DOI, ISBN, ISSN)
    bibJson.identifier = [];
    if (cslJson.DOI) (bibJson.identifier as object[]).push({ type: "doi", id: cslJson.DOI });
    if (cslJson.ISBN) (bibJson.identifier as object[]).push({ type: "isbn", id: cslJson.ISBN });
    if (cslJson.ISSN) (bibJson.identifier as object[]).push({ type: "issn", id: cslJson.ISSN });

    // URL
    if (cslJson.URL) {
        bibJson.link = [{ url: cslJson.URL }];
    }

    // Type mapping
    const typeMapping = {
        book: "Book",
        "article-journal": "Journal Article",
        chapter: "Book Chapter",
        thesis: "Thesis",
        report: "Report",
        "paper-conference": "Conference Paper",
        webpage: "Web Page",
        manuscript: "Manuscript",
        "magazine-article": "Magazine Article",
        "newspaper-article": "Newspaper Article",
    };
    bibJson.type = cslJson.type && typeMapping[cslJson.type] ? typeMapping[cslJson.type] : "Misc";

    // Keywords
    if (cslJson.keyword) {
        bibJson.keywords = Array.isArray(cslJson.keyword) ? cslJson.keyword.join(", ") : cslJson.keyword;
    }

    // Abstract
    if (cslJson.abstract) {
        bibJson.abstract = cslJson.abstract;
    }

    // Language
    if (cslJson.language) bibJson.language = cslJson.language;

    return bibJson;
}

/**
 * Converts a BibJSON object to a CSL-JSON object.
 *
 * @param {BibJson} bibJson - The BibJSON object to be converted.
 * @returns {CslJson} - The resulting CSL-JSON object containing bibliographic data in CSL-JSON format.
 */
/* eslint-disable indent */
export function bibToCslJSON(bibJson: BibJson): CslJson {
    const cslJson: CslJson = {};

    // Title and subtitle
    if (bibJson.title) cslJson.title = bibJson.title;
    if (bibJson.subtitle) cslJson.subtitle = bibJson.subtitle;

    // Authors
    if (bibJson.author) {
        cslJson.author = bibJson.author.map((author) => {
            const nameParts = author.name.split(" ");
            const family = nameParts.pop(); // Assume the last part is the family name
            const given = nameParts.join(" ");
            return {
                given: given || "",
                family: family || "",
            };
        });
    }

    // Editors
    if (bibJson.editor) {
        cslJson.editor = bibJson.editor.map((editor) => {
            const nameParts = editor.name.split(" ");
            const family = nameParts.pop();
            const given = nameParts.join(" ");
            return {
                given: given || "",
                family: family || "",
            };
        });
    }

    // Translators
    if (bibJson.translator) {
        cslJson.translator = bibJson.translator.map((translator) => {
            const nameParts = translator.name.split(" ");
            const family = nameParts.pop();
            const given = nameParts.join(" ");
            return {
                given: given || "",
                family: family || "",
            };
        });
    }

    // Date issued
    if (bibJson.year) {
        cslJson.issued = createDateObject(Number(bibJson.year));
    }

    // Date accessed
    if (bibJson.accessed) {
        cslJson.accessed = createDateObject(Number(bibJson.accessed.split("-").map((part) => part)));
    }

    // Publisher and place
    if (bibJson.publisher) cslJson.publisher = bibJson.publisher;
    if (bibJson.pubplace) cslJson["publisher-place"] = bibJson.pubplace;

    // Journal title
    if (bibJson.journal) cslJson["container-title"] = [bibJson.journal];

    // Volume, issue, and pages
    if (bibJson.volume) cslJson.volume = bibJson.volume;
    if (bibJson.issue) cslJson.issue = bibJson.issue;
    if (bibJson.pages) cslJson.page = bibJson.pages;

    // Identifiers (DOI, ISBN, ISSN, PMID, PMCID)
    if (bibJson.identifier) {
        bibJson.identifier.forEach((id) => {
            switch (id.type.toLowerCase()) {
                case "doi":
                    cslJson.DOI = id.id;
                    break;
                case "isbn":
                    cslJson.ISBN = id.id;
                    break;
                case "issn":
                    cslJson.ISSN = id.id;
                    break;
                case "pmid":
                    cslJson.PMID = id.id;
                    break;
                case "pmcid":
                    cslJson.PMCID = id.id;
                    break;
                default:
                    console.log(`Unhandled identifier type: ${id.type}`);
                    break;
            }
        });
    }

    // URL
    if (bibJson.link && bibJson.link.length > 0) {
        cslJson.URL = bibJson.link[0].url;
    }

    // Type mapping
    const typeMapping = {
        Book: "book",
        "Journal Article": "article-journal",
        "Book Chapter": "chapter",
        Thesis: "thesis",
        Report: "report",
        "Conference Paper": "paper-conference",
        "Web Page": "webpage",
        Manuscript: "manuscript",
        "Magazine Article": "magazine-article",
        "Newspaper Article": "newspaper-article",
        Misc: "misc",
    };
    cslJson.type = bibJson.type && typeMapping[bibJson.type] ? typeMapping[bibJson.type] : "misc";

    // Keywords
    if (bibJson.keywords) {
        cslJson.keyword = bibJson.keywords.split(",").map((kw) => kw.trim());
    }

    // Abstract
    if (bibJson.abstract) {
        cslJson.abstract = bibJson.abstract;
    }

    // Language
    if (bibJson.language) cslJson.language = bibJson.language;

    return cslJson;
}
/* eslint-enable indent */
