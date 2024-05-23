import axios from "axios";
import * as cheerio from "cheerio";
import { nanoid } from "nanoid";

export function createDateObject(yearOrDate, month = undefined, day = undefined) {
    if (yearOrDate === undefined) return;
    let year, adjustedMonth, adjustedDay;

    if (yearOrDate instanceof Date) {
        year = yearOrDate.getFullYear();
        adjustedMonth = yearOrDate.getMonth() + 1;
        adjustedDay = yearOrDate.getDate();
    } else {
        year = yearOrDate;
        adjustedMonth = month !== undefined ? month : 1;
        adjustedDay = day !== undefined ? day : 1;
    }

    let dateParts = [year];
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
        // "date-time": newDate.toISOString() || undefined,
        // timestamp: newDate.getTime() || undefined,
    };
}

export function createAuthorsArray(authors) {
    if (!authors) return;
    const result = authors.map((author) => {
        const names = author.split(/\s+/);
        const given = names.shift() || "";
        const family = names.join(" ");
        return { given, family, id: nanoid() };
    });

    return result;
}

export async function retrieveContentFromURL(url) {
    function extractAuthors($) {
        let authors = [];

        authors.push($(".author[rel='author']").text());
        $('meta[name="author"], meta[name="article:author"]').each((index, element) => {
            authors.push($(element).attr("content"));
        });

        $('span.css-1baulvz.last-byline[itemprop="name"]').each((index, element) => {
            authors.push($(element).text().trim());
        });

        authors = authors.filter((author, index, self) => {
            return author.trim() !== "" && self.indexOf(author) === index;
        });

        return createAuthorsArray(authors);
    }

    if (url) {
        const website = encodeURIComponent(url);
        const response = await axios.get(`https://corsproxy.io/?${website}`);
        const $ = cheerio.load(response.data);

        return {
            type: "webpage",
            title: $("title").text(), // TODO: Give option to prioritize h1 tag instead of title tag $("h1").text()
            author: extractAuthors($),
            "container-title": [$("meta[property='og:site_name']").attr("content") || ""], // TODO: Should use the website link as a fallback
            publisher: $("meta[property='article:publisher']").attr("content"),
            accessed: createDateObject(new Date()),
            issued: createDateObject(
                new Date(
                    $("meta[name='date']").attr("content") ||
                        $("meta[name='article:published_time']").attr("content") ||
                        $("meta[property='article:published_time']").attr("content") ||
                        $("meta[name='article:modified_time']").attr("content") ||
                        $("meta[property='article:modified_time']").attr("content") ||
                        $("meta[name='og:updated_time']").attr("content") ||
                        $("meta[property='og:updated_time']").attr("content") ||
                        $(".publication-date").text()
                )
            ),
            URL:
                $("meta[property='og:url']").attr("content") ||
                $("meta[name='url']").attr("content") ||
                $("link[rel='canonical']").attr("href") ||
                url,
        };
    }
}

// TODO: Don't use the whole object from the API.
// These are some examples of the needed fields for citeproc https://api.zotero.org/groups/459003/items?format=csljson&limit=8&itemType=journalArticle
export async function retrieveContentFromDOI(doi) {
    if (doi) {
        const response = await fetch(`https://corsproxy.io/?https://api.crossref.org/works/${doi}`);
        const data = await response.json();
        return {
            ...data.message,
            // date.message has all the neccessary naming system to work with citeproc, only the below fields are missing for other purposes.
            online: true,
            type: "article-journal", // This API returns the type as "journal-article", but for citeproc, it should be "article-journal"
            accessed: createDateObject(new Date()),
            author: data.message.author.map((author) => ({
                ...author,
                id: nanoid(),
            })),
        };
    }
}

// FIXME: The API naming system is not compatible with citeproc
export async function retrieveContentFromISBN(isbn) {
    if (isbn) {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=isbn:${isbn}&mode=everything&fields=*,editions`
        );
        const data = await response.json();
        const docs = data.docs[0];
        const edition = docs.editions.docs[0];
        console.log(docs);
        return {
            type: "book",
            title: docs?.title,
            "number-of-pages": docs?.number_of_pages_median,
            author: createAuthorsArray(docs?.author_name),
            publisher: edition?.publisher?.[0],
            "publisher-place": edition?.publish_place?.[0],
            ISBN: edition?.isbn?.[0] || isbn,
            issued: createDateObject(edition?.publish_date?.[0]),
            accessed: createDateObject(new Date()),
        };
    }
}
