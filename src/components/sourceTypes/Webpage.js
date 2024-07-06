import { useRef, useState } from "react";
import * as citationUtils from "../../utils/citationUtils.ts";
import DateInput from "../form/DateInput";
import AuthorsInput from "../form/AuthorsInput";
import { useModal } from "../../context/ModalContext";

export default function Webpage(props) {
    const { content, setContent, handleAddReference, handleCancel } = props;
    const [url, setUrl] = useState("");
    const autoFillUrlRef = useRef(null);
    const modal = useModal();

    async function retrieveContent(source) {
        try {
            const retreivedContent = await citationUtils.retrieveContentFromURL(source);
            setContent((prevContent) => ({
                ...prevContent,
                ...retreivedContent,
            }));
        } catch (error) {
            if (!error.response && error.message === "Network Error") {
                modal.open({
                    title: "Network Error",
                    message:
                        "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again.",
                    actions: [["Accept", () => modal.close()]],
                });
            } else {
                modal.open({
                    title: "No results found",
                    message:
                        "Failed to retrieve information from DOI. Please check your internet connection and ensure the provided DOI is correct.",
                    actions: [["Accept", () => modal.close()]],
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
                value={content["container-title"]}
                placeholder="Website title"
                onChange={(event) => updateContentField("container-title", event.target.value)}
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
