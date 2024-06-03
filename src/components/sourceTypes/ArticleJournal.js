import { useRef, useState } from "react";
import * as citationUtils from "../../utils/citationUtils";
import DateInput from "../formElements/DateInput";
import AuthorsInput from "../formElements/AuthorsInput";

export default function ArticleJournal(props) {
    const { content, setContent, showAcceptDialog, handleAddReference, handleCancel } = props;
    const [doi, setDoi] = useState("");
    const autoFillDoiRef = useRef(null);

    async function retrieveContent(source) {
        try {
            const content = await citationUtils.retrieveContentFromDOI(source);
            setContent((prevContent) => {
                return {
                    ...prevContent,
                    ...content,
                };
            });
        } catch (error) {
            if (!error.response && error.message === "Network Error") {
                showAcceptDialog(
                    "Network Error",
                    "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again."
                );
            } else {
                showAcceptDialog(
                    "No results found",
                    "Failed to retrieve information from DOI. Please check your internet connection and ensure the provided DOI is correct."
                );
            }
            console.error(error);
        }
    }

    function handleFillIn() {
        retrieveContent(autoFillDoiRef.current.value);
    }

    function updateContentField(key, value) {
        setContent((prevContent) => ({
            ...prevContent,
            [key]: value,
        }));
    }

    function handleDoiChange(event) {
        setDoi(event.target.value);
    }

    return (
        <form className="citation-form" onSubmit={handleAddReference}>
            <p>Insert the DOI here to fill the fields automatically:</p>
            <label htmlFor="auto-filler-doi">DOI</label>
            <input
                type="text"
                name="auto-filler-doi"
                placeholder="Insert a DOI"
                ref={autoFillDoiRef}
                value={doi}
                onChange={handleDoiChange}
            />
            <button type="button" onClick={handleFillIn}>
                Fill in
            </button>

            <p>Or enter the article details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">Article title</label>
            <input
                type="text"
                name="title"
                value={content.title}
                placeholder="Article title"
                onChange={(event) => updateContentField("title", event.target.value)}
                required
            />

            <label htmlFor="journal">Journal title</label>
            <input
                type="text"
                name="journal"
                value={content["container-title"]}
                placeholder="Journal title"
                onChange={(event) => updateContentField("container-title", event.target.value)}
            />

            <label htmlFor="volume">Volume</label>
            <input
                type="number"
                name="volume"
                value={content.volume}
                placeholder="Enter a number"
                onChange={(event) => updateContentField("volume", event.target.value)}
            />

            <label htmlFor="issue">Issue</label>
            <input
                type="number"
                name="issue"
                value={content.issue}
                placeholder="Enter a number"
                onChange={(event) => updateContentField("issue", event.target.value)}
            />

            <label htmlFor="publication-date">Publication date</label>
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="issued" />

            <label htmlFor="pages">Pages</label>
            <input
                type="text"
                name="pages"
                value={content.page}
                placeholder="Page range"
                onChange={(event) => updateContentField("page", event.target.value)}
            />

            <label htmlFor="issn">ISSN</label>
            <input
                type="text"
                name="issn"
                value={content.ISSN}
                placeholder="ISSN number"
                onChange={(event) => updateContentField("ISSN", event.target.value)}
            />

            <label htmlFor="online">Accessed online?</label>
            <input
                type="checkbox"
                name="online"
                checked={content.online}
                onChange={(event) => updateContentField("online", event.target.value)}
            />

            {content.online && (
                <>
                    <label htmlFor="doi">DOI</label>
                    <input
                        type="text"
                        name="doi"
                        value={content.DOI}
                        placeholder="DOI"
                        onChange={(event) => updateContentField("DOI", event.target.value)}
                    />

                    <label htmlFor="access-date">Access date</label>
                    <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessed" />
                </>
            )}

            <button type="sumbit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
