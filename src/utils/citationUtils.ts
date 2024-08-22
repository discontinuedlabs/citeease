import { DateObject, Author, Content, CitationStyle } from "../types/types.ts";
import { uid } from "./utils.tsx";

const CORS_PROXY: string = "https://corsproxy.io/?";

/* eslint-disable quotes, @typescript-eslint/no-explicit-any */

// TODO: Needs review
export function createDateObject(yearOrDate: Date | number, month?: number, day?: number): DateObject | undefined {
    if (yearOrDate === undefined) return undefined;
    let year: number;
    let adjustedMonth: number;
    let adjustedDay: number;

    if (yearOrDate instanceof Date) {
        year = yearOrDate.getFullYear();
        adjustedMonth = yearOrDate.getMonth() + 1;
        adjustedDay = yearOrDate.getDate();
    } else {
        year = yearOrDate;
        adjustedMonth = month ?? 1;
        adjustedDay = day ?? 1;
    }

    const dateParts: number[] = [year];
    if (adjustedMonth !== undefined) {
        dateParts.push(adjustedMonth);
        if (adjustedDay !== undefined) {
            dateParts.push(adjustedDay);
        }
    }

    const newDate = new Date(year, adjustedMonth, adjustedDay);

    return {
        "date-parts": [dateParts],
        raw: `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`,
        // date_time: newDate.toISOString(),
        // timestamp: newDate.getTime(),
    };
}

export function createAuthorsArray(authors: string[]): Author[] {
    if (!authors) return [];
    const result: Author[] = authors.map((author) => {
        const names = author.split(/\s+/);
        const given = names.shift() || "";
        const family = names.join(" ");
        return { given, family, id: uid() };
    });

    return result;
}

export function recognizeIdentifierType(string: string): string | undefined {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const doiPatterns = [
        /^\s*(https?:\/\/(?:dx\.)?doi\.org\/(10.\d{4,9}\/[-._;()/:A-Z0-9[\]<>]+))\s*$/i,
        /^\s*((?:dx\.)?doi\.org\/(10.\d{4,9}\/[-._;()/:A-Z0-9[\]<>]+))\s*$/i,
        /^\s*(10.\d{4,9}\/[-._;()/:A-Z0-9[\]<>]+)\s*$/i,
        /^10.\d{4,9}\/[-._;()/:A-Z0-9[\]<>]+$/i,
        /\b10\.\d{4,9}[-.\w]+\b/i,
    ];
    const pmcidPattern = /^PMC\d+$/i;
    const pmidPatern = /^pmid:\s*\d+$/i;
    const isbnPatterns = [
        /^(97[89])(?:-\d+){0,2}|\d{10}\s?|\d{13}\s?$|((97[89])?\d{9}\s?)(\d{5})$/,
        /^10\.(978|979)\.\d{2,8}\/\d{2,7}$/,
        /^(978|979)\d{10}$/,
        /^\d{10}$/,
    ];

    if (urlPattern.test(string)) return "url";

    if (doiPatterns.some((doiPattern) => doiPattern.test(string.replace(/doi:\s*/gi, "")))) {
        return "doi";
    }

    if (pmcidPattern.test(string.replace(/pmcid:\s*/g, ""))) return "pmcid";

    if (pmidPatern.test(string.replace(/\s+/g, ""))) return "pmid";

    if (isbnPatterns.some((isbnPattern) => isbnPattern.test(string.replace(/-|\s+/g, "")))) {
        return "isbn";
    }

    return undefined;
}

export async function retrieveContentFromURL(url: string): Promise<Content | null> {
    function extractAuthors(doc: Document): Author[] {
        let authors: string[] = [];

        const authorElement = doc.querySelector('.author[rel="author"]');
        if (authorElement) authors.push(authorElement.textContent || "");

        doc.querySelectorAll('meta[name="author"], meta[name="article:author"]').forEach((meta) => {
            authors.push(meta.getAttribute("content") || "");
        });

        doc.querySelectorAll('span.css-1baulvz.last-byline[itemprop="name"]').forEach((span) => {
            authors.push(span.textContent?.trim() || "");
        });

        authors = authors.filter((author, index, self) => author.trim() !== "" && self.indexOf(author) === index);

        return createAuthorsArray(authors);
    }

    function extractContent(doc: Document, selector: string, attr: string): string {
        const element = doc.querySelector(selector);

        if (!element) {
            return "";
        }

        if (attr) {
            return element.hasAttribute(attr) ? element.getAttribute(attr) || "" : element.textContent || "";
        }
        return element.textContent || "";
    }

    if (!url) return null;

    try {
        const response = await fetch(`${CORS_PROXY}${url}`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        return {
            type: "webpage",
            title: extractContent(doc, "title", ""),
            author: extractAuthors(doc),
            "container-title": extractContent(doc, 'meta[property="og:site_name"]', "content"),
            publisher: extractContent(doc, 'meta[property="article:publisher"]', "content"),
            accessed: createDateObject(new Date()),
            issued: createDateObject(
                new Date(
                    extractContent(doc, 'meta[name="date"]', "content") ||
                        extractContent(doc, 'meta[name="article:published_time"]', "content") ||
                        extractContent(doc, 'meta[property="article:published_time"]', "content") ||
                        extractContent(doc, 'meta[name="article:modified_time"]', "content") ||
                        extractContent(doc, 'meta[property="article:modified_time"]', "content") ||
                        extractContent(doc, 'meta[name="og:updated_time"]', "content") ||
                        extractContent(doc, 'meta[property="og:updated_time"]', "content") ||
                        extractContent(doc, ".publication-date", "")
                )
            ),
            URL:
                extractContent(doc, 'meta[property="og:url"]', "content") ||
                extractContent(doc, 'meta[name="url"]', "content") ||
                extractContent(doc, 'link[rel="canonical"]', "href") ||
                url,
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${url}:`, error);
        return null;
    }
}

export async function retrieveContentFromDOI(doi: string): Promise<Content | null> {
    if (!doi) return null;

    try {
        const cleanedDoi = doi.replace(/doi:\s*/gi, "");
        const response = await fetch(`${CORS_PROXY}https://api.crossref.org/works/${cleanedDoi}`);

        const data: { message: any } = await response.json();
        const { message } = data;

        return {
            DOI: message.DOI,
            URL: message.URL || message.DOI ? `https://doi.org/${message.DOI}` : undefined,
            ISSN: message.ISSN,
            PMID: message.PMID,
            PMCID: message.PMCI,
            "container-title": message["container-title"][0],
            issue: message.issue,
            issued: message.issued,
            page: message.page,
            "publisher-place": message["publisher-place"],
            source: message.source,
            title: message.title,
            volume: message.volume,
            online: true,
            type: message.type === "journal-article" ? "article-journal" : message.type,
            accessed: createDateObject(new Date()),
            author: message.author.map((author: Author[]) => ({
                ...author,
                id: uid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${doi}: ${error}`);
        return null;
    }
}

export async function retrieveContentFromISBN(isbn: string): Promise<Content | null> {
    if (!isbn) return null;

    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=isbn:${isbn}&mode=everything&fields=*,editions`
        );

        const data: { docs: any } = await response.json();
        const docs = data?.docs[0];
        const edition = docs?.editions?.docs[0];

        return {
            type: "book",
            title: docs?.title,
            "number-of-pages": docs?.number_of_pages_median,
            author: createAuthorsArray(docs?.author_name),
            publisher: edition?.publisher?.[0],
            "publisher-place": edition?.publish_place?.[0],
            ISBN: edition?.isbn?.[0] || isbn,
            issued: createDateObject(new Date(edition?.publish_date?.[0])),
            accessed: createDateObject(new Date()),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${isbn}: ${error}`);
        return null;
    }
}

export async function retrieveContentFromPMCID(pmcid: string): Promise<Content | null> {
    if (!pmcid) return null;

    try {
        const cleanedPmcid = pmcid.replace(/pmcid:\s*|PMC|\s*/gi, "");
        const response = await fetch(
            `${CORS_PROXY}https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/?format=csl&id=${cleanedPmcid}`
        );

        const data: any = await response.json();

        return {
            DOI: data?.DOI,
            URL: data?.URL || data?.DOI ? `https://doi.org/${data.DOI}` : undefined,
            ISSN: data?.ISSN,
            PMID: data?.PMID,
            PMCID: data?.PMCID,
            "container-title": data?.["container-title"],
            issue: data?.issue,
            issued: data?.issued,
            page: data?.page,
            "publisher-place": data?.["publisher-place"],
            source: data?.source,
            title: data?.title,
            type: data?.type,
            volume: data?.volume,
            online: true,
            accessed: createDateObject(new Date()),
            author: data?.author?.map((author: Author[]) => ({
                ...author,
                id: uid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${pmcid}: ${error}`);
        return null;
    }
}

export async function retrieveContentFromPMID(pmid: string): Promise<Content | null> {
    if (!pmid) return null;

    try {
        const cleanedPmid = pmid.replace(/pmid:\s*|\s*/gi, "");
        const response = await fetch(
            `${CORS_PROXY}https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=csl&id=${cleanedPmid}`
        );

        const data: any = await response.json();

        return {
            DOI: data?.DOI,
            URL: data?.URL || data?.DOI ? `https://doi.org/${data.DOI}` : undefined,
            ISSN: data?.ISSN,
            PMID: data?.PMID,
            PMCID: data?.PMCID,
            "container-title": data?.["container-title"],
            issue: data?.issue,
            issued: data?.issued,
            page: data?.page,
            "publisher-place": data?.["publisher-place"],
            source: data?.source,
            title: data?.title,
            type: data?.type,
            volume: data?.volume,
            online: true,
            accessed: createDateObject(new Date()),
            author: data?.author?.map((author: Author[]) => ({
                ...author,
                id: uid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${pmid}: ${error}`);
        return null;
    }
}

// TODO: ...
export function prioritizeAvailableStyles(): CitationStyle {
    const style = {
        name: {
            long: "American Psychological Association 7th edition",
            short: "APA",
        },
        code: "apa",
        license: {
            text: "This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License",
            url: "http://creativecommons.org/licenses/by-sa/3.0/",
        },
    };
    return style;
}
