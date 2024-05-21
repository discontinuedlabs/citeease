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

    // const newDate = new Date(year, adjustedMonth, adjustedDay);

    return {
        "date-parts": [dateParts],
        // "date-time": newDate.toISOString() || undefined,
        // timestamp: newDate.getTime() || undefined,
    };
}

export function createAuthorsArray(authors) {
    const result = authors.map((author) => {
        const names = author.split(/\s+/);
        const given = names.shift() || "";
        const family = names.join(" ");
        return { given, family, id: nanoid() };
    });

    return result;
}

export function retrieveContentFromWebsite($, sourceURL) {
    return {
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
            sourceURL,
    };
}

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
