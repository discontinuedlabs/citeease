import DateInput from "../form/DateInput";
import AuthorsInput from "../form/AuthorsInput";
import { useModal } from "../../context/ModalContext.tsx";

export default function SourceTemplate(props) {
    const { content, setContent, toggleEditMode } = props;
    const modal = useModal();

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
            <label htmlFor="doi">
                DOI
                <input type="text" name="doi" placeholder="Insert a DOI" />
            </label>
            <button type="submit">Fill in</button>

            <p>Or enter the article details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">
                Title
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
            </label>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="publication-date">
                Publication date
                <DateInput name="publication-date" content={content} setContent={setContent} dateKey="publication" />
            </label>

            <label htmlFor="doi">
                DOI
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
            </label>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="access-date">
                Access date
                <DateInput name="access-date" content={content} setContent={setContent} dateKey="accessDate" />
            </label>

            <button type="button" onClick={toggleEditMode}>
                Add reference
            </button>
            <button type="button" onClick={toggleEditMode}>
                Cancel
            </button>
        </form>
    );
}
