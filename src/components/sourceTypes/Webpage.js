import axios from "axios";
import * as cheerio from "cheerio";
import { useEffect } from "react";
import { v4 as uuid4 } from "uuid";

export default function Webpage(props) {
    const { content, setContent } = props;

    function handleCitationFormSubmit(event) {
        event.preventDefault();
        const url = event.target[0].value;
        parseHtml(url);
    }

    useEffect(() => {
        if (!content.authors)
            setContent((prevContent) => ({
                ...prevContent,
                authors: [{ firstName: "", lastName: "", id: uuid4() }],
            }));
    }, []);

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

                    authors = authors.filter((author, index, self) => {
                        return author.trim() !== "" && self.indexOf(author) === index;
                    });

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
                            $("link[rel='canonical']").attr("href") ||
                            $("meta[property='og:url']").attr("content") ||
                            url
                        ).replace(/\/$/, ""), // Remove trailing slash
                    });
                })
                .catch((error) => console.error(error));
    }

    function updateAuthors(id, key, value) {
        setContent((prevContent) => {
            let newArray;
            const index = prevContent.authors.findIndex((a) => a.id === id);

            if (index !== -1) {
                const newAuthor = {
                    ...prevContent.authors[index],
                    [key]: value,
                };
                newArray = [
                    ...prevContent.authors.slice(0, index),
                    newAuthor,
                    ...prevContent.authors.slice(index + 1),
                ];
            } else newArray = prevContent.authors;

            return { ...prevContent, authors: newArray };
        });
    }

    return (
        <>
            <form className="citation-form" onSubmit={handleCitationFormSubmit}>
                <p>Insert the URL (link) here to fill the fields automatically:</p>
                <label htmlFor="url">URL</label>
                <input type="text" name="url" placeholder="Insert a URL" />
                <button>Fill in</button>

                <p>Or enter webpage details manually:</p>
                {content.authors &&
                    content.authors.map((author) => (
                        <div key={author.id}>
                            <label htmlFor="first-name last-name">Author</label>
                            <input
                                type="text"
                                name="first-name"
                                placeholder="Page title"
                                value={author.firstName}
                                onChange={(event) => {
                                    updateAuthors(author.id, "firstName", event.target.value);
                                }}
                            />
                            <input
                                type="text"
                                name="last-name"
                                placeholder="Page title"
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
                <input type="text" name="title" placeholder="Page title" />
                <label htmlFor="website">Website</label>
                <input type="text" name="website" placeholder="Website title" />

                <label htmlFor="title">URL (link)</label>
                <input type="text" name="title" placeholder="Page title" />
                <button type="submit">Add reference</button>
            </form>
        </>
    );
}
