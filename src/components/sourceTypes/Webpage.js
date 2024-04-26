import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as cheerio from "cheerio";
import * as sourceTypeUtils from "../sourceTypeUtils";
import DateInput from "../formElements/DateInput";
import AuthorsInput from "../formElements/AuthorsInput";

export default function Webpage(props) {
    const { content, setContent, showAcceptDialog, handleAddReference, handleCancel } = props;
    const [url, setUrl] = useState("");
    const autoFillUrlRef = useRef(null);

    useEffect(() => {
        setContent((prevContent) => {
            return { ...prevContent, type: "webpage" };
        });
    }, []);

    function retrieveContent(source) {
        if (source) {
            const website = encodeURIComponent(source);
            axios
                .get(`https://corsproxy.io/?${website}`)
                .then((response) => {
                    const $ = cheerio.load(response.data);
                    updateContentFromFetchedData($, source);
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
    }

    function updateContentFromFetchedData($, sourceURL) {
        setContent((prevContent) => {
            return {
                ...prevContent,
                title: $("title").text(), // TODO: Give option to prioritize h1 tag instead of title tag $("h1").text()
                author: extractAuthors($),
                "container-title": [$("meta[property='og:site_name']").attr("content") || ""], // TODO: Should use the website link as a fallback
                publisher: $("meta[property='article:publisher']").attr("content"),
                accessed: sourceTypeUtils.createDateObject(new Date()),
                issued: sourceTypeUtils.createDateObject(
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
        retrieveContent(autoFillUrlRef.current.value);
    }

    function updateContentField(key, value) {
        setContent((prevContent) => ({
            ...prevContent,
            [key]: value,
        }));
    }

    function handleUrlChange(event) {
        setUrl(event.target.value);
    }

    return (
        <form className="citation-form" onSubmit={(event) => handleAddReference(event, content)}>
            <p>Insert the URL (link) here to fill the fields automatically:</p>
            <label htmlFor="auto-filler-url">URL</label>
            <input
                type="text"
                name="auto-filler-url"
                placeholder="Insert a URL"
                ref={autoFillUrlRef}
                value={url}
                onChange={handleUrlChange}
            />
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
                onChange={(event) => updateContentField("title", event.target.value)}
                required
            />

            <label htmlFor="website">Website</label>
            <input
                type="text"
                name="website"
                value={content["container-title"]?.[0] ?? ""}
                placeholder="Website title"
                onChange={(event) => updateContentField("container-title", [event.target.value])}
            />

            <label htmlFor="publication-date">Publication date</label>
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="issued" />

            <label htmlFor="url">URL (link)</label>
            <input
                type="text"
                name="url"
                value={content.URL}
                placeholder="URL (link)"
                onChange={(event) => updateContentField("URL", event.target.value)}
                required
            />

            <label htmlFor="access-date">Access date</label>
            <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessed" />

            <button type="submit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
