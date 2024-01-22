import axios from "axios";
import * as cheerio from "cheerio";
import { useRef } from "react";
import DateInput from "../formElements/DateInput";
import AuthorsInput from "../formElements/AuthorsInput";
import * as sourceTypeUtils from "../sourceTypeUtils";

export default function Webpage(props) {
    const { content, setContent, setCitation, toggleEditMode, showAcceptDialog } = props;
    const autoFillUrlRef = useRef(null);

    function retrieveContent(source) {
        if (source)
            axios
                .get(`https://corsproxy.io/?${source}`, { mode: "no-cors" })
                .then((response) => {
                    const $ = cheerio.load(response.data);
                    setContent({
                        title:
                            $("title").text() || $("meta[property='og:title']").attr("content") || $("h1").text() || "",
                        authors: extractAuthors($),
                        website: $("meta[property='og:site_name']").attr("content") || "",
                        publisher: $("meta[property='article:publisher']").attr("content"),
                        accessDate: sourceTypeUtils.createDateObject(new Date()),
                        publicationDate: sourceTypeUtils.createDateObject(
                            $("meta[name='date']").attr("content") ||
                                $("meta[name='article:published_time']").attr("content") ||
                                $("meta[property='article:published_time']").attr("content") ||
                                $("meta[name='article:modified_time']").attr("content") ||
                                $("meta[property='article:modified_time']").attr("content") ||
                                $("meta[name='og:updated_time']").attr("content") ||
                                $("meta[property='og:updated_time']").attr("content") ||
                                $(".publication-date").text()
                        ),
                        url: (
                            $("meta[property='og:url']").attr("content") ||
                            $("meta[name='url']").attr("content") ||
                            $("link[rel='canonical']").attr("href") ||
                            source
                        ).replace(/\/$/, ""), // Remove trailing slash
                    });
                })
                .catch((error) => {
                    if (!error.response && error.message === "Network Error") {
                        showAcceptDialog(
                            "Network Error",
                            "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again."
                        );
                    } else {
                        showAcceptDialog(
                            "Webpage Access Error",
                            "We couldn't retrieve the information from the webpage you're attempting to cite. This may be due to the webpage being protected by a login or paywall."
                        );
                    }
                    console.error(error);
                });
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

        return sourceTypeUtils.createAuthorsArray(authors);
    }

    function handleFillIn() {
        const autoFillUrl = autoFillUrlRef.current.value;
        retrieveContent(autoFillUrl);
    }

    function handleAddReference(event) {
        event.preventDefault();
        setCitation((prevCitation) => ({ ...prevCitation, referenceCompleted: true }));
        toggleEditMode();
    }

    function handleCancel() {
        toggleEditMode(true);
    }

    return (
        <form className="citation-form" onSubmit={handleAddReference}>
            <p>Insert the URL (link) here to fill the fields automatically:</p>
            <label htmlFor="auto-filler-url">URL</label>
            <input type="text" name="auto-filler-url" placeholder="Insert a URL" ref={autoFillUrlRef} />
            <button type="button" onClick={handleFillIn}>
                Fill in
            </button>

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
                required
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

            <label htmlFor="publication-date">Publication date</label>
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="publicationDate" />

            <label htmlFor="url">URL (link)</label>
            <input
                type="text"
                name="url"
                value={content.url}
                placeholder="URL (link)"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        url: event.target.value,
                    }))
                }
                required
            />

            <label htmlFor="access-date">Access date</label>
            <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessDate" />

            <button type="submit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
