import { Citation, CitationStyle } from "../types/types.ts";
import * as citationEngine from "./citationEngine";
import { cslToBibJSON, htmlToMarkdown } from "./conversionUtils.tsx";

function getDefaultName(fileName) {
    return fileName.trim() || "References";
}

type ExportOptions = {
    fileName?: string;
};

type LatexFormats = "bibtex" | "biblatex" | "bibtxt";

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
}

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
 * @throws {Error} - If the plain text formatting fails, an error is logged to the console.
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
export async function exportToTxt(
    citations: Citation[],
    style: CitationStyle,
    locale: string,
    options: ExportOptions
): Promise<void> {
    try {
        const formattedCitations: string = await citationEngine.formatBibliography(citations, style, "text", locale);
        downloadFile(formattedCitations, `${getDefaultName(options.fileName)}.txt`, "text/plain");
    } catch (error) {
        console.error("Failed to export citations: ", error);
    }
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
 * @throws {Error} - If the HTML formatting fails, an error is logged to the console.
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
export async function exportToHtml(
    citations: Citation[],
    style: CitationStyle,
    locale: string,
    options: ExportOptions
): Promise<void> {
    try {
        const formattedCitationsArray: string[] = await citationEngine.formatBibliography(
            citations,
            style,
            "html",
            locale
        );
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

        downloadFile(finalHtmlContent, `${getDefaultName(options.fileName)}.html`, "text/html");
    } catch (error) {
        console.error("Failed to export citations: ", error);
    }
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
 * @throws {Error} - If the Markdown formatting fails, an error is logged to the console.
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
export async function exportToMd(
    citations: Citation[],
    style: CitationStyle,
    locale: string,
    options: ExportOptions
): Promise<void> {
    try {
        const formattedCitationsArray: string[] = await citationEngine.formatBibliography(
            citations,
            style,
            "html",
            locale
        );
        const cleanedCitations = formattedCitationsArray.map((citation) => citation.replace(/,\s*$/, "").trim());

        // Parse the HTML content into a DOM tree to remove unwanted elements
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

        // Serialize the modified DOM back into a string and convert HTML to Markdown
        const serializer = new XMLSerializer();
        const modifiedHtmlContent = serializer.serializeToString(doc.documentElement);
        const markdownContent = htmlToMarkdown(modifiedHtmlContent);

        downloadFile(markdownContent, `${getDefaultName(options.fileName)}.md`, "text/markdown");
    } catch (error) {
        console.error("Failed to export citations: ", error);
    }
}

/**
 * Exports a list of citations to a JSON file formatted for CSL-JSON.
 *
 * @param {Citation[]} citations - An array of citation objects to be formatted and exported.
 * Each citation object should conform to the {@link Citation} interface.
 * @param {ExportOptions} options - The options for exporting the file, including the file name.
 * @returns {void} Does not return anything; instead, triggers a file download of the transformed citations in JSON format.
 *
 * @example
 * // Example usage
 * const citations = [
 *     {
 *         "id": "9pvrqrczWNcet5vZhoRs",
 *         "content": {
 *             "id": "9pvrqrczWNcet5vZhoRs",
 *             "type": "webpage",
 *             "author": [
 *                 {
 *                     "given": "Vshssv",
 *                     "family": "Svsjsbs",
 *                     "id": "G71YzpdF01mj99wjzDk0"
 *                 }
 *             ],
 *             "title": "Svshbsys",
 *             "container-title": "Svshsbs",
 *             "issued": {
 *                 "date-parts": [
 *                     [
 *                         2024,
 *                         7,
 *                         29
 *                     ]
 *                 ],
 *                 "raw": "2024-7-29"
 *             },
 *             "URL": "Vshsbs",
 *             "accessed": {
 *                 "date-parts": [
 *                     [
 *                         2024,
 *                         7,
 *                         29
 *                     ]
 *                 ],
 *                 "raw": "2024-7-29"
 *             }
 *         },
 *         "isChecked": true
 *     }
 * ];
 * exportToJson(citations);
 *
 * @see Citation
 */
export function exportToCslJson(citations: Citation[], options: ExportOptions): void {
    const cleanedCitations = citations.map((citation) => citation.content);
    const jsonContent = JSON.stringify(cleanedCitations, null, 2);
    downloadFile(jsonContent, `${getDefaultName(options.fileName)}.json`, "application/json");
}

/**
 * Exports a list of citations to a JSON file formatted for BibJSON.
 *
 * @param {Citation[]} citations - An array of citation objects to be formatted and exported.
 * Each citation object should conform to the {@link Citation} interface.
 * @param {ExportOptions} options - The options for exporting the file, including the file name.
 * @returns {void} Does not return anything; instead, triggers a file download of the transformed citations in JSON format.
 *
 * @example
 * // Example usage
 * const citations = [
 *     {
 *         "id": "9pvrqrczWNcet5vZhoRs",
 *         "content": {
 *             "id": "9pvrqrczWNcet5vZhoRs",
 *             "type": "webpage",
 *             "author": [
 *                 {
 *                     "given": "Vshssv",
 *                     "family": "Svsjsbs",
 *                     "id": "G71YzpdF01mj99wjzDk0"
 *                 }
 *             ],
 *             "title": "Svshbsys",
 *             "container-title": "Svshsbs",
 *             "issued": {
 *                 "date-parts": [
 *                     [
 *                         2024,
 *                         7,
 *                         29
 *                     ]
 *                 ],
 *                 "raw": "2024-7-29"
 *             },
 *             "URL": "Vshsbs",
 *             "accessed": {
 *                 "date-parts": [
 *                     [
 *                         2024,
 *                         7,
 *                         29
 *                     ]
 *                 ],
 *                 "raw": "2024-7-29"
 *             }
 *         },
 *         "isChecked": true
 *     }
 * ];
 * exportToBibJson(citations);
 *
 * @see Citation
 */
export function exportToBibJson(citations: Citation[], options: ExportOptions): void {
    const cleanedCitations = citations.map((citation) => cslToBibJSON(citation.content));
    const jsonContent = JSON.stringify(cleanedCitations, null, 2);
    downloadFile(jsonContent, `${getDefaultName(options.fileName)}.json`, "application/json");
}

/**
 * Exports a list of citations to a JSON file formatted for BibJSON.
 *
 * @param {Citation[]} citations - An array of citation objects to be formatted and exported.
 * Each citation object should conform to the {@link Citation} interface.
 * @param {LatexFormats} format - The format for the LaTeX file. Can be "bibtex", "biblatex" or "bibtxt".
 * @param {ExportOptions} options - The options for exporting the file, including the file name.
 * @returns {Promise<void>} - A promise that resolves when the export is complete.
 *
 * @throws {Error} - If the LaTeX formatting fails, an error is logged to the console.
 *
 * @example
 * // Example usage
 * const citations = [
 *     {
 *         "id": "9pvrqrczWNcet5vZhoRs",
 *         "content": {
 *             "id": "9pvrqrczWNcet5vZhoRs",
 *             "type": "webpage",
 *             "author": [
 *                 {
 *                     "given": "Vshssv",
 *                     "family": "Svsjsbs",
 *                     "id": "G71YzpdF01mj99wjzDk0"
 *                 }
 *             ],
 *             "title": "Svshbsys",
 *             "container-title": "Svshsbs",
 *             "issued": {
 *                 "date-parts": [
 *                     [
 *                         2024,
 *                         7,
 *                         29
 *                     ]
 *                 ],
 *                 "raw": "2024-7-29"
 *             },
 *             "URL": "Vshsbs",
 *             "accessed": {
 *                 "date-parts": [
 *                     [
 *                         2024,
 *                         7,
 *                         29
 *                     ]
 *                 ],
 *                 "raw": "2024-7-29"
 *             }
 *         },
 *         "isChecked": true
 *     }
 * ];
 * exportToLatex(citations, "bibtex");
 *
 * @see Citation
 */
export async function exportToLatex(
    citations: Citation[],
    format: LatexFormats,
    options: ExportOptions
): Promise<void> {
    try {
        const cleanedCitations = citations.map((citation) => citation.content);
        const latex = await citationEngine.formatLaTeX(cleanedCitations, format);
        const content = typeof latex === "string" ? latex : JSON.stringify(latex, null, 2);
        const mimeType = format === "bibtxt" ? "text/plain" : "text/x-bibtex";
        downloadFile(content, `${getDefaultName(options.fileName)}.${format === "bibtxt" ? "txt" : "bib"}`, mimeType);
    } catch (error) {
        console.error("Failed to export citations: ", error);
    }
}
