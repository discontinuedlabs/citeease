import DateInput from "../formElements/DateInput";
import AuthorsInput from "../formElements/AuthorsInput";
import { useRef } from "react";
import * as sourceTypeUtils from "../sourceTypeUtils";
import { useEffect } from "react";

export default function Journal(props) {
    const { content, setContent, showAcceptDialog, setCitationWindowVisible } = props;
    const autoFillDoiRef = useRef(null);

    useEffect(() => {
        setContent((prevContent) => {
            return { ...prevContent, type: "journal-article" };
        });
    }, []);

    function retrieveContent(source) {
        if (source)
            fetch(`https://corsproxy.io/?https://api.crossref.org/works/${source}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data.message);
                    setContent({
                        ...data.message,
                        online: true,
                        accessed: sourceTypeUtils.createDateObject(new Date()),
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
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        title: event.target.value,
                    }))
                }
                required
            />

            <label htmlFor="journal">Journal title</label>
            <input
                type="text"
                name="journal"
                value={content["container-title"]}
                placeholder="Journal title"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        "container-title": event.target.value,
                    }))
                }
            />

            <label htmlFor="volume">Volume</label>
            <input
                type="number"
                name="volume"
                value={content.volume}
                placeholder="Enter a number"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        volume: event.target.value,
                    }))
                }
            />

            <label htmlFor="issue">Issue</label>
            <input
                type="number"
                name="issue"
                value={content.issue}
                placeholder="Enter a number"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        issue: event.target.value,
                    }))
                }
            />

            <label htmlFor="publication-date">Publication date</label>
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="published" />

            <label htmlFor="pages">Pages</label>
            <input
                type="text"
                name="pages"
                value={content.page}
                placeholder="Page range"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        page: event.target.value,
                    }))
                }
            />

            <label htmlFor="issn">ISSN</label>
            <input
                type="text"
                name="issn"
                value={content.ISSN}
                placeholder="ISSN number"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        ISSN: event.target.value[0],
                    }))
                }
            />

            <label htmlFor="online">Accessed online?</label>
            <input
                type="checkbox"
                name="online"
                checked={content.online}
                onChange={() =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        online: !prevContent.online,
                    }))
                }
            />

            {content.online && (
                <>
                    <label htmlFor="doi">DOI</label>
                    <input
                        type="text"
                        name="doi"
                        value={content.DOI}
                        placeholder="DOI"
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                DOI: event.target.value,
                            }))
                        }
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
