import { DateObject, Author, CslJson, CitationStyle } from "../types/types.ts";
import { uid } from "./utils.ts";

const CORS_PROXY: string = "https://corsproxy.io/?";

/**
 * Creates a `DateObject` containing `date-parts`. If a full date (year, month, day) is provided, it also
 * includes `raw`, `date_time`, and `timestamp` properties.
 *
 * @param {Date | number} yearOrDate - A `Date` object or a year as a number.
 * @param {number | string} [month] - The month (1-12), optional if `yearOrDate` is a `number`.
 * @param {number} [day] - The day of the month, optional if `yearOrDate` is a `number`.
 * @returns {DateObject | undefined} An object containing `date-parts` or `undefined`. If a full date (year, month, day) is provided,
 * it also includes `raw`, `date_time`, and `timestamp` properties.
 */
export function createDateObject(
    yearOrDate: Date | number,
    month?: number | string | undefined,
    day?: number | undefined
): DateObject {
    let year: number;
    let adjustedMonth: number | string | undefined;
    let adjustedDay: number | undefined;

    if (yearOrDate instanceof Date) {
        year = yearOrDate.getFullYear();
        adjustedMonth = yearOrDate.getMonth() + 1;
        adjustedDay = yearOrDate.getDate();
    } else {
        year = yearOrDate;
        adjustedMonth = month ?? undefined;
        adjustedDay = day ?? undefined;
    }

    const dateParts: [number, (number | string)?, number?] = [year];

    if (adjustedMonth) {
        dateParts.push(adjustedMonth);

        if (typeof adjustedMonth === "number" && adjustedDay) {
            dateParts.push(adjustedDay);
        }
    }

    const dateObject: Record<string, unknown> = {
        "date-parts": [dateParts],
    };

    // Only add "raw", "date_time", and "timestamp" if year, month, and day are all defined, and month is not a string (as season)
    if (adjustedMonth && typeof adjustedMonth === "number" && adjustedDay) {
        const newDate = new Date(year, (adjustedMonth as number) - 1, adjustedDay);
        [dateObject.raw] = newDate.toISOString().split("T");
        dateObject.date_time = newDate.toISOString();
        dateObject.timestamp = newDate.getTime();
    }

    return dateObject;
}

/**
 * `TODO`: Include these properties:
 *
 * ```js
 * author: [
 *     {
 *         given: "Vincent",
 *         "non-dropping-particle": "van", 👈
 *         family: "Gogh",
 *     },
 *     {
 *         given: "Alexander",
 *         "dropping-particle": "von", 👈
 *         family: "Humboldt",
 *     },
 *     {
 *             literal: "International Business Machines",
 *     },
 *     {
 *             family: "King",
 *             given: "Martin Luther",
 *             suffix:"Jr., Ph.D.", 👈
 *             dropping-particle:"Rev.",
 *     },
 * ];
 * ```
 */
export function createAuthorsArray(authors: string[] | Record<string, string | undefined>): Author[] {
    const result: Author[] = [];

    if (Array.isArray(authors)) {
        // Handle authors as an array of strings
        authors.forEach((author) => {
            const names = author.split(/\s+/);
            const given = names.shift() || "";
            const family = names.join(" ");
            result.push({ given, family });
        });
    } else {
        // Handle authors as an object with more detailed fields
        let index = 0;
        while (`given-${index}` in authors && `family-${index}` in authors) {
            const authorObj: Author = {
                given: authors[`given-${index}`] || "",
                family: authors[`family-${index}`] || "",
                "dropping-particle": authors[`dropping-particle-${index}`] || "",
                "non-dropping-particle": authors[`non-dropping-particle-${index}`] || "",
                suffix: authors[`suffix-${index}`] || "",
                literal: authors[`literal-${index}`] || "",
            };

            Object.keys(authorObj).forEach((key) => {
                if (authorObj[key] === "" || authorObj[key] === undefined) {
                    delete authorObj[key];
                }
            });

            result.push(authorObj);
            index += 1;
        }
    }

    return result;
}

type IdentifierType = "URL" | "DOI" | "PMCID" | "PMID" | "ISBN" | "undefined";

/**
 * Recognizes the type of identifier from a given string.
 * The function can identify URLs, DOIs, PMCIDs, PMIDs, and ISBNs.
 * If the identifier string is preceded by an explicit type prefix (e.g., "URL:", "doi:", "pmid:"),
 * the function will return an array containing the type and the cleaned string with the prefix removed.
 * If no explicit prefix is found, the function will perform pattern matching based on known formats.
 *
 * @param {string} string - The input string to be checked for identifier type.
 * @returns {[IdentifierType, string]} - Returns an array where the first element is the
 * identifier type ("url", "doi", "pmcid", "pmid", "isbn"), and the second element is the cleaned identifier
 * string (with any prefix removed). Returns "undefined" as the first element if no valid identifier type is detected.
 */
export function recognizeIdentifierType(string: string): [IdentifierType, string] {
    const trimmedString = string.trim().toLowerCase();

    // Check for explicit identifier type prefixes and clean the string
    if (trimmedString.startsWith("url:")) {
        return ["URL", string.slice(4).trim()];
    }
    if (trimmedString.startsWith("doi:")) {
        return ["DOI", string.slice(4).trim()];
    }
    if (trimmedString.startsWith("pmcid:")) {
        return ["PMCID", string.slice(6).trim()];
    }
    if (trimmedString.startsWith("pmid:")) {
        return ["PMID", string.slice(5).trim()];
    }
    if (trimmedString.startsWith("isbn:")) {
        return ["ISBN", string.slice(5).trim()];
    }

    const urlPattern = /^(https?:\/\/)[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;
    const doiPattern = /^((https?:\/\/)?(?:dx\.)?doi\.org\/)?10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/;
    const pmcidPattern = /^PMC\d+$/;
    const pmidPattern = /^\d{7,10}$/;
    const isbnPattern = /^(97[89])\d{9}(\d|X)$/;

    // Perform regex-based identification if no explicit prefix is found
    if (doiPattern.test(string)) return ["DOI", string.trim()]; // Check for DOI patterns first because a DOI may also be a URL, but with a more specific format

    if (urlPattern.test(string)) return ["URL", string.trim()];

    if (pmcidPattern.test(string)) return ["PMCID", string.trim()];

    if (pmidPattern.test(string)) return ["PMID", string.trim()];

    if (isbnPattern.test(string.replace(/-/g, ""))) return ["ISBN", string.trim()];

    return ["undefined", string.trim()];
}

/**
 * Retrieves content from a given URL and extracts metadata for a web page.
 *
 * @param {string} url - The URL of the web page to retrieve.
 * @returns {Promise<CslJson | null>} A promise that resolves to a `CslJson` object containing the extracted metadata, or `null` if an error occurs.
 */
/* eslint-disable quotes */
export async function retrieveContentFromURL(url: string): Promise<CslJson | null> {
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
            "container-title": [extractContent(doc, 'meta[property="og:site_name"]', "content")],
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
/* eslint-enable quotes */

/**
 * Retrieves content from the CrossRef API using a DOI and returns metadata about the publication.
 *
 * @param {string} doi - The DOI of the publication to retrieve.
 * @returns {Promise<CslJson | null>} A promise that resolves to a `CslJson` object containing the publication metadata, or `null` if an error occurs.
 */
export async function retrieveContentFromDOI(doi: string): Promise<CslJson | null> {
    if (!doi) return null;

    try {
        const response = await fetch(`${CORS_PROXY}https://api.crossref.org/works/${doi}`);

        const data: { message: Record<string, never> } = await response.json();
        const { message } = data;

        return {
            DOI: message.DOI,
            URL: message.URL || message.DOI ? `https://doi.org/${message.DOI}` : undefined,
            ISSN: message.ISSN,
            PMID: message.PMID,
            PMCID: message.PMCI,
            "container-title": message["container-title"],
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
            author: (message.author as Author[]).map((author) => ({
                ...author,
                id: uid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${doi}: ${error}`);
        return null;
    }
}

/**
 * Retrieves content from the Open Library API using an ISBN and returns metadata about the book.
 *
 * @param {string} isbn - The ISBN of the book to retrieve.
 * @returns {Promise<CslJson | null>} A promise that resolves to a `CslJson` object containing the book metadata, or `null` if an error occurs.
 */
export async function retrieveContentFromISBN(isbn: string): Promise<CslJson | null> {
    if (!isbn) return null;

    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=isbn:${isbn}&mode=everything&fields=*,editions`
        );

        const data: { docs: object } = await response.json();
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

/**
 * Retrieves content from the NCBI PMC API using a PMCID and returns metadata about the publication.
 *
 * @param {string} pmcid - The PMCID of the publication to retrieve.
 * @returns {Promise<CslJson | null>} A promise that resolves to a `CslJson` object containing the publication metadata, or `null` if an error occurs.
 */
export async function retrieveContentFromPMCID(pmcid: string): Promise<CslJson | null> {
    if (!pmcid) return null;

    const pmcIdWithoutPrefix = pmcid.replace(/^PMC/, "");

    try {
        const response = await fetch(
            `${CORS_PROXY}https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/?format=csl&id=${pmcIdWithoutPrefix}`
        );

        const data: Record<string, never> = await response.json();

        return {
            DOI: data?.DOI,
            URL: data?.URL || data?.DOI ? `https://doi.org/${data.DOI}` : undefined,
            ISSN: data?.ISSN,
            PMID: data?.PMID,
            PMCID: data?.PMCID,
            "container-title": [data?.["container-title"]],
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
            author: (data?.author as Author[]).map((author) => ({
                ...author,
                id: uid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${pmcid}: ${error}`);
        return null;
    }
}

/**
 * Retrieves content from the NCBI PubMed API using a PMID and returns metadata about the publication.
 *
 * @param {string} pmid - The PMID of the publication to retrieve.
 * @returns {Promise<CslJson | null>} A promise that resolves to a `CslJson` object containing the publication metadata, or `null` if an error occurs.
 */
export async function retrieveContentFromPMID(pmid: string): Promise<CslJson | null> {
    if (!pmid) return null;

    try {
        const response = await fetch(
            `${CORS_PROXY}https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=csl&id=${pmid}`
        );

        const data: Record<string, never> = await response.json();

        return {
            DOI: data?.DOI,
            URL: data?.URL || data?.DOI ? `https://doi.org/${data.DOI}` : undefined,
            ISSN: data?.ISSN,
            PMID: data?.PMID,
            PMCID: data?.PMCID,
            "container-title": [data?.["container-title"]],
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
            author: (data?.author as Author[]).map((author) => ({
                ...author,
                id: uid(),
            })),
        };
    } catch (error) {
        console.error(`Failed to retrieve content from ${pmid}: ${error}`);
        return null;
    }
}

/**
 * Extracts content from an HTML form and returns it as a CslJson object.
 *
 * @param {HTMLFormElement} form - The HTML form element from which data is extracted.
 * @returns {CslJson} - The extracted form data as a `CslJson` object.
 */
export function getContentFromForm(form: HTMLFormElement): CslJson {
    const data = new FormData(form);
    const dataObject = Object.fromEntries(data.entries()) as Record<string, string | undefined>;
    const switches = form.querySelectorAll<HTMLInputElement>("md-switch");

    const { URL, DOI, ISSN, PMCID, PMID, ISBN, issue, page, title, volume, publisher, note } = dataObject;
    const online = Array.from(switches).find((checkbox) => checkbox.name === "online");

    const content = {
        title,
        page,
        issue,
        volume,
        URL,
        DOI,
        ISSN,
        PMCID,
        PMID,
        ISBN,
        publisher,
        note,
        online: online?.getAttribute("selected") === "true",
        issued: createDateObject(
            parseInt(dataObject["issued-year"]!, 10),
            parseInt(dataObject["issued-month"]!, 10) || dataObject["issued-month"],
            parseInt(dataObject["issued-day"]!, 10)
        ),
        accessed: createDateObject(
            parseInt(dataObject["accessed-year"]!, 10),
            parseInt(dataObject["accessed-month"]!, 10) || dataObject["accessed-month"],
            parseInt(dataObject["accessed-day"]!, 10)
        ),
        author: createAuthorsArray(dataObject),
        "container-title": [dataObject["container-title[0]"] as string],
    };

    return content;
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
