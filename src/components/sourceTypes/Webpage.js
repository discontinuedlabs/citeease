import axios from "axios";
import * as cheerio from "cheerio";
import { useEffect } from "react";
import { v4 as uuid4 } from "uuid";
import DateInput from "../DateInput";
import AuthorsInput from "../AuthorsInput";

export default function Webpage(props) {
    const { content, setContent, toggleEditMode, showToast } = props;

    useEffect(() => {
        if (!content.authors)
            setContent((prevContent) => ({
                ...prevContent,
                authors: [{ firstName: "", lastName: "", id: uuid4() }],
            }));
    }, [content]);

    function parseHtml(url) {
        if (url)
            axios
                .get(`https://corsproxy.io/?${url}`, { mode: "no-cors" })
                .then((response) => {
                    const $ = cheerio.load(response.data);

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

                    authors = makeAuthorsArray(authors);

                    console.log($("title").text());

                    setContent({
                        title:
                            $("title").text() ||
                            $("meta[property='og:title']").attr("content") ||
                            $("h1").text() ||
                            "",
                        authors: authors,
                        website: $("meta[property='og:site_name']").attr("content") || "",
                        publisher: $("meta[property='article:publisher']").attr("content"),
                        accessDate: new Date(),
                        publishDate: new Date(
                            $("meta[name='date']").attr("content") ||
                                $("meta[name='article:published_time']").attr("content") ||
                                $("meta[property='article:published_time']").attr("content") ||
                                $("meta[name='article:modified_time']").attr("content") ||
                                $("meta[property='article:modified_time']").attr("content") ||
                                $("meta[name='og:updated_time']").attr("content") ||
                                $("meta[property='og:updated_time']").attr("content") ||
                                $(".publish-date").text() ||
                                ""
                        ),
                        url: (
                            $("meta[property='og:url']").attr("content") ||
                            $("meta[name='url']").attr("content") ||
                            $("link[rel='canonical']").attr("href") ||
                            url
                        ).replace(/\/$/, ""), // Remove trailing slash
                    });
                })
                .catch((error) => {
                    showToast(
                        "Webpage Access Error",
                        "We couldn't retrieve the information from the webpage you're attempting to cite. This may be due to the webpage being protected by a login or paywall."
                    );
                    console.error(error);
                });
    }

    function makeAuthorsArray(authors) {
        const result = authors.map((author) => {
            const names = author.split(/\s+/);
            const firstName = names.shift() || "";
            const lastName = names.join(" ");
            return { firstName, lastName, id: uuid4() };
        });

        return result;
    }

    function handleFillIn(event) {
        event.preventDefault();
        const url = event.target[0]?.value;
        parseHtml(url);
    }

    return (
        <>
            <form className="citation-form" onSubmit={handleFillIn}>
                <p>Insert the URL (link) here to fill the fields automatically:</p>
                <label htmlFor="url">URL</label>
                <input type="text" name="url" placeholder="Insert a URL" />
                <button type="submit">Fill in</button>

                <p>Or enter webpage details manually:</p>
                <AuthorsInput content={content} setContent={setContent} />

                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    name="title"
                    value={content.title}
                    placeholder="Page title"
                    onChange={(event) =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            title: event.target.value,
                        }))
                    }
                />

                <label htmlFor="website">Website</label>
                <input
                    type="text"
                    name="website"
                    value={content.website}
                    placeholder="Website title"
                    onChange={(event) =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            website: event.target.value,
                        }))
                    }
                />

                <label htmlFor="publish-date">Publication date</label>
                <DateInput
                    name="publish-date"
                    content={content}
                    setContent={setContent}
                    dateKey="publishDate"
                />

                <label htmlFor="title">URL (link)</label>
                <input
                    type="text"
                    name="title"
                    value={content.url}
                    placeholder="URL (link)"
                    onChange={(event) =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            url: event.target.value,
                        }))
                    }
                />

                <label htmlFor="access-date">Access date</label>
                <DateInput
                    name="access-date"
                    content={content}
                    setContent={setContent}
                    dateKey="accessDate"
                />

                <button type="button" onClick={toggleEditMode}>
                    Add reference
                </button>
                <button type="button" onClick={toggleEditMode}>
                    Cancel
                </button>
            </form>
        </>
    );
}
