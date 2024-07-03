import { useRef, useState } from "react";
import DateInput from "../form/DateInput";
import AuthorsInput from "../form/AuthorsInput";
import * as citationUtils from "../../utils/citationUtils.ts";

export default function Book(props) {
    const { content, setContent, showAcceptDialog, handleAddReference, handleCancel } = props;
    const [ISBN, setISBN] = useState("");
    const autoFillIsbnRef = useRef(null);

    async function retrieveContent(source) {
        try {
            const retreivedContent = await citationUtils.retrieveContentFromISBN(source);
            setContent((prevContent) => ({
                ...prevContent,
                ...retreivedContent,
            }));
        } catch (error) {
            if (!error.response && error.message === "Network Error") {
                showAcceptDialog(
                    "Network Error",
                    "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again."
                );
            } else {
                showAcceptDialog(
                    "No results found",
                    "Failed to retrieve information from ISBN. Please check your internet connection and ensure the provided ISBN is correct."
                );
            }
            console.error(error);
        }
    }

    function handleFillIn() {
        retrieveContent(autoFillIsbnRef.current.value);
    }

    function updateContentField(key, value) {
        setContent((prevContent) => ({
            ...prevContent,
            [key]: value,
        }));
    }

    function handleDoiChange(event) {
        setISBN(event.target.value);
    }

    return (
        <form className="citation-form" onSubmit={handleAddReference}>
            <p>Insert the ISBN here to fill the fields automatically:</p>
            <label htmlFor="auto-filler-isbn">ISBN</label>
            <input
                type="text"
                name="auto-filler-isbn"
                placeholder="Insert an ISBN"
                value={ISBN}
                ref={autoFillIsbnRef}
                onChange={handleDoiChange}
            />
            <button type="button" onClick={handleFillIn}>
                Fill in
            </button>

            <p>Or enter the book details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">Book title</label>
            <input
                type="text"
                name="title"
                value={content?.title}
                placeholder="Book title"
                onChange={(event) => updateContentField("title", event.target.value)}
                required
            />

            <label htmlFor="city">Publisher place</label>
            <input
                type="text"
                name="publisher-place"
                value={content?.["publisher-place"]}
                placeholder="Publisher place"
                onChange={(event) => updateContentField("publisher-place", event.target.value)}
            />

            <label htmlFor="publisher">Publisher</label>
            <input
                type="text"
                name="publisher"
                value={content?.publisher}
                placeholder="Publisher"
                onChange={(event) => updateContentField("publisher", event.target.value)}
            />

            <label htmlFor="publication-date">Publication date</label>
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="issued" />

            <label htmlFor="pages">Number of pages</label>
            <input
                type="number"
                name="number-of-pages"
                value={content?.["number-of-pages"]}
                placeholder="Number of pages"
                onChange={(event) => updateContentField("number-of-pages", event.target.value)}
            />

            <label htmlFor="edition">Edition No.</label>
            <input
                type="number"
                name="edition"
                value={content?.edition}
                placeholder="Edition number (exept 1)"
                onChange={(event) => updateContentField("edition", event.target.value)}
            />

            <label htmlFor="original-year">Original published</label>
            <input
                type="number"
                name="original-published"
                value={content?.first_publish_year}
                placeholder="Original published (year)"
                onChange={(event) => updateContentField("first_publish_year", event.target.value)}
            />

            <label htmlFor="isbn">ISBN</label>
            <input
                type="text"
                name="isbn"
                value={content?.ISBN}
                placeholder="ISBN number"
                onChange={(event) => updateContentField("ISBN", event.target.value)}
            />

            <label htmlFor="multi-volume">Part of a multi-volume book?</label>
            <input
                type="checkbox"
                name="multi-volume"
                checked={content?.multiVolume}
                onChange={(event) => updateContentField("multiVolume", event.target.checked)}
            />

            {content?.multiVolume && (
                <>
                    <label htmlFor="volume">Volume No.</label>
                    <input
                        type="number"
                        name="volume"
                        value={content?.volume}
                        placeholder="Volume number"
                        onChange={(event) => updateContentField("volume", event.target.value)}
                    />

                    <label htmlFor="volume">Number of volumes</label>
                    <input
                        type="number"
                        name="number-of-volumes"
                        value={content?.["number-of-volumes"]}
                        placeholder="Number of volumes"
                        onChange={(event) => updateContentField("number-of-volumes", event.target.value)}
                    />

                    <label htmlFor="volume-title">Volume title</label>
                    <input
                        type="text"
                        name="volume-title"
                        value={content?.volumeTitle}
                        placeholder="Volume title"
                        onChange={(event) => updateContentField("volumeTitle", event.target.value)}
                    />
                </>
            )}

            <label htmlFor="online">Accessed online?</label>
            <input
                type="checkbox"
                name="online"
                checked={content?.online}
                onChange={(event) => updateContentField("online", event.target.checked)}
            />

            {content?.online && (
                <>
                    <label htmlFor="url">DOI/URL</label>
                    <input
                        type="text"
                        name="url"
                        value={content?.url || content?.doi}
                        placeholder="DOI/URL"
                        onChange={(event) => updateContentField("url", event.target.value)}
                    />

                    <label htmlFor="access-date">Access date</label>
                    <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessDate" />
                </>
            )}

            <button type="submit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
