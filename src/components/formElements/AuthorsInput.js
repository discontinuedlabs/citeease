import { v4 as uuid4 } from "uuid";

export default function AuthorsInput(props) {
    const { content, setContent } = props;

    function updateAuthors(id, key, value) {
        const newArray = content.author.map((author) => {
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
                author: newArray,
            };
        });
    }

    function handleAddAuthor() {
        setContent((prevContent) => {
            return {
                ...prevContent,
                author: [
                    ...(Array.isArray(prevContent.author) ? prevContent.author : []),
                    { given: "", family: "", id: uuid4() },
                ],
            };
        });
    }

    return (
        <div className="author-inputs-container">
            <p>
                If the author is an organization, keep the last name empty, and type the full organization's name in the
                author's first name field.
            </p>
            {content &&
                content.author &&
                content.author.map((author) => (
                    <div key={author.id}>
                        <label htmlFor="given-name family-name">Author</label>
                        <input
                            type="text"
                            name="given-name"
                            placeholder="Author's first name"
                            value={author.given || ""}
                            onChange={(event) => {
                                updateAuthors(author.id, "given", event.target.value);
                            }}
                        />
                        <input
                            type="text"
                            name="family-name"
                            placeholder="Author's first name"
                            value={author.family || ""}
                            onChange={(event) => {
                                updateAuthors(author.id, "family", event.target.value);
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
