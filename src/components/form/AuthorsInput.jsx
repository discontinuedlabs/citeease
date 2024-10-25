import { useSelector } from "react-redux";
import { uid } from "../../utils/utils.ts";
import { Icon, OutlinedButton, OutlinedIconButton, Select, TextField } from "../ui/MaterialComponents";

export default function AuthorsInput(props) {
    const { content, setContent } = props;
    const { data: settings } = useSelector((state) => state.settings);

    function handleUpdateAuthor(event) {
        const { name, value } = event.target;

        const match = name.match(/(dropping-particle|given|non-dropping-particle|family|suffix)-(\d+)/);

        if (match) {
            const field = match[1];
            const index = match[2];

            setContent((prevContent) => {
                const updatedAuthors = [...prevContent.author];
                updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };

                return {
                    ...prevContent,
                    author: updatedAuthors,
                };
            });
        }
    }

    function handleAddAuthor() {
        setContent((prevContent) => ({
            ...prevContent,
            author: [
                ...prevContent.author,
                { "dropping-particle": "", given: "", "non-dropping-particle": "", family: "", suffix: "" },
            ],
        }));
    }

    function handleAddOrganization() {
        setContent((prevContent) => ({
            ...prevContent,
            author: [...prevContent.author, { literal: "" }],
        }));
    }

    function handleDeleteEntry(index) {
        setContent((prevContent) => ({
            ...prevContent,
            author: prevContent.author.filter((_, i) => i !== index),
        }));
    }

    return (
        <div className="grid gap-2">
            {content &&
                content.author &&
                content.author.map((entry, index) => {
                    return (
                        <div className="flex items-center gap-2" key={uid()}>
                            {"literal" in entry ? (
                                <>
                                    <Icon name="apartment" />
                                    <TextField
                                        className="flex-1"
                                        type="text"
                                        name={`literal-${index}`}
                                        label="Organization's name"
                                        placeholder="International Business Machines"
                                        value={entry.literal || ""}
                                        onChange={handleUpdateAuthor}
                                        autoComplete={false}
                                    />
                                </>
                            ) : (
                                <>
                                    <Icon name="person" />
                                    {settings?.advancedAuthorFields ? (
                                        // Separate author fields
                                        <>
                                            <TextField
                                                type="text"
                                                name={`dropping-particle-${index}`}
                                                label="Title"
                                                placeholder="e.g., Sir"
                                                value={entry["dropping-particle"] || ""}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                            <TextField
                                                type="text"
                                                name={`given-${index}`}
                                                label="First name(s)"
                                                placeholder="e.g., Isaac Newton"
                                                value={entry.given || ""}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                            <TextField
                                                type="text"
                                                name={`non-dropping-particle-${index}`}
                                                label="Infix"
                                                placeholder="e.g., van der"
                                                value={entry["non-dropping-particle"] || ""}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                            <TextField
                                                type="text"
                                                name={`family-${index}`}
                                                label="Last name"
                                                placeholder="e.g., Graaf"
                                                value={entry.family || ""}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                            <TextField
                                                type="text"
                                                name={`suffix-${index}`}
                                                label="Suffix"
                                                placeholder="e.g., III"
                                                value={entry.suffix || ""}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                            <Select
                                                label="Role"
                                                options={[
                                                    { headline: "Author", value: "author" },
                                                    { headline: "Editor", value: "editor" },
                                                    { headline: "Translator", value: "translator" },
                                                ]}
                                            />
                                        </>
                                    ) : (
                                        // Combine all author fields into two fields
                                        <>
                                            <TextField
                                                className="flex-1"
                                                type="text"
                                                name={`given-${index}`}
                                                label="First name(s)"
                                                placeholder="e.g., Sir Isaac Newton III"
                                                value={`${entry["dropping-particle"] || ""} ${entry.given || ""} ${entry.suffix || ""}`.trim()}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                            <TextField
                                                className="flex-1"
                                                type="text"
                                                name={`family-${index}`}
                                                label="Last name"
                                                placeholder="e.g., van der Graaf"
                                                value={`${entry["non-dropping-particle"] || ""} ${entry.family || ""}`.trim()}
                                                onChange={handleUpdateAuthor}
                                                autoComplete={false}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                            <OutlinedIconButton name="delete" onClick={() => handleDeleteEntry(index)} />
                        </div>
                    );
                })}

            <div className="flex gap-2">
                <OutlinedButton className="flex-1" onClick={handleAddAuthor}>
                    <Icon name="person" /> Add person
                </OutlinedButton>
                <OutlinedButton className="flex-1" onClick={handleAddOrganization}>
                    <Icon name="apartment" /> Add organization
                </OutlinedButton>
            </div>
        </div>
    );
}
