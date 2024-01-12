import { v4 as uuid4 } from "uuid";
import DateInput from "../DateInput";
import AuthorsInput from "../AuthorsInput";
import { useEffect, useRef } from "react";

export default function Book(props) {
    const { content, setContent, setCitation, toggleEditMode, showToast } = props;
    const autoFillIsbnRef = useRef(null);

    useEffect(() => {
        console.log(content);
    }, [content]);

    function retrieveContent(source) {
        if (source)
            fetch(`https://openlibrary.org/search.json?q=isbn:${source}&mode=everything&fields=*,editions`)
                .then((response) => response.json())
                .then((data) => {
                    data = data.docs[0];
                    console.log(data);

                    setContent({
                        title: data.title,
                        city: data.publish_place[0],
                        allCities: data.publish_place,
                        authors: createAuthorsArray(data.author_name),
                        publisher: data.publisher[0],
                        allPublishers: data.publisher,
                        year: data.publish_year[0],
                        allYears: data.publish_year,
                        pages: data.number_of_pages_median,
                        edition: data.edition_count,
                        originalPublished: data.first_publish_year || Math.min(...data.publish_year),
                        isbn: selectBestIsbn(data.isbn),
                        // multiVolume: data,
                        // volume: data,
                        // volumeTitle: data,
                        // online: data,
                        // doi: data,
                        // url: data,
                        // accessDate: data,
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
                            "Failed to retrieve information from ISBN. Please check your internet connection and ensure the provided ISBN is correct."
                        );
                    }
                    console.error(error);
                });
    }

    // This must recieve authors as an array with the full names ["Michael Connelly", ...]
    function createAuthorsArray(authors) {
        const result = authors.map((author) => {
            const names = author.split(/[\s.]+/);
            const firstName = names.shift() || "";
            const lastName = names.join(" ");
            return { firstName, lastName, id: uuid4() };
        });

        return result;
    }

    function selectBestIsbn(isbnArray) {
        isbnArray.sort((a, b) => b.length - a.length);
        return isbnArray[0];
    }

    function handleFillIn() {
        const autoFillIsbn = autoFillIsbnRef.current.value;
        retrieveContent(autoFillIsbn);
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
            <p>Insert the ISBN here to fill the fields automatically:</p>
            <label htmlFor="auto-filler-isbn">ISBN</label>
            <input type="text" name="auto-filler-isbn" placeholder="Insert an ISBN" ref={autoFillIsbnRef} />
            <button type="button" onClick={handleFillIn}>
                Fill in
            </button>

            <p>Or enter the book details manually:</p>
            <AuthorsInput content={content} setContent={setContent} />

            <label htmlFor="title">Book title</label>
            <input
                type="text"
                name="title"
                value={content.title}
                placeholder="Book title"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        title: event.target.value,
                    }))
                }
            />

            <label htmlFor="city">City</label>
            <input
                type="text"
                name="city"
                value={content.city}
                placeholder="City"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        city: event.target.value,
                    }))
                }
            />

            {content.allCities && content.allCities.length > 1 && (
                <>
                    <label>Choose another city</label>
                    <select
                        value={content.city}
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                city: event.target.value,
                            }))
                        }
                    >
                        {content.allCities.map((city) => (
                            <option value={city}>{city}</option>
                        ))}
                    </select>
                </>
            )}

            <label htmlFor="publisher">Publisher</label>
            <input
                type="text"
                name="publisher"
                value={content.publisher}
                placeholder="Publisher"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        publisher: event.target.value,
                    }))
                }
            />

            {content.allPublishers && content.allPublishers.length > 1 && (
                <>
                    <label>Choose another publisher</label>
                    <select
                        value={content.allPublishers}
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                publisher: event.target.value,
                            }))
                        }
                    >
                        {content.allPublishers.map((publisher) => (
                            <option value={publisher}>{publisher}</option>
                        ))}
                    </select>
                </>
            )}

            <label htmlFor="year">Year</label>
            <input
                type="number"
                name="year"
                value={content.year || new Date(content.publicationDate).getFullYear()}
                placeholder="Year"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        year: event.target.value,
                    }))
                }
            />

            {content.allYears && content.allYears.length > 1 && (
                <>
                    <label>Choose another year</label>
                    <select
                        value={content.year}
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                year: event.target.value,
                            }))
                        }
                    >
                        {content.allYears.map((year) => (
                            <option value={year}>{year}</option>
                        ))}
                    </select>
                </>
            )}

            <label htmlFor="pages">Number of pages</label>
            <input
                type="number"
                name="pages"
                value={content.pages}
                placeholder="Number of pages"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        pages: event.target.value,
                    }))
                }
            />

            <label htmlFor="edition">Edition No.</label>
            <input
                type="number"
                name="edition"
                value={content.edition}
                placeholder="Edition number (exepct 1)"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        edition: event.target.value,
                    }))
                }
            />

            <label htmlFor="original-year">Original published</label>
            <input
                type="number"
                name="original-published"
                value={content.originalPublished}
                placeholder="Original published (year)"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        originalPublished: event.target.value,
                    }))
                }
            />

            <label htmlFor="isbn">ISBN</label>
            <input
                type="text"
                name="isbn"
                value={content.isbn}
                placeholder="ISBN number"
                onChange={(event) =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        isbn: event.target.value,
                    }))
                }
            />

            <label htmlFor="multi-volume">Part of a multi-volume book?</label>
            <input
                type="checkbox"
                name="multi-volume"
                checked={content.multiVolume}
                onChange={() =>
                    setContent((prevContent) => ({
                        ...prevContent,
                        multiVolume: !prevContent.multiVolume,
                    }))
                }
            />

            {content.multiVolume && (
                <>
                    <label htmlFor="volume">Volume No.</label>
                    <input
                        type="number"
                        name="volume"
                        value={content.volume}
                        placeholder="Volume number"
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                volume: event.target.value,
                            }))
                        }
                    />

                    <label htmlFor="volume-title">Volume title</label>
                    <input
                        type="text"
                        name="volume-title"
                        value={content.volumeTitle}
                        placeholder="Volume title"
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                volumeTitle: event.target.value,
                            }))
                        }
                    />
                </>
            )}

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
                    <label htmlFor="url">DOI / URL</label>
                    <input
                        type="text"
                        name="url"
                        value={content.doi || content.url}
                        placeholder="DOI / URL"
                        onChange={(event) =>
                            setContent((prevContent) => ({
                                ...prevContent,
                                url: event.target.value,
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
