import { v4 as uuid4 } from "uuid";
import DateInput from "../DateInput";
import AuthorsInput from "../AuthorsInput";
import { useRef } from "react";

export default function Journal(props) {
    const { content, setContent, setCitation, toggleEditMode, showToast } = props;
    const autoFillDoiRef = useRef(null);

    function retrieveContent(source) {
        if (source)
            fetch(`https://corsproxy.io/?https://api.crossref.org/works/${source}`)
                .then((response) => response.json())
                .then((data) => {
                    data = data.message;

                    let authors = [];
                    for (let author of data.author) {
                        const newAuthor = `${author.given} ${author.family}`;
                        authors.push(newAuthor);
                    }

                    setContent({
                        title: data.title[0],
                        authors: createAuthorsArray(authors),
                        journal: data["container-title"][0] || data["short-container-title"][0],
                        publisher: data.publisher,
                        publicationDate: new Date(
                            data.created["date-time"] ||
                                (data.created["date-parts"][0][0],
                                data.created["date-parts"][0][1],
                                data.created["date-parts"][0][2]) ||
                                data.created.timestamp ||
                                (data.issued["date-parts"][0][0],
                                data.issued["date-parts"][0][1],
                                data.issued["date-parts"][0][2]) ||
                                (data.published["date-parts"][0][0],
                                data.published["date-parts"][0][1],
                                data.published["date-parts"][0][2]) ||
                                (data["published-online"]["date-parts"][0][0],
                                data["published-online"]["date-parts"][0][1],
                                data["published-online"]["date-parts"][0][2]) ||
                                data.deposited["date-time"] ||
                                (data.deposited["date-parts"][0][0],
                                data.deposited["date-parts"][0][1],
                                data.deposited["date-parts"][0][2]) ||
                                data.deposited.timestamp ||
                                new Date()
                        ),
                        volume: data.volume,
                        issue: data.issue || data["journal-issue"].issue,
                        pages: data.page,
                        doi: data.DOI || data.URL,
                        url: data.resource.primary.URL || data.link[0].URL || data.resource.primary.URL,
                        online:
                            data.resource.primary.URL || data.link[0].URL || data.resource.primary.URL ? true : false,
                        issn: data.ISSN[0] || data["issn-type"][0].value,
                        accessDate: new Date(),
                    });
                })
                .catch((error) => {
                    if (!error.response && error.message === "Network Error") {
                        showToast(
                            "Network Error",
                            "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again."
                        );
                    } else {
                        showToast(
                            "No results found",
                            "Failed to retrieve information from DOI. Please check your internet connection and ensure the provided DOI is correct."
                        );
                    }
                    console.error(error);
                });
    }

    // This must recieve authors as an array with the full names ["Michael Connelly", ...]
    function createAuthorsArray(authors) {
        const result = authors.map((author) => {
            const names = author.split(/\s+/);
            const firstName = names.shift() || "";
            const lastName = names.join(" ");
            return { firstName, lastName, id: uuid4() };
        });

        return result;
    }

    function handleFillIn() {
        const autoFillDoi = autoFillDoiRef.current.value;
        retrieveContent(autoFillDoi);
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
            />

            <label htmlFor="journal">Journal title</label>
            <input
                type="text"
                name="journal"
                value={content.journal}
                placeholder="Journal title"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        journal: event.target.value,
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
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="publicationDate" />

            <label htmlFor="pages">Pages</label>
            <input
                type="text"
                name="pages"
                value={content.pages}
                placeholder="Page range"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        pages: event.target.value,
                    }))
                }
            />

            <label htmlFor="issn">ISSN</label>
            <input
                type="text"
                name="issn"
                value={content.issn}
                placeholder="ISSN number"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        issn: event.target.value,
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
                        value={content.doi}
                        placeholder="DOI"
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                doi: event.target.value,
                            }))
                        }
                    />

                    <label htmlFor="access-date">Access date</label>
                    <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessDate" />
                </>
            )}

            <button type="sumbit">Add reference</button>
            <button type="button" onClick={handleCancel}>
                Cancel
            </button>
        </form>
    );
}
