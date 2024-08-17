import TurndownService from "turndown";
import { Citation, CitationStyle } from "../types/types.ts";
import * as citationEngine from "./citationEngine";

type ExportOptions = {
    fileName?: string;
};

/**
 * Exports a list of citations to a TXT file, applying a specified citation style.
 *
 * @param {Citation[]} citations - An array of citation objects to be formatted and exported.
 * Each citation object should conform to the {@link Citation} interface.
 * @param {CitationStyle} style - The citation style to be applied to the citations.
 * This parameter determines the formatting of the citations according to the specified style.
 * @param {ExportOptions} options - Options for exporting the citations.
 * This object can contain a `fileName` property to specify the filename of the exported Markdown file.
 * If not provided, the default filename is "references.md".
 *
 * @returns {Promise<void>} A promise that resolves once the TXT file has been downloaded.
 * Note: This function triggers a file download and does not return the file content.
 *
 * @example
 * // Example usage
 * const citations = [
 *     {
 *         id: "S0TXWcmgJh2oIhkHBpxl",
 *         content: {
 *             type: "webpage",
 *             author: [
 *                 {
 *                     given: "Cathy",
 *                     family: "Cassata",
 *                     id: "d0tZr4hvZmOEqBUZ21wZ",
 *                 },
 *             ],
 *             title: "High Cholesterol: How to Avoid Increasing Levels During the Holidays",
 *             "container-title": "Healthline",
 *             accessed: {
 *                 "date-parts": [[2024, 8, 17]],
 *             },
 *             issued: {
 *                 "date-parts": [[2022, 11, 17]],
 *             },
 *             URL: "https://www.healthline.com/health-news/how-to-avoid-cholesterol-spikes-during-the-holidays",
 *         },
 *     },
 *     {
 *         id: "V9KyV8SViQRETC5WYg7C",
 *         content: {
 *             type: "webpage",
 *             title: " Effective Water Quality Management for Fish Farming",
 *             accessed: {
 *                 "date-parts": [[2024, 8, 17]],
 *             },
 *             URL: "https://www.bivatec.com/blog/water-quality-and-bottom-soil-management-of-fish-ponds",
 *         },
 *     },
 * ];
 * const style = {
 *     name: {
 *         long: "American Medical Association 11th edition",
 *         short: "AMA (11th ed.)",
 *     },
 *     code: "american-medical-association",
 *     license: {
 *         text: "This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License",
 *         url: "http://creativecommons.org/licenses/by-sa/3.0/",
 *     },
 * };
 * exportToTxt(citations, style);
 *
 * @see Citation
 * @see CitationStyle
 * @see ExportOptions
 */
export async function exportToTxt(citations: Citation[], style: CitationStyle, options: ExportOptions): Promise<void> {
    const formattedCitations: string = await citationEngine.formatBibliography(citations, style, "text");

    // Create a Blob from the TXT content
    const blob = new Blob([formattedCitations], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options?.fileName || "references"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the Blob URL to avoid memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Exports a list of citations to an HTML file, applying a specified citation style.
 *
 * @param {Citation[]} citations - An array of citation objects to be formatted and exported.
 * Each citation object should conform to the {@link Citation} interface.
 * @param {CitationStyle} style - The citation style to be applied to the citations.
 * This parameter determines the formatting of the citations according to the specified style.
 * @param {ExportOptions} options - Options for exporting the citations.
 * This object can contain a `fileName` property to specify the filename of the exported Markdown file.
 * If not provided, the default filename is "references.md".
 *
 * @returns {Promise<void>} A promise that resolves once the HTML file has been downloaded.
 * Note: This function triggers a file download and does not return the file content.
 *
 * @example
 * // Example usage
 * const citations = [
 *     {
 *         id: "S0TXWcmgJh2oIhkHBpxl",
 *         content: {
 *             type: "webpage",
 *             author: [
 *                 {
 *                     given: "Cathy",
 *                     family: "Cassata",
 *                     id: "d0tZr4hvZmOEqBUZ21wZ",
 *                 },
 *             ],
 *             title: "High Cholesterol: How to Avoid Increasing Levels During the Holidays",
 *             "container-title": "Healthline",
 *             accessed: {
 *                 "date-parts": [[2024, 8, 17]],
 *             },
 *             issued: {
 *                 "date-parts": [[2022, 11, 17]],
 *             },
 *             URL: "https://www.healthline.com/health-news/how-to-avoid-cholesterol-spikes-during-the-holidays",
 *         },
 *     },
 *     {
 *         id: "V9KyV8SViQRETC5WYg7C",
 *         content: {
 *             type: "webpage",
 *             title: " Effective Water Quality Management for Fish Farming",
 *             accessed: {
 *                 "date-parts": [[2024, 8, 17]],
 *             },
 *             URL: "https://www.bivatec.com/blog/water-quality-and-bottom-soil-management-of-fish-ponds",
 *         },
 *     },
 * ];
 * const style = {
 *     name: {
 *         long: "American Medical Association 11th edition",
 *         short: "AMA (11th ed.)",
 *     },
 *     code: "american-medical-association",
 *     license: {
 *         text: "This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License",
 *         url: "http://creativecommons.org/licenses/by-sa/3.0/",
 *     },
 * };
 * exportToHtml(citations, style);
 *
 * @see Citation
 * @see CitationStyle
 * @see ExportOptions
 */
export async function exportToHtml(citations: Citation[], style: CitationStyle, options: ExportOptions): Promise<void> {
    const formattedCitationsArray: string[] = await citationEngine.formatBibliography(citations, style);

    const cleanedCitations = formattedCitationsArray.map((citation) => citation.replace(/,\s*$/, "").trim());
    const fullHtmlContent = cleanedCitations.join("");

    const css = `<style>
                    .csl-entry {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.5rem;
                        margin-right: 0.5rem;
                    }
                </style>`;
    const finalHtmlContent = `${css}${fullHtmlContent}`;

    // Create a Blob from the HTML content
    const blob = new Blob([finalHtmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options?.fileName || "references"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the Blob URL to avoid memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Exports a list of citations to a Markdown file, applying a specified citation style.
 * The citations are first formatted as HTML, then converted to Markdown using Turndown.
 *
 * @param {Citation[]} citations - An array of citation objects to be formatted and exported.
 * Each citation object should conform to the {@link Citation} interface.
 * @param {CitationStyle} style - The citation style to be applied to the citations.
 * This parameter determines the formatting of the citations according to the specified style.
 * @param {ExportOptions} options - Options for exporting the citations.
 * This object can contain a `fileName` property to specify the filename of the exported Markdown file.
 * If not provided, the default filename is "references.md".
 *
 * @returns {Promise<void>} A promise that resolves once the Markdown file has been downloaded.
 * Note: This function triggers a file download and does not return the file content.
 *
 * @example
 * // Example usage
 * const citations = [
 *     {
 *         id: "S0TXWcmgJh2oIhkHBpxl",
 *         content: {
 *             type: "webpage",
 *             author: [
 *                 {
 *                     given: "Cathy",
 *                     family: "Cassata",
 *                     id: "d0tZr4hvZmOEqBUZ21wZ",
 *                 },
 *             ],
 *             title: "High Cholesterol: How to Avoid Increasing Levels During the Holidays",
 *             "container-title": "Healthline",
 *             accessed: {
 *                 "date-parts": [[2024, 8, 17]],
 *             },
 *             issued: {
 *                 "date-parts": [[2022, 11, 17]],
 *             },
 *             URL: "https://www.healthline.com/health-news/how-to-avoid-cholesterol-spikes-during-the-holidays",
 *         },
 *     },
 *     {
 *         id: "V9KyV8SViQRETC5WYg7C",
 *         content: {
 *             type: "webpage",
 *             title: " Effective Water Quality Management for Fish Farming",
 *             accessed: {
 *                 "date-parts": [[2024, 8, 17]],
 *             },
 *             URL: "https://www.bivatec.com/blog/water-quality-and-bottom-soil-management-of-fish-ponds",
 *         },
 *     },
 * ];
 * const style = {
 *     name: {
 *         long: "American Medical Association 11th edition",
 *         short: "AMA (11th ed.)",
 *     },
 *     code: "american-medical-association",
 *     license: {
 *         text: "This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License",
 *         url: "http://creativecommons.org/licenses/by-sa/3.0/",
 *     },
 * };
 * exportToMarkdown(citations, style);
 *
 * @see Citation
 * @see CitationStyle
 * @see ExportOptions
 */
export async function exportToMd(citations: Citation[], style: CitationStyle, options: ExportOptions): Promise<void> {
    const formattedCitationsArray: string[] = await citationEngine.formatBibliography(citations, style);
    const cleanedCitations = formattedCitationsArray.map((citation) => citation.replace(/,\s*$/, "").trim());

    // Parse the HTML content into a DOM tree to remove divs with the classes ".csl-left-margin" and ".csl-right-inline"
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedCitations.join(""), "text/html");
    doc.body.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && "classList" in node) {
            const entryElement = node as HTMLElement;

            const leftMarginDiv = entryElement.querySelector(".csl-left-margin");
            const rightInlineDiv = entryElement.querySelector(".csl-right-inline");

            if (leftMarginDiv && rightInlineDiv) {
                const combinedText = `${leftMarginDiv.textContent || ""} ${rightInlineDiv.textContent || ""}`;
                leftMarginDiv.parentNode!.replaceChild(document.createTextNode(combinedText), leftMarginDiv);
                rightInlineDiv.parentNode!.replaceChild(document.createTextNode(combinedText), rightInlineDiv);
            }
        }
    });

    // Serialize the modified DOM back into a string
    const serializer = new XMLSerializer();
    const modifiedHtmlContent = serializer.serializeToString(doc.documentElement);

    // Convert HTML to Markdown using "turndown" library
    const turndownService = new TurndownService();
    const markdownContent = turndownService.turndown(modifiedHtmlContent);

    // Create a Blob from the Markdown content
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    // Download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options.fileName || "references"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the Blob URL to avoid memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
