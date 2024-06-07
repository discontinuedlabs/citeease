import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { nanoid } from "nanoid";
import { DateObject, Author, Content } from "../types/types";

const CORS_PROXY: string = "https://corsproxy.io/?";

export function createDateObject(yearOrDate: Date | number, month?: number, day?: number): DateObject | undefined {
    if (yearOrDate === undefined) return undefined;
    let year: number, adjustedMonth: number, adjustedDay: number;

    if (yearOrDate instanceof Date) {
        year = yearOrDate.getFullYear();
        adjustedMonth = yearOrDate.getMonth() + 1;
        adjustedDay = yearOrDate.getDate();
    } else {
        year = yearOrDate;
        adjustedMonth = month ?? 1;
        adjustedDay = day ?? 1;
    }

    let dateParts: number[] = [year];
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
        return { given, family, id: nanoid() };
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

    for (let doiPattern of doiPatterns) {
        if (doiPattern.test(string.replace(/doi:\s*/gi, ""))) return "doi";
    }

    if (pmcidPattern.test(string.replace(/pmcid:\s*/g, ""))) return "pmcid";

    if (pmidPatern.test(string.replace(/\s+/g, ""))) return "pmid";

    for (let isbnPattern of isbnPatterns) {
        if (isbnPattern.test(string.replace(/-|\s+/g, ""))) return "isbn";
    }
}

export async function retrieveContentFromURL(url: string): Promise<Content | null> {
    function extractAuthors($: any): Author[] {
        let authors: string[] = [];

        authors.push($('.author[rel="author"]').text());
        $('meta[name="author"], meta[name="article:author"]').each((index: number, element: any) => {
            authors.push($(element).attr("content") || "");
        });

        $('span.css-1baulvz.last-byline[itemprop="name"]').each((index: number, element: any) => {
            authors.push($(element).text().trim());
        });

        authors = authors.filter((author, index, self) => {
            return author.trim() !== "" && self.indexOf(author) === index;
        });

        return createAuthorsArray(authors);
    }

    if (!url) return null;

    try {
        const response: AxiosResponse = await axios.get(`${CORS_PROXY}${url}`);
        const $ = cheerio.load(response.data);

        return {
            type: "webpage",
            title: $("title").text(),
            author: extractAuthors($),
            "container-title": $('meta[property="og:site_name"]').attr("content") || "",
            publisher: $('meta[property="article:publisher"]').attr("content"),
            accessed: createDateObject(new Date()),
            issued: createDateObject(
                new Date(
                    $('meta[name="date"]').attr("content") ||
                        $('meta[name="article:published_time"]').attr("content") ||
                        $('meta[property="article:published_time"]').attr("content") ||
                        $('meta[name="article:modified_time"]').attr("content") ||
                        $('meta[property="article:modified_time"]').attr("content") ||
                        $('meta[name="og:updated_time"]').attr("content") ||
                        $('meta[name="og:updated_time"]').attr("content") ||
                        $(".publication-date").text()
                )
            ),
            URL:
                $('meta[property="og:url"]').attr("content") ||
                $('meta[name="url"]').attr("content") ||
                $('link[rel="canonical"]').attr("href") ||
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
        const message = data.message;

        return {
            DOI: message.DOI,
            URL: message.URL || message.DOI ? "https://doi.org/" + message.DOI : undefined,
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
                id: nanoid(),
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
            URL: data?.URL || data?.DOI ? "https://doi.org/" + data.DOI : undefined,
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
                id: nanoid(),
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
            URL: data?.URL || data?.DOI ? "https://doi.org/" + data.DOI : undefined,
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
                id: nanoid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${pmid}: ${error}`);
        return null;
    }
}
