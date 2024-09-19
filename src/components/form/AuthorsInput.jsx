import { uid } from "../../utils/utils.ts";
import { FilledButton, TextField } from "../ui/MaterialComponents";

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
        <>
            {content &&
                content.author &&
                content.author.map((authorEntry, index) => (
                    <div key={authorEntry.id}>
                        Author
                        <TextField
                            type="text"
                            name={`given-name-${index}`}
                            label="First name"
                            placeholder="Author's first name"
                            value={authorEntry.given || ""}
                            onChange={(event) => {
                                updateAuthors(authorEntry.id, "given", event.target.value);
                            }}
                            autoComplete="false"
                        />
                        <TextField
                            type="text"
                            name={`family-name-${index}`}
                            label="Last name"
                            placeholder="Author's last name"
                            value={authorEntry.family || ""}
                            onChange={(event) => {
                                updateAuthors(authorEntry.id, "family", event.target.value);
                            }}
                            autoComplete="false"
                        />
                    </div>
                ))}

            <FilledButton onClick={handleAddAuthor}>Add author</FilledButton>
        </>
    );
}
