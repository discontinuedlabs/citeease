import { forwardRef, useRef, useState } from "react";
import * as citationUtils from "../../utils/citationUtils.ts";
import AuthorsInput from "../form/AuthorsInput";
import DateInput from "../form/DateInput";
import { useDialog } from "../../context/DialogContext.tsx";
import { Checkbox, Divider, FilledButton, TextField } from "../ui/MaterialComponents";

const ArticleJournal = forwardRef(function ArticleJournal(props, ref) {
    const { content: passedContant } = props;
    const [content, setContent] = useState(passedContant);
    const [doi, setDoi] = useState("");
    const autoFillDoiRef = useRef(null);
    const dialog = useDialog();

    async function retrieveContent(source) {
        try {
            const retreivedContent = await citationUtils.retrieveContentFromDOI(source);
            setContent((prevContent) => ({
                ...prevContent,
                ...retreivedContent,
            }));
        } catch (error) {
            if (!error.response && error.message === "Network Error") {
                dialog.show({
                    headline: "Network Error",
                    content:
                        "Unable to retrieve the webpage due to network issues. Please check your internet connection and try again.",
                    actions: [["Ok", () => dialog.close()]],
                });
            } else {
                dialog.show({
                    headline: "No results found",
                    content:
                        "Failed to retrieve information from DOI. Please check your internet connection and ensure the provided DOI is correct.",
                    actions: [["Ok", () => dialog.close()]],
                });
            }
            console.error(error);
        }
    }

    function handleFillIn() {
        retrieveContent(autoFillDoiRef.current.value);
    }

    function updateContentField(key, value) {
        setContent((prevContent) => ({
            ...prevContent,
            [key]: value,
        }));
    }

    function handleDoiChange(event) {
        setDoi(event.target.value);
    }

    return (
        <form onSubmit={(event) => event.preventDefault()} ref={ref}>
            <TextField
                className="w-full"
                label="Insert a DOI to fill the fields automatically"
                type="text"
                name="auto-filler-doi"
                placeholder="https://doi.org/xxxx"
                ref={autoFillDoiRef}
                value={doi || ""}
                onChange={handleDoiChange}
            />

            <FilledButton className="w-full" type="button" onClick={handleFillIn}>
                Fill in
            </FilledButton>

            <Divider />

            <p>Or enter the article details manually:</p>
            <AuthorsInput name="author" content={content} setContent={setContent} />

            <TextField
                label="Article title"
                type="text"
                name="title"
                value={content.title || ""}
                placeholder="Article title"
                onChange={(event) => updateContentField("title", event.target.value)}
                required
            />

            <TextField
                label="Journal title"
                type="text"
                name="container-title"
                value={content["container-title"] || ""}
                placeholder="Journal title"
                onChange={(event) => updateContentField("container-title", event.target.value)}
            />

            <TextField
                label="Volume"
                type="number"
                name="volume"
                value={content.volume || ""}
                placeholder="Enter a number"
                onChange={(event) => updateContentField("volume", event.target.value)}
            />

            <TextField
                label="Issue"
                type="number"
                name="issue"
                value={content.issue || ""}
                placeholder="Enter a number"
                onChange={(event) => updateContentField("issue", event.target.value)}
            />

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="issued">
                Publication date
                <DateInput
                    name="issued"
                    value={content?.issued?.["date-parts"][0]}
                    onChange={(newValue) => updateContentField("issued", citationUtils.createDateObject(...newValue))}
                />
            </label>

            <TextField
                label="Pages"
                type="text"
                name="page"
                value={content?.page || ""}
                placeholder="Page range"
                onChange={(event) => updateContentField("page", event.target.value)}
            />

            <TextField
                label="ISSN"
                type="text"
                name="ISSN"
                value={content?.ISSN || ""}
                placeholder="ISSN number"
                onChange={(event) => updateContentField("ISSN", event.target.value)}
            />

            <div>
                Accessed online?
                <Checkbox
                    name="online"
                    checked={content?.online || content?.online === "on"}
                    onChange={(event) => updateContentField("online", event.target.value)}
                />
            </div>

            {content.online && (
                <>
                    <TextField
                        label="DOI"
                        type="text"
                        name="DOI"
                        value={content?.DOI || ""}
                        placeholder="DOI"
                        onChange={(event) => updateContentField("DOI", event.target.value)}
                    />

                    <div>
                        Access date
                        <DateInput
                            name="accessed"
                            value={content?.accessed?.["date-parts"][0]}
                            onChange={(newValue) =>
                                updateContentField("accessed", citationUtils.createDateObject(...newValue))
                            }
                        />
                    </div>
                </>
            )}
        </form>
    );
});

export default ArticleJournal;
