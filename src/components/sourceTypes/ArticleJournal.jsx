import { useRef, useState } from "react";
import * as citationUtils from "../../utils/citationUtils.ts";
import AuthorsInput from "../form/AuthorsInput";
import DateInput from "../form/DateInput";
import { useDialog } from "../../context/DialogContext.tsx";

export default function ArticleJournal(props) {
    const { content, setContent, handleAddReference, handleCancel } = props;
    const [doi, setDoi] = useState("");
    const autoFillDoiRef = useRef(null);
    const dialog = useDialog();

    async function retrieveContent(source) {
        try {
            const retreivedContent = await citationUtils.retrieveContentFromDOI(source);
            setContent((prevContent) => ({
                ...prevContent,
                ...retreivedContent,
            }));
        } catch (error) {
            if (!error.response && error.message === "Network Error") {
                dialog.show({
                    headline: "Network Error",
                    content:
                        "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again.",
                    actions: [["Ok", () => dialog.close()]],
                });
            } else {
                dialog.show({
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
            <label htmlFor="auto-filler-doi">
                DOI
                <input
                    type="text"
                    name="auto-filler-doi"
                    placeholder="Insert a DOI"
                    ref={autoFillDoiRef}
                    value={doi || ""}
                    onChange={handleDoiChange}
                />
            </label>

            <button type="button" onClick={handleFillIn}>
                Fill in
            </button>

            <p>Or enter the article details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">
                Article title
                <input
                    type="text"
                    name="title"
                    value={content.title || ""}
                    placeholder="Article title"
                    onChange={(event) => updateContentField("title", event.target.value)}
                    required
                />
            </label>

            <label htmlFor="journal">
                Journal title
                <input
                    type="text"
                    name="journal"
                    value={content["container-title"] || ""}
                    placeholder="Journal title"
                    onChange={(event) => updateContentField("container-title", event.target.value)}
                />
            </label>

            <label htmlFor="volume">
                Volume
                <input
                    type="number"
                    name="volume"
                    value={content.volume || ""}
                    placeholder="Enter a number"
                    onChange={(event) => updateContentField("volume", event.target.value)}
                />
            </label>

            <label htmlFor="issue">
                Issue
                <input
                    type="number"
                    name="issue"
                    value={content.issue || ""}
                    placeholder="Enter a number"
                    onChange={(event) => updateContentField("issue", event.target.value)}
                />
            </label>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="publication-date">
                Publication date
                <DateInput
                    name="publication-date"
                    content={content}
                    setContent={setContent}
                    dateKey="issued"
                    aria-labelledby="publication-date-label"
                />
            </label>

            <label htmlFor="pages">
                Pages
                <input
                    type="text"
                    name="pages"
                    value={content.page || ""}
                    placeholder="Page range"
                    onChange={(event) => updateContentField("page", event.target.value)}
                />
            </label>

            <label htmlFor="issn">
                ISSN
                <input
                    type="text"
                    name="issn"
                    value={content.ISSN || ""}
                    placeholder="ISSN number"
                    onChange={(event) => updateContentField("ISSN", event.target.value)}
                />
            </label>

            <label htmlFor="online">
                Accessed online?
                <input
                    type="checkbox"
                    name="online"
                    checked={content.online}
                    onChange={(event) => updateContentField("online", event.target.value)}
                />
            </label>

            {content.online && (
                <>
                    <label htmlFor="doi">
                        DOI
                        <input
                            type="text"
                            name="doi"
                            value={content.DOI || ""}
                            placeholder="DOI"
                            onChange={(event) => updateContentField("DOI", event.target.value)}
                        />
                    </label>

                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label htmlFor="access-date">
                        Access date
                        <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessed" />
                    </label>
                </>
            )}

            <button type="submit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
