import React, { forwardRef, Suspense, useEffect, useId, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { useSelector } from "react-redux";
import DOMPurify from "../../utils/purify";
import locatorTypes from "../../assets/json/locatorOptions.json";
import * as citationEngine from "../../utils/citationEngine";
import sourceTypes from "../../assets/json/sourceTypes.json";
import {
    handleMasterEntriesCheckbox,
    toggleEntryCheckbox,
    updateBibField,
    updateCitation,
} from "../../data/store/slices/bibsSlice";
import * as citationUtils from "../../utils/citationUtils.ts";
import { useEnhancedDispatch, useFindBib, useOnlineStatus, useTheme } from "../../hooks/hooks.tsx";
import citationStyles from "../../assets/json/styles.json";
import mostPopularStyles from "../../assets/json/mostPopularStyles.json";
import { timeAgo, uid } from "../../utils/utils.ts";
import { hslToHsla, parseHtmlToJsx } from "../../utils/conversionUtils.tsx";
import {
    Checkbox,
    ChipSet,
    CircularProgress,
    Divider,
    EmptyPage,
    FilledButton,
    Icon,
    IconButton,
    LinearProgress,
    List,
    OutlinedButton,
    Select,
    Switch,
    TextButton,
    TextField,
} from "../../components/ui/MaterialComponents";
import { useToast } from "../../context/ToastContext.tsx";
import { useDialog } from "../../context/DialogContext.tsx";
import colorValues from "../../assets/json/colors.json";
import defaults from "../../assets/json/defaults.json";
import { EmptyStar, FilledStar } from "../../components/ui/Star";

const DateInput = React.lazy(() => import("../../components/form/DateInput"));
const AuthorsInput = React.lazy(() => import("../../components/form/AuthorsInput"));

export const CitationForm = forwardRef(function CitationForm(props, ref) {
    const { content: passedContant } = props;
    const [content, setContent] = useState(passedContant);
    const sourceType = sourceTypes[content.type];
    const autoFillRef = useRef(null);
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
                        "Unable to retrieve the journal article data due to network issues. Please check your internet connection and try again.",
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

    function updateContentField(event) {
        const { name } = event.target;
        let { value } = event.target;
        if (event.target.tagName === "MD-CHECKBOX" || event.target.nodeName === "MD-CHECKBOX") {
            value = event.target.checked;
        }
        if (event.target.tagName === "MD-SWITCH" || event.target.nodeName === "MD-SWITCH") {
            value = event.target.selected;
        }
        setContent((prevContent) => ({
            ...prevContent,
            [name]: value,
        }));
    }

    /* eslint-disable indent, react/no-array-index-key, react/jsx-props-no-spreading */
    function renderFormElements(elements) {
        return elements.map((element, index) => {
            switch (element.component) {
                case "autoFillDoi":
                    return (
                        <div key={index}>
                            <TextField
                                className="mb-2 w-full"
                                label={element.label}
                                type="text"
                                name="auto-fill-doi"
                                placeholder={element.placeholder}
                                ref={autoFillRef}
                            />
                            <FilledButton
                                className="w-full"
                                type="button"
                                onClick={() => retrieveContent(autoFillRef.current.value)}
                            >
                                Fill in
                            </FilledButton>
                        </div>
                    );
                case "divider":
                    return <Divider key={index} className="my-4" label={element.label} />;

                case "label":
                    return <p key={index}>{element.label}</p>;
                case "authors":
                    return (
                        <Suspense key={index} fallback={<CircularProgress />}>
                            <AuthorsInput key={index} name="author" content={content} setContent={setContent} />
                        </Suspense>
                    );
                case "text":
                    return (
                        <TextField
                            className="w-full"
                            key={index}
                            label={element.label}
                            type="text"
                            name={element.value}
                            value={content[element.value] || ""}
                            placeholder={element.placeholder}
                            onChange={updateContentField}
                            {...props}
                        />
                    );
                case "textarea":
                    return (
                        <TextField
                            className="w-full"
                            key={index}
                            label={element.label}
                            type="textarea"
                            rows={3}
                            name={element.value}
                            value={content[element.value] || ""}
                            placeholder={element.placeholder}
                            onChange={updateContentField}
                            {...props}
                        />
                    );
                case "number":
                    return (
                        <TextField
                            className="w-full"
                            key={index}
                            label={element.label}
                            type="number"
                            name={element.value}
                            value={content[element.value] || ""}
                            placeholder={element.placeholder}
                            onChange={updateContentField}
                            {...props}
                        />
                    );
                case "date":
                    return (
                        <Suspense key={index} fallback={<CircularProgress />}>
                            <DateInput
                                key={index}
                                label={element.label}
                                name={element.value}
                                value={content?.[element.value]}
                                onChange={updateContentField}
                            />
                        </Suspense>
                    );
                case "checkbox":
                    return (
                        <div key={index} className="grid gap-2">
                            <Switch
                                label={element.label}
                                name={element.value}
                                selected={content[element.value]}
                                onChange={updateContentField}
                            />
                            {content[element.value] === true && renderFormElements(element.on)}
                        </div>
                    );
                case "annotation":
                    return <TextField className="w-full" label="Annotation" type="textarea" rows="3" />;
                default:
                    return null;
            }
        });
    }
    /* eslint-enable indent, react/no-array-index-key, react/jsx-props-no-spreading */

    return (
        <div className="grid gap-2 p-4">
            <Select
                className="w-full"
                label="Source type"
                name="type"
                value={content.type || ""}
                options={Object.keys(sourceTypes).map((key) => ({
                    headline: sourceTypes[key].label,
                    value: key,
                }))}
                onChange={updateContentField}
            />
            <Divider className="my-4" />
            <form onSubmit={(event) => event.preventDefault()} ref={ref} className="grid gap-2">
                {renderFormElements(sourceType.form)}
            </form>
        </div>
    );
});

export function IntextCitationDialog() {
    const bibliography = useFindBib();
    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);
    const [intextCitation, setIntextCitation] = useState("");
    const [citationsForIntext, setCitationsForIntext] = useState(checkedCitations.map((cit) => cit.content));
    const [copied, setCopied] = useState(false);
    const intextRef = useRef();
    const DEFAULT_LOCATOR = locatorTypes.page;

    useEffect(() => {
        async function formatIntextCitation() {
            const formattedIntextCitation = await citationEngine.formatIntextCitation(
                citationsForIntext,
                bibliography?.style,
                "html",
                bibliography?.locale
            );
            setIntextCitation(DOMPurify.sanitize(formattedIntextCitation));
            setCopied(false);
        }
        formatIntextCitation();
    }, [citationsForIntext, bibliography?.style]);

    function updateContentField(citId, key, value) {
        setCitationsForIntext((prevCitationsForIntext) =>
            prevCitationsForIntext.map((content) => {
                if (content.id === citId && content[key] !== value) {
                    return {
                        ...content,
                        [key]: value,
                    };
                }
                return content;
            })
        );
    }

    function handleCopy() {
        try {
            const copiedText = intextRef.current.innerText;
            navigator.clipboard.writeText(copiedText);
            setCopied(true);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }

    return (
        <div className="px-4">
            <div className="flex justify-between">
                <h3 className="mb-0">Example</h3>
                <IconButton onClick={handleCopy} name={copied ? "check" : "content_copy"} />
            </div>
            <p className="font-cambo" ref={intextRef}>
                {parseHtmlToJsx(intextCitation)}
            </p>

            <Divider />

            <h3>Locators</h3>
            <p>
                When citing a particular section of a source, indicate its specific location, such as a page number or
                time marker.
            </p>
            {citationsForIntext.map((cit) => (
                <div key={cit.id}>
                    <h4 className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {cit?.title || (cit?.author.length !== 0 && cit?.issued)
                            ? `${cit?.author[0]?.family} (${cit?.issued["date-parts"][0][0]})`
                            : cit?.DOI || cit?.URL || cit?.ISBN || cit?.ISSN}
                    </h4>

                    <div className="flex w-full">
                        <Select
                            value={cit?.label || DEFAULT_LOCATOR.code}
                            name="intext-label"
                            options={Object.values(locatorTypes).map((option) => ({
                                headline: option.name,
                                value: option.code,
                            }))}
                            onChange={(event) =>
                                updateContentField(cit.id, "label", locatorTypes[event.target.value].code)
                            }
                            className="flex-1"
                        />
                        <TextField
                            label={locatorTypes[cit.label]?.name || DEFAULT_LOCATOR.name}
                            name="intext-locator"
                            type="text"
                            placeholder={locatorTypes[cit.label]?.placeholder || DEFAULT_LOCATOR.placeholder}
                            value={cit?.locator}
                            onChange={(event) => updateContentField(cit.id, "locator", event.target.value)}
                            className="flex-1"
                        />
                    </div>

                    <div className="flex w-full">
                        <TextField
                            label="Prefix"
                            name="intext-prefix"
                            type="text"
                            placeholder="See "
                            value={cit?.prefix}
                            onChange={(event) => updateContentField(cit.id, "prefix", event.target.value)}
                            className="flex-1"
                        />
                        <TextField
                            label="Suffix"
                            name="intext-suffix"
                            type="text"
                            placeholder=" (arguing that X is Y"
                            value={cit?.suffix}
                            onChange={(event) => updateContentField(cit.id, "suffix", event.target.value)}
                            className="flex-1"
                        />
                    </div>

                    <small>{locatorTypes[cit.label]?.def || DEFAULT_LOCATOR.def}</small>
                </div>
            ))}
        </div>
    );
}

export function ReferenceEntries(props) {
    const { openCitationForm } = props;
    const bibliography = useFindBib();
    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);
    const [references, setReferences] = useState([]);
    const MASTER_CHECKBOX_STATES = {
        CHECKED: "checked", // All reference entries are checked
        UNCHECKED: "unchecked", // All reference entries are unchecked
        INDETERMINATE: "indeterminate", // Some reference entries are checked
    };
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);
    const dispatch = useEnhancedDispatch();
    const formattedSelectedCitationsRef = useRef([]);
    const dialog = useDialog();

    useEffect(() => {
        function updateMasterCheckboxState() {
            let checkedCount = 0;
            bibliography?.citations.forEach((cit) => {
                if (cit?.isChecked) {
                    checkedCount += 1;
                }
            });

            if (checkedCount === bibliography?.citations.length) {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.CHECKED);
            } else if (checkedCount === 0) {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.UNCHECKED);
            } else {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.INDETERMINATE);
            }
        }
        updateMasterCheckboxState();
    }, [bibliography?.citations]);

    useEffect(() => {
        async function formatBibliography() {
            const formattedCitations = await citationEngine.formatBibliography(
                bibliography?.citations,
                bibliography?.style,
                "html",
                bibliography?.locale
            );
            setReferences(formattedCitations);
        }
        formatBibliography();
    }, [bibliography?.citations, bibliography?.style]);

    useEffect(() => {
        // Used for the handleDrag function because event.dataTransfer.setData("text/html", sanitizedInnerHTML) doesn't wait
        async function formatSelectedCitations() {
            const formattedCitations = await citationEngine.formatBibliography(
                checkedCitations,
                bibliography?.style,
                "html",
                bibliography?.locale
            );
            formattedSelectedCitationsRef.current = formattedCitations;
        }
        formatSelectedCitations();
    }, [checkedCitations, bibliography?.style]);

    function handleMasterCheck() {
        dispatch(handleMasterEntriesCheckbox({ bibliographyId: bibliography?.id }));
    }

    function handleEntryCheck(citationId) {
        dispatch(toggleEntryCheckbox({ bibliographyId: bibliography.id, citationId: citationId.id }));
    }

    function openIntextCitationDialog() {
        dialog.show({
            headline: "In-text citation",
            content: <IntextCitationDialog />,
            actions: [["Cancel", () => dialog.close()]],
        });
    }

    async function handleDrag(event) {
        const isCtrlKeyDown = event.ctrlKey;

        if (checkedCitations.length === 0) {
            if (isCtrlKeyDown) {
                const sanitizedInnerHTML = DOMPurify.sanitize(event.target.innerHTML);
                event.dataTransfer.setData("text/html", sanitizedInnerHTML);
            } else {
                event.dataTransfer.setData("text/plain", event.target.innerText);
            }
        } else {
            const div = document.createElement("div");
            formattedSelectedCitationsRef.current.forEach((cit) => {
                const parser = new DOMParser();
                const docFragment = parser.parseFromString(cit, "text/html");
                const element = docFragment.body.firstChild;
                div.appendChild(element);
                div.appendChild(document.createElement("br"));
            });

            if (isCtrlKeyDown) {
                const sanitizedInnerHTML = DOMPurify.sanitize(div.innerHTML);
                event.dataTransfer.setData("text/html", sanitizedInnerHTML);
            } else {
                event.dataTransfer.setData("text/plain", div.innerText);
            }

            div.remove();
        }
    }

    function editCitation(citation) {
        openCitationForm(
            citation,
            (newContent) =>
                dispatch(
                    updateCitation({
                        bibId: bibliography.id,
                        citation: {
                            ...citation,
                            content: {
                                ...citation.content,
                                ...newContent,
                            },
                        },
                    })
                ),
            {
                formTitle: "Edit reference",
                applyLabel: "Apply changes",
            }
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4 p-4">
                {bibliography?.citations.length !== 0 && (
                    <TextButton onClick={handleMasterCheck}>
                        <Checkbox
                            indeterminate={masterCheckboxState === MASTER_CHECKBOX_STATES.INDETERMINATE}
                            checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                            className="pointer-events-none me-2"
                        />
                        {masterCheckboxState !== MASTER_CHECKBOX_STATES.CHECKED ? "Select all" : " Deselect all"}
                    </TextButton>
                )}

                {checkedCitations?.length !== 0 && (
                    <OutlinedButton onClick={openIntextCitationDialog}>In-text citation</OutlinedButton>
                )}
            </div>

            {/* IMPORTANT: Entries need to be mapped by the references array because it gets sorted according to the CSL file rules, unlike the bibliography.citations array */}
            {(references?.length > 0 && (
                <List
                    items={references?.map((ref) => {
                        function getRefId() {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(ref, "text/html");
                            return doc.querySelector("[data-csl-entry-id]").getAttribute("data-csl-entry-id");
                        }
                        const citation = bibliography?.citations.find((cit) => cit?.id === getRefId());
                        const sanitizedReference = DOMPurify.sanitize(ref);

                        function getDirValue() {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(sanitizedReference, "text/html");
                            const dirElement = doc.querySelector("div[dir]");
                            return dirElement.getAttribute("dir");
                        }

                        function applyHangingIndentationStyle() {
                            if (/^(apa|modern-language-association|chicago)/.test(bibliography?.style.code)) {
                                return {
                                    paddingInlineStart: getDirValue() === "ltr" ? "1.5rem" : "",
                                    paddingInlineEnd: getDirValue() === "rtl" ? "1.5rem" : "",
                                    textIndent: "-1.5rem",
                                };
                            }
                            return {};
                        }

                        return {
                            start: (
                                <Checkbox
                                    checked={citation?.isChecked || false}
                                    onChange={() => handleEntryCheck(citation)}
                                />
                            ),
                            description: (
                                // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                                <div
                                    className="break-words font-cambo"
                                    onClick={() => editCitation(citation)}
                                    style={{ ...applyHangingIndentationStyle() }}
                                >
                                    {parseHtmlToJsx(sanitizedReference)}
                                </div>
                            ),
                            style: {
                                backgroundColor: citation?.isChecked ? "var(--md-sys-color-secondary-container)" : "",
                            },
                            draggable: true, // FIXME: Only works when dragged from the edge of the list item
                            onDragStart: handleDrag,
                        };
                    })}
                />
            )) || (
                <EmptyPage
                    icon="format_quote"
                    message="No References added to this bibliography. Click the button to add a citation based on the source type."
                />
            )}
        </div>
    );
}

/**
 * **TODO**:
 * - [ ] `Accept` button should be `Stop` when it's still processing.
 * - [ ] Checkboxes shouldn't be present until it processing identifiers.
 * - [ ] Add quick options directly in the `SmartGenerator` component such as `Copy` and `Move`.
 */
export function SmartGenerator({ input, setAcceptedCitations, openCitationForm }) {
    const bibliography = useFindBib();
    const [references, setReferences] = useState([]);
    const [inputArray, setInputArray] = useState(
        input.split(/\n+/).map((line) => [line.replace(/^(-|\*|\d+[.)-])?\s+/, "").trim(), uid()])
    );
    const [newCitations, setNewCitations] = useState([]);
    const totalIdentifiers = input.split(/\n+/).length;

    useEffect(() => {
        async function generateCitation() {
            let content;
            const identifier = inputArray[0][0];

            /* eslint-disable indent */
            const [identifierType, cleanedIdentifier] = citationUtils.recognizeIdentifierType(identifier);
            switch (identifierType) {
                case "URL":
                    content = await citationUtils.retrieveContentFromURL(cleanedIdentifier);
                    break;
                case "DOI":
                    content = await citationUtils.retrieveContentFromDOI(cleanedIdentifier);
                    break;
                case "PMCID":
                    content = await citationUtils.retrieveContentFromPMCID(cleanedIdentifier);
                    break;
                case "PMID":
                    content = await citationUtils.retrieveContentFromPMID(cleanedIdentifier);
                    break;
                case "ISBN":
                    content = await citationUtils.retrieveContentFromISBN(cleanedIdentifier);
                    break;
                default:
                    content = undefined;
            }
            /* eslint-enable indent */

            setNewCitations((prevNewCitations) => {
                const newCitation = {
                    id: inputArray[0][1],
                    content: content ? { ...content, id: inputArray[0][1] } : undefined,
                    isChecked: Boolean(content),
                    identifier: cleanedIdentifier,
                    identifierType,
                };
                const updatedCitations = prevNewCitations.filter((citation) => citation.id !== newCitation.id);
                return [...updatedCitations, newCitation];
            });

            setInputArray((prevInputArray) => prevInputArray.slice(1));

            return undefined;
        }

        if (inputArray.length > 0) {
            try {
                generateCitation();
            } catch (error) {
                console.error(error);
            }
        }
    }, [inputArray]);

    useEffect(() => {
        async function formatBibliography() {
            const formattedCitations = await citationEngine.formatBibliography(
                newCitations.filter((cit) => cit.content !== undefined),
                bibliography.style,
                "html",
                bibliography?.locale
            );
            setReferences(formattedCitations);
        }

        formatBibliography();
        setAcceptedCitations(newCitations.filter((cit) => cit?.isChecked));
    }, [newCitations]);

    function handleCheckboxOnChange(id) {
        setNewCitations((prevNewCitations) =>
            prevNewCitations.map((cit) => {
                if (cit.id === id) {
                    return { ...cit, isChecked: !cit.isChecked };
                }
                return cit;
            })
        );
    }

    return (
        <div className="relative">
            <div className="mb-4 flex justify-between px-4">
                <p className="m-0">Processing identifiers</p>
                <p className="m-0">{`${totalIdentifiers}/${totalIdentifiers - inputArray.length}`}</p>
            </div>
            <LinearProgress value={(totalIdentifiers - inputArray.length) / totalIdentifiers} />
            <div
                className="sticky top-0 z-10"
                style={{ backgroundColor: "var(--md-sys-color-surface-container-high)" }}
            >
                <div className="flex justify-start p-2">
                    <div className="p-2">
                        <Checkbox />
                    </div>
                    <IconButton name="content_copy" />
                    <IconButton name="open_with" /* move */ />
                    <IconButton name="ios_share" /* export */ />
                    <TextButton className="ml-auto">In-text citation</TextButton>
                </div>
                <Divider />
            </div>
            <List
                items={newCitations.map((cit) => {
                    function getRefId(ref) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(ref, "text/html");
                        return doc.querySelector("[data-csl-entry-id]").getAttribute("data-csl-entry-id");
                    }

                    const reference = references.find((ref) => getRefId(ref) === cit.id);

                    // Show the identifier the failed identifer
                    if (!reference) {
                        const errorMessage =
                            cit.identifierType === "undefined"
                                ? `Unable to determine the type of the identifier: "${cit.identifier}". Please check if the identifier is valid or properly formatted.`
                                : `No content found for the identifier: "${cit.identifier}". Verify the identifier or try a different one.`;

                        return {
                            description: (
                                <div style={{ color: "var(--md-sys-color-error)" }} className="font-bold">
                                    {errorMessage}
                                </div>
                            ),
                            start: <Icon name="error" style={{ color: "var(--md-sys-color-error)" }} />,
                            end: <code>{cit.identifierType}</code>,
                        };
                    }

                    // show the successful identifier
                    const sanitizedReference = DOMPurify.sanitize(reference);

                    function getDirValue() {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(sanitizedReference, "text/html");
                        const dirElement = doc.querySelector("div[dir]");
                        return dirElement.getAttribute("dir");
                    }

                    const hangingIndentationStyle = {
                        paddingInlineStart: getDirValue() === "ltr" ? "1.5rem" : "",
                        paddingInlineEnd: getDirValue() === "rtl" ? "1.5rem" : "",
                        textIndent: "-1.5rem",
                    };

                    function updateContent(id, newContent) {
                        setNewCitations((prevNewCitations) => {
                            return prevNewCitations.map((nCit) => {
                                if (nCit.id === id) {
                                    return {
                                        ...nCit,
                                        content: {
                                            ...nCit.content,
                                            ...newContent,
                                        },
                                    };
                                }
                                return nCit;
                            });
                        });
                    }

                    return {
                        /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                        description: (
                            <div
                                className="break-words font-cambo"
                                style={
                                    /^(apa|modern-language-association|chicago)/.test(bibliography?.style.code)
                                        ? hangingIndentationStyle
                                        : {}
                                }
                                onClick={() =>
                                    openCitationForm(cit, (newContent) => updateContent(cit.content.id, newContent), {
                                        formTitle: "Edit reference",
                                        applyLabel: "Apply changes",
                                    })
                                }
                            >
                                {parseHtmlToJsx(sanitizedReference)}
                            </div>
                        ),
                        start:
                            inputArray.length === 0 ? (
                                <Checkbox checked={cit.isChecked} onChange={() => handleCheckboxOnChange(cit.id)} />
                            ) : (
                                ""
                            ),
                        end: <code>{cit.identifierType}</code>,
                        /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                    };
                })}
            />
        </div>
    );
}

export function AddCitationMenu({ openCitationForm, close }) {
    const bibliography = useFindBib();
    const identifiersInputRef = useRef();
    const isOnline = useOnlineStatus();
    const toast = useToast();
    const dialog = useDialog();
    const dispatch = useEnhancedDispatch();
    const acceptedCitationsRef = useRef([]);
    const [errorMessage, setErrorMessage] = useState();

    function handleAcceptCitations() {
        dispatch(
            updateBibField({
                bibId: bibliography.id,
                key: "citations",
                value: [...bibliography.citations, ...acceptedCitationsRef.current],
            })
        );
    }

    function startSmartGenerator(input) {
        setErrorMessage();

        if (!isOnline) {
            setErrorMessage("You are offline.");
            return;
        }

        if (/^\s*$/.test(input)) {
            setErrorMessage("You can't generate citations with empty strings.");
            return;
        }

        close();

        const id = uid();
        dialog.show({
            id,
            headline: "Smart generator",
            content: (
                <SmartGenerator
                    input={input.trim()}
                    setAcceptedCitations={(citations) => {
                        acceptedCitationsRef.current = citations;
                    }}
                    openCitationForm={openCitationForm}
                />
            ),
            actions: [
                ["Cancel", () => dialog.close()],
                ["Accept", handleAcceptCitations],
            ],
        });
    }

    function handleImportCitation() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return undefined;
        }
        return undefined;
    }

    function handleSearchByTitle() {
        if (!isOnline) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return undefined;
        }
        return undefined;
    }

    function showSourceTypes() {
        close();
        const id = uid();
        dialog.show({
            id,
            headline: "Choose the type of your source",
            content: (
                <List
                    items={Object.keys(sourceTypes).map((key) => ({
                        title: sourceTypes[key].label,
                        onClick: () => {
                            dialog.close(id);
                            const newId = uid();
                            const newCitation = {
                                id: newId,
                                content: { id: newId, type: key, author: [{ given: "", family: "" }] },
                                isChecked: false,
                            };
                            openCitationForm(newCitation, (newContent) =>
                                dispatch(
                                    updateCitation({
                                        bibId: newId,
                                        citation: {
                                            ...newCitation,
                                            content: {
                                                ...newCitation.content,
                                                ...newContent,
                                            },
                                        },
                                    })
                                )
                            );
                        },
                    }))}
                />
            ),
            actions: [["Cancel", () => dialog.close()]],
        });
    }

    return (
        <div className="px-4">
            <form onSubmit={(event) => event.preventDefault()}>
                <TextField
                    error={Boolean(errorMessage)}
                    errorText={errorMessage}
                    className="mb-2 w-full"
                    onChange={() => setErrorMessage()}
                    label="Search by unique identifiers"
                    placeholder={`https://example.com\nhttps://doi.org/xxxx\nPMID: 12345678`} // eslint-disable-line quotes
                    supportingText="You can list all the identifiers at the same time."
                    rows="3"
                    type="textarea"
                    ref={identifiersInputRef}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                            startSmartGenerator(identifiersInputRef.current.value);
                        }
                    }}
                />

                <FilledButton className="w-full" onClick={() => startSmartGenerator(identifiersInputRef.current.value)}>
                    Generate citations
                </FilledButton>
            </form>

            <Divider className="my-4" />

            <TextButton className="mb-1 w-full" onClick={handleImportCitation}>
                Search by title
            </TextButton>

            <TextButton className="mb-1 w-full" onClick={showSourceTypes}>
                Create citation by source type
            </TextButton>

            <TextButton className="w-full" onClick={handleSearchByTitle}>
                Import from file
            </TextButton>
        </div>
    );
}

export function MoveDialog({ setReceiverBibs }) {
    const bibliographies = useSelector((state) => state.bibliographies.data);
    const { theme, tags } = useSelector((state) => state.settings.data);
    const bibliography = useFindBib();
    const [selectedBibIds, setSelectedBibIds] = useState([]);

    useEffect(() => {
        setReceiverBibs(selectedBibIds);
    }, [selectedBibIds]);

    function handleSelect(bibId) {
        const index = selectedBibIds.indexOf(bibId);
        if (index !== -1) {
            setSelectedBibIds((prevSelectedBibIds) => prevSelectedBibIds.filter((id) => id !== bibId));
        } else {
            setSelectedBibIds((prevSelectedBibIds) => [...prevSelectedBibIds, bibId]);
        }
    }

    return (
        <List
            items={bibliographies.map((bib) => {
                if (bib.id !== bibliography.id) {
                    const bibTags = tags.filter((tag) => bib.tags.includes(tag.id));
                    const defaultIcon = defaults.bibliography.icon;
                    return {
                        start: (
                            <Icon
                                style={{
                                    background: hslToHsla(
                                        colorValues[theme][bib?.icon?.color || defaultIcon.color],
                                        0.25
                                    ),
                                }}
                                className="rounded-full p-5"
                                name={bib?.icon?.name || defaultIcon.name}
                            />
                        ),
                        title: (
                            <div className="flex items-baseline justify-between">
                                <div className="flex items-baseline gap-1 font-semibold">
                                    {bib.title}
                                    <small className="font-normal">{bib.citations.length}</small>
                                </div>
                                <small>{timeAgo(bib.dateModified)}</small>
                            </div>
                        ),
                        description: (
                            <div className="flex items-center justify-between">
                                <div>{bib.style.name.short || bib.style.name.long.replace(/\((.*?)\)/g, "")}</div>
                                <button type="button" className="h-6 w-6 cursor-pointer border-none bg-transparent p-0">
                                    {bib?.favorite ? <FilledStar /> : <EmptyStar />}
                                </button>
                            </div>
                        ),
                        content: bibTags && bibTags.length !== 0 && (
                            <ChipSet
                                chips={bibTags.map((tag) => {
                                    return {
                                        ...tag,
                                        selected: true,
                                    };
                                })}
                            />
                        ),
                        onClick: () => handleSelect(bib.id),
                        style: {
                            backgroundColor: selectedBibIds.includes(bib.id)
                                ? "var(--md-sys-color-secondary-container)"
                                : "",
                        },
                    };
                }
                return null;
            })}
        />
    );
}

// TODO: Include the most used styles in the styles.json, and the rest should be downloaded when needed only.
//       Then the package "react-window" can be safely removed because this is the only component that uses it.
export function CitationStylesMenu(props) {
    const { setCitationStyleMenuVisible: setIsVisible, onStyleSelected } = props;
    const [styles, setStyles] = useState(citationStyles);
    const [searchTerm, setSearchTerm] = useState("");

    const MOST_POPULAR_STYLES_LABEL = "Most popular styles";
    const OTHER_STYLES_LABEL = "Other styles";

    useEffect(() => {
        function fetchStyles() {
            const updatedStyles = [OTHER_STYLES_LABEL, ...styles];
            const sortedStyles = updatedStyles.sort((a, b) => {
                if (mostPopularStyles.includes(b?.code)) return 1;
                if (mostPopularStyles.includes(a?.code)) return -1;
                return 0;
            });

            setStyles([MOST_POPULAR_STYLES_LABEL, ...sortedStyles]);
        }
        fetchStyles();
    }, []);

    const filteredStyles = styles?.filter((style) => {
        function testStrings(stringsArray) {
            let found = false;
            for (let i = 0; i < stringsArray.length; i += 1) {
                if (
                    // eg., "chicago manual of style 17th edition" => Chicago Manual of Style 17th edition
                    stringsArray[i]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    // eg., "cmos17e" || "c m o s 1 7 e" => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            return sect[0];
                        })
                        .join("")
                        .includes(searchTerm.toLowerCase().replace(/\s+/g, "")) ||
                    // eg., "cms17e" || "c m s 1 7 e" => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .replace(/\b(of|and|in|on|at|the|from|to|with|by|for|\(|\))\b/gi, "")
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            return sect[0];
                        })
                        .join("")
                        .includes(searchTerm.toLowerCase().replace(/\s+/g, ""))
                ) {
                    found = true;
                    break;
                }
            }
            return found;
        }

        if (style === MOST_POPULAR_STYLES_LABEL || style === OTHER_STYLES_LABEL) return true;
        if (searchTerm) return testStrings([style?.name?.long, style?.name?.short, style?.code]);
        return true;
    });

    return (
        <div className="citation-styles-menu">
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>

            <search>
                <form>
                    <TextField
                        label="Search for citation styles"
                        type="search"
                        name="citation-style-search-input"
                        placeholder="Find style by name..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </form>
            </search>

            <FixedSizeList height={500} itemCount={filteredStyles.length} itemSize={45} width={300}>
                {({ index, style }) => {
                    const targetStyle = filteredStyles[index];
                    if (/other styles|most popular/i.test(targetStyle)) {
                        return <h3 style={style}>{targetStyle}</h3>;
                    }
                    return (
                        <button
                            type="button"
                            style={style}
                            onClick={() => {
                                onStyleSelected(targetStyle);
                                setIsVisible(false);
                            }}
                        >
                            {targetStyle.name.long}
                        </button>
                    );
                }}
            </FixedSizeList>
            <small>
                <b>Note:</b> Some less common citation styles may have formatting issues. If you encounter any problems,
                please report them by opening an issue on the{" "}
                <a href="https://github.com/citation-style-language/styles/issues">CSL GitHub repository</a> or contact
                us at<a href="mailto:discontinuedlabs@gmail.com">discontinuedlabs@gmail.com</a>.
            </small>
        </div>
    );
}

export function IconsDialog({ setIconObject }) {
    const bibliography = useFindBib();
    const { data: settings } = useSelector((state) => state.settings);
    const { icons } = settings;
    const defaultIcon = defaults.bibliography.icon;
    const [selectedIcon, setSelectedIcon] = useState(bibliography?.icon?.name || defaultIcon.name);
    const [selectedColor, setSelectedColor] = useState(bibliography?.icon?.color || defaultIcon.color);
    const [theme] = useTheme();

    useEffect(() => {
        setIconObject({ name: selectedIcon, color: selectedColor });
    }, [selectedColor, selectedIcon]);

    return (
        <div className="grid gap-2 px-5">
            <div className="flex items-center justify-start gap-2">
                <Icon
                    style={{
                        background: hslToHsla(colorValues[theme][selectedColor], 0.25),
                    }}
                    className="rounded-full p-5"
                    name={selectedIcon}
                />
                <h2>{bibliography.title}</h2>
            </div>

            <h4 className="mb-1">Icons</h4>
            <div className="flex flex-wrap justify-stretch gap-1">
                {icons.map((icon) => {
                    const style = {
                        background: "var(--md-sys-color-on-surface)",
                    };
                    const iconStyle = {
                        color: "var(--md-sys-color-surface)",
                    };
                    return (
                        <IconButton
                            className="rounded-full transition-colors"
                            style={selectedIcon === icon ? style : {}}
                            key={uid()}
                            name={icon}
                            onClick={() => setSelectedIcon(icon)}
                            iconStyle={selectedIcon === icon ? iconStyle : {}}
                        />
                    );
                })}
            </div>

            <h4 className="mb-1">Colors</h4>
            <ChipSet
                className="pb-5"
                chips={Object.keys(colorValues[theme]).map((color) => {
                    return {
                        label: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
                        color,
                        selected: selectedColor === color,
                        onClick: () => setSelectedColor(color),
                    };
                })}
            />
        </div>
    );
}

export function TagsDialog({ setSelectedTags: setParentTags }) {
    const bibliography = useFindBib();
    const { data: settings } = useSelector((state) => state.settings);
    const [selectedTags, setSelectedTags] = useState(bibliography.tags);

    useEffect(() => {
        setParentTags(selectedTags);
    }, [selectedTags]);

    return (
        <div className="grid gap-5 px-5">
            <div>
                <h4 className="mt-0">Selected tags</h4>
                <ChipSet
                    chips={selectedTags.map((tagId) => {
                        const targetTag = settings.tags?.find((tag) => tag.id === tagId);
                        return {
                            ...targetTag,
                            end: <Icon className="max-h-min max-w-min text-sm" name="close" />,
                            selected: true,
                            onClick: () => {
                                setSelectedTags((prevTags) => prevTags.filter((tag) => tag !== tagId));
                            },
                        };
                    })}
                />
            </div>

            <div>
                <h4 className="mt-0">Available tags</h4>
                <ChipSet
                    chips={settings.tags?.map((tag) => {
                        if (!selectedTags.includes(tag.id)) {
                            return {
                                ...tag,
                                selected: true,
                                onClick: () => setSelectedTags((prevTags) => [...prevTags, tag.id]),
                            };
                        }
                        return undefined;
                    })}
                />
            </div>
        </div>
    );
}

export function IdAndPasswordDialogVisible(props) {
    const { setIsVisible, onSubmit } = props;
    const [error, setError] = useState(null);
    const idRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const id = useId();

    function handleSubmit(event) {
        event.preventDefault();

        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
            setError("Password do not match");
        } else {
            const data = new FormData(event.target);
            onSubmit(Object.fromEntries(data.entries()));
            setIsVisible(false);
        }
    }

    return (
        <div>
            <h3>Open collaboration</h3>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <p>Choose a unique identifer and a password for you collaborative bibliography.</p>
            <pre>{error}</pre>
            <form onSubmit={handleSubmit}>
                <label htmlFor={`${id}-id`}>
                    Unique identifer
                    <input autoComplete="off" ref={idRef} type="text" id={`${id}-id`} name="id" required />
                </label>
                <label htmlFor={`${id}-password`}>
                    Password
                    <input
                        autoComplete="off"
                        ref={passwordRef}
                        type="password"
                        id={`${id}-password`}
                        name="password"
                        required
                    />
                </label>

                <label htmlFor={`${id}-confirmPassword`}>
                    Confirm password
                    <input
                        autoComplete="off"
                        ref={confirmPasswordRef}
                        type="password"
                        id={`${id}-confirmPassword`}
                        name="confirmPassword"
                        required
                    />
                </label>

                <button type="submit">Open collaboration</button>
            </form>
        </div>
    );
}
