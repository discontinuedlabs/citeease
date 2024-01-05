import axios from "axios";
import cheerio from "cheerio";
import { useState } from "react";

export default function Webpage(props) {
    const { getCitation } = props;
    const [content, setContent] = useState({});

    function handleCitationFormSubmit(event) {
        event.preventDefault();
        const url = event.target[0].value;
        parseHtml(url);
    }

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

                    setContent((prevState) => ({
                        ...prevState,
                        title:
                            $("title").text() ||
                            $("meta[property='og:title']").attr("content") ||
                            $("meta[name='twitter:title']").attr("content"),
                        authors: authors,
                        website: $("meta[property='og:site_name']").attr("content"),
                        publisher: $("meta[property='article:publisher']").attr("content"),
                        publishDate:
                            $("meta[name='date']").attr("content") ||
                            $("meta[name='article:published_time']").attr("content") ||
                            $("meta[name='article:modified_time']").attr("content"),
                        url: (
                            $("link[rel='canonical']").attr("href") ||
                            $("meta[property='og:url']").attr("content") ||
                            url
                        ).replace(/\/$/, ""), // Remove trailing slash
                    }));
                })
                .catch((error) => console.error(error));
    }

    return (
        <>
            <p>{getCitation(content)}</p>
            <form className="citation-form" onSubmit={handleCitationFormSubmit}>
                <label htmlFor="url">URL</label>
                <input type="text" name="url" />
                <button>Fill in</button>
                <button type="submit">Generate Citation</button>
            </form>
        </>
    );
}
