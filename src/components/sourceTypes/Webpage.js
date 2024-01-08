import axios from "axios";
import * as cheerio from "cheerio";
import { useEffect } from "react";
import { v4 as uuid4 } from "uuid";

export default function Webpage(props) {
    const { content, setContent, toggleEditMode } = props;

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
                .get(`https://corsproxy.io/?${url}`)
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

                    setContent({
                        title:
                            $("title").text() ||
                            $("meta[property='og:title']").attr("content") ||
                            $("meta[name='twitter:title']").attr("content") ||
                            $("h1").text(),
                        authors: authors,
                        website: $("meta[property='og:site_name']").attr("content"),
                        publisher: $("meta[property='article:publisher']").attr("content"),
                        publishDate:
                            $("meta[name='date']").attr("content") ||
                            $("meta[name='article:published_time']").attr("content") ||
                            $("meta[property='article:published_time']").attr("content") ||
                            $("meta[name='article:modified_time']").attr("content") ||
                            $("meta[property='article:modified_time']").attr("content") ||
                            $("meta[name='og:updated_time']").attr("content") ||
                            $("meta[property='og:updated_time']").attr("content") ||
                            $(".publish-date").text(),
                        url: (
                            $("meta[property='og:url']").attr("content") ||
                            $("meta[name='url']").attr("content") ||
                            $("link[rel='canonical']").attr("href") ||
                            url
                        ).replace(/\/$/, ""), // Remove trailing slash
                    });
                })
                .catch((error) => {
                    // TODO: Add an error or toast message
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

    function updateAuthors(id, key, value) {
        setContent((prevContent) => {
            const newArray = prevContent.authors.map((author) => {
                if (author.id === id) {
                    return {
                        ...author,
                        [key]: value,
                    };
                }
                return author;
            });

            return { ...prevContent, authors: newArray };
        });
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
                <p>
                    If the author is an organization, keep the last name empty, and type the full
                    organization's name in the author's first name field.
                </p>
                {content.authors &&
                    content.authors.map((author) => (
                        <div key={author.id}>
                            <label htmlFor="first-name last-name">Author</label>
                            <input
                                type="text"
                                name="first-name"
                                placeholder="Author's first name"
                                value={author.firstName}
                                onChange={(event) => {
                                    updateAuthors(author.id, "firstName", event.target.value);
                                }}
                            />
                            <input
                                type="text"
                                name="last-name"
                                placeholder="Author's first name"
                                value={author.lastName}
                                onChange={(event) => {
                                    updateAuthors(author.id, "lastName", event.target.value);
                                }}
                            />
                        </div>
                    ))}
                <button
                    onClick={() =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            authors: [
                                ...prevContent?.authors,
                                { firstName: "", lastName: "", id: uuid4() },
                            ],
                        }))
                    }
                >
                    Add author
                </button>

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
                <input
                    type="text"
                    name="publish-date"
                    value={content.publishDate}
                    placeholder="Date published"
                    onChange={(event) =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            publishDate: event.target.value,
                        }))
                    }
                />
                <label htmlFor="title">URL (link)</label>
                <input
                    type="text"
                    name="title"
                    value={content.url}
                    placeholder="Page title"
                    onChange={(event) =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            title: event.target.value,
                        }))
                    }
                />
                <label htmlFor="access-date">Access date</label>
                <input
                    type="text"
                    name="access-date"
                    value={content.publishDate}
                    placeholder="Date accessed"
                    onChange={(event) =>
                        setContent((prevContent) => ({
                            ...prevContent,
                            retrievalDate: event.target.value,
                        }))
                    }
                />
                <button onClick={toggleEditMode}>Add reference</button>
                <button onClick={toggleEditMode}>Cancel</button>
            </form>
        </>
    );
}
