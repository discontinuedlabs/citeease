import { useRef } from "react";
import { v4 as uuid4 } from "uuid";
import * as sourceTypeUtils from "../sourceTypeUtils";
import DateInput from "../formElements/DateInput.test";
import AuthorsInput from "../formElements/AuthorsInput";

export default function JournalArticle(props) {
    const { content, setContent, showAcceptDialog, setCitationWindowVisible } = props;
    const autoFillDoiRef = useRef(null);

    function retrieveContent(source) {
        if (source)
            fetch(`https://corsproxy.io/?https://api.crossref.org/works/${source}`)
                .then((response) => response.json())
                .then((data) => {
                    setContent({
                        ...data.message,
                        // date.message has all the neccessary naming system to work with citeproc, only the below fields are missing for other purposes.
                        online: true,
                        accessed: sourceTypeUtils.createDateObject(new Date()),
                        author: data.message.author.map((author) => ({
                            ...author,
                            id: uuid4(),
                        })),
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
                            "No results found",
                            "Failed to retrieve information from DOI. Please check your internet connection and ensure the provided DOI is correct."
                        );
                    }
                    console.error(error);
                });
    }

    // TODO: handleFillIn, handleAddReference, and handleCancel should be moved to CitationWindow
    function handleFillIn() {
        const autoFillDoi = autoFillDoiRef.current.value;
        retrieveContent(autoFillDoi);
    }

    function handleAddReference(event) {
        event.preventDefault();
        setCitationWindowVisible((prevCitationWindowVisible) => !prevCitationWindowVisible);
    }

    function handleCancel() {
        setCitationWindowVisible((prevCitationWindowVisible) => !prevCitationWindowVisible);
    }

    function updateContentField(key, value) {
        setContent((prevContent) => ({
            ...prevContent,
            [key]: value,
        }));
    }

    return (
        <form className="citation-form" onSubmit={handleAddReference}>
            <p>Insert the DOI here to fill the fields automatically:</p>
            <label htmlFor="auto-filler-doi">DOI</label>
            <input type="text" name="auto-filler-doi" placeholder="Insert a DOI" ref={autoFillDoiRef} />
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
                value={content["container-title"]?.[0] ?? ""} // At the time of writing this, this is the only element that throws error when finding an undefined value. It sometimes changes its mind and doesn't do it.
                placeholder="Journal title"
                onChange={(event) => updateContentField("container-title", [event.target.value])}
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
                onChange={(event) => updateContentField("ISSN", event.target.value[0])}
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
