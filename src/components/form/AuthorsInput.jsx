import { uid } from "../../utils/utils.tsx";

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

        setContent((prevContent) => ({
            ...prevContent,
            author: newArray,
        }));
    }

    function handleAddAuthor() {
        setContent((prevContent) => ({
            ...prevContent,
            author: [
                ...(Array.isArray(prevContent.author) ? prevContent.author : []),
                { given: "", family: "", id: uid() },
            ],
        }));
    }

    return (
        <div className="author-inputs-container">
            {content &&
                content.author &&
                content.author.map((authorEntry) => (
                    <div key={authorEntry.id}>
                        <label htmlFor="given-name family-name">
                            Author
                            <input
                                type="text"
                                name="given-name"
                                placeholder="Author's first name"
                                value={authorEntry.given || ""}
                                onChange={(event) => {
                                    updateAuthors(authorEntry.id, "given", event.target.value);
                                }}
                                autoComplete="false"
                            />
                            <input
                                type="text"
                                name="family-name"
                                placeholder="Author's last name"
                                value={authorEntry.family || ""}
                                onChange={(event) => {
                                    updateAuthors(authorEntry.id, "family", event.target.value);
                                }}
                                autoComplete="false"
                            />
                        </label>
                    </div>
                ))}

            <button type="button" onClick={handleAddAuthor}>
                Add author
            </button>
        </div>
    );
}
