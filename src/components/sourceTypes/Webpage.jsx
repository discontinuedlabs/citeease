import { useRef, useState } from "react";
import * as citationUtils from "../../utils/citationUtils.ts";
import DateInput from "../form/DateInput";
import AuthorsInput from "../form/AuthorsInput";
import { useDialog } from "../../context/DialogContext.tsx";

export default function Webpage(props) {
    const { content, setContent, handleAddReference, handleCancel } = props;
    const [url, setUrl] = useState("");
    const autoFillUrlRef = useRef(null);
    const dialog = useDialog();

    async function retrieveContent(source) {
        try {
            const retreivedContent = await citationUtils.retrieveContentFromURL(source);
            setContent((prevContent) => ({
                ...prevContent,
                ...retreivedContent,
            }));
        } catch (error) {
            if (!error.response && error.message === "Network Error") {
                dialog.open({
                    headline: "Network Error",
                    content:
                        "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again.",
                    actions: [["Ok", () => dialog.close()]],
                });
            } else {
                dialog.open({
                    headline: "No results found",
                    content:
                        "Failed to retrieve information from DOI. Please check your internet connection and ensure the provided DOI is correct.",
                    actions: [["Ok", () => dialog.close()]],
                });
            }
            console.error(error);
        }
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
            <label htmlFor="auto-filler-url">
                URL
                <input
                    type="text"
                    name="auto-filler-url"
                    placeholder="Insert a URL"
                    ref={autoFillUrlRef}
                    value={url || ""}
                    onChange={handleUrlChange}
                />
            </label>

            <button type="button" onClick={handleFillIn}>
                Fill in
            </button>

            <p>Or enter webpage details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">
                Title
                <input
                    type="text"
                    name="title"
                    value={content.title || ""}
                    placeholder="Page title"
                    onChange={(event) => updateContentField("title", event.target.value)}
                    required
                />
            </label>

            <label htmlFor="website">
                Website
                <input
                    type="text"
                    name="website"
                    value={content["container-title"] || ""}
                    placeholder="Website title"
                    onChange={(event) => updateContentField("container-title", event.target.value)}
                />
            </label>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="publication-date">
                Publication date
                <DateInput name="publication-date" content={content} setContent={setContent} dateKey="issued" />
            </label>

            <label htmlFor="url">
                URL (link)
                <input
                    type="text"
                    name="url"
                    value={content.URL || ""}
                    placeholder="URL (link)"
                    onChange={(event) => updateContentField("URL", event.target.value)}
                    required
                />
            </label>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="access-date">
                Access date
                <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessed" />
            </label>

            <button type="submit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
