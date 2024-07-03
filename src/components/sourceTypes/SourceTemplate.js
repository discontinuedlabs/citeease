import DateInput from "../form/DateInput";
import AuthorsInput from "../form/AuthorsInput";

export default function SourceTemplate(props) {
    const { content, setContent, toggleEditMode, showAcceptDialog } = props;

    function retrieveContent(source) {
        if (source) {
            fetch(`https://corsproxy.io/?https://api.crossref.org/works/${source}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    setContent({});
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
    }

    // This must recieve authors as an array with the full names ["Michael Connelly", ...]

    function handleFillIn(event) {
        event.preventDefault();
        const doi = event.target[0]?.value;
        retrieveContent(doi);
    }

    return (
        <form className="citation-form" onSubmit={handleFillIn}>
            <p>Insert the DOI here to fill the fields automatically:</p>
            <label htmlFor="doi">DOI</label>
            <input type="text" name="doi" placeholder="Insert a DOI" />
            <button type="submit">Fill in</button>

            <p>Or enter the article details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">Title</label>
            <input
                type="text"
                name="title"
                value={content.title}
                placeholder="Page title"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        title: event.target.value,
                    }))
                }
            />

            <label htmlFor="publication-date">Publication date</label>
            <DateInput name="publication-date" content={content} setContent={setContent} dateKey="publication" />

            <label htmlFor="doi">DOI</label>
            <input
                type="text"
                name="doi"
                value={content.doi}
                placeholder="DOI"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        url: event.target.value,
                    }))
                }
            />

            <label htmlFor="access-date">Access date</label>
            <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessDate" />

            <button type="button" onClick={toggleEditMode}>
                Add reference
            </button>
            <button type="button" onClick={toggleEditMode}>
                Cancel
            </button>
        </form>
    );
}
