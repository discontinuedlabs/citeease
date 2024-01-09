import { v4 as uuid4 } from "uuid";

export default function AuthorsInput(props) {
    const { content, setContent } = props;

    function updateAuthors(id, key, value) {
        const newArray = content.authors.map((author) => {
            if (author.id === id) {
                return {
                    ...author,
                    [key]: value,
                };
            }
            return author;
        });

        setContent((prevContent) => {
            return {
                ...prevContent,
                authors: newArray,
            };
        });
    }

    function handleAddAuthor() {
        setContent((prevContent) => {
            return {
                ...prevContent,
                authors: [...prevContent.authors, { firstName: "", lastName: "", id: uuid4() }],
            };
        });
    }

    return (
        <div className="author-inputs-container">
            <p>
                If the author is an organization, keep the last name empty, and type the full
                organization's name in the author's first name field.
            </p>
            {content.authors &&
                content.authors.map((author) => (
                    <div key={author.id}>
                        <label htmlFor="first-name last-name">Author</label>
                        <input
                            type="text"
                            name="first-name"
                            placeholder="Author's first name"
                            value={author.firstName || ""}
                            onChange={(event) => {
                                updateAuthors(author.id, "firstName", event.target.value);
                            }}
                        />
                        <input
                            type="text"
                            name="last-name"
                            placeholder="Author's first name"
                            value={author.lastName || ""}
                            onChange={(event) => {
                                updateAuthors(author.id, "lastName", event.target.value);
                            }}
                        />
                    </div>
                ))}
            <button type="button" onClick={handleAddAuthor}>
                Add author
            </button>
        </div>
    );
}
