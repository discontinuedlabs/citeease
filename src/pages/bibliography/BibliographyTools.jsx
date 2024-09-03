import { useEffect, useId, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "../../utils/purify";
import locatorTypes from "../../assets/json/locatorOptions.json";
import * as citationEngine from "../../utils/citationEngine";
import sourceTypes from "../../assets/json/sourceTypes.json";
import {
    addCitationsToBib,
    copySelectedCitations,
    handleMasterEntriesCheckbox,
    moveSelectedCitations,
    toggleEntryCheckbox,
    updateCitation,
    updateContentInEditedCitation,
} from "../../data/store/slices/bibsSlice";
import BibliographyCard from "../../components/ui/BibliographyCard";
import ContextMenu from "../../components/ui/ContextMenu";
import * as citationUtils from "../../utils/citationUtils.ts";
import useOnlineStatus, { useEnhancedDispatch, useFindBib } from "../../hooks/hooks.tsx";
import Tag from "../../components/ui/Tag";
import citationStyles from "../../assets/json/styles.json";
import mostPopularStyles from "../../assets/json/mostPopularStyles.json";
import { uid } from "../../utils/utils.ts";
import { parseHtmlToJsx } from "../../utils/conversionUtils.tsx";
import { Checkbox, EmptyPage, IconButton, List, TextButton } from "../../components/ui/MaterialComponents";

// Source types
import ArticleJournal from "../../components/sourceTypes/ArticleJournal";
import Webpage from "../../components/sourceTypes/Webpage";
import Book from "../../components/sourceTypes/Book";
import { useToast } from "../../context/ToastContext.tsx";
import { useDialog } from "../../context/DialogContext.tsx";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

const DEFAULT_LOCATOR = locatorTypes.page;

export function ReferenceEntries(props) {
    const { openCitationForm, openIntextCitationDialog } = props;
    const bibliography = useFindBib();
    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);
    const [references, setReferences] = useState([]);
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);
    const dispatch = useDispatch();
    const formattedSelectedCitationsRef = useRef([]);

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

    return (
        <div>
            <div className="flex items-center justify-between gap-4 p-4">
                {bibliography?.citations.length !== 0 && (
                    <Checkbox
                        indeterminate={masterCheckboxState === MASTER_CHECKBOX_STATES.INDETERMINATE}
                        checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                        onChange={handleMasterCheck}
                    />
                )}

                {checkedCitations?.length !== 0 && (
                    <TextButton onClick={openIntextCitationDialog}>In-text citation</TextButton>
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

                        const hangingIndentationStyle = {
                            paddingInlineStart: getDirValue() === "ltr" ? "1.5rem" : "",
                            paddingInlineEnd: getDirValue() === "rtl" ? "1.5rem" : "",
                            textIndent: "-1.5rem",
                        };

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
                                    onClick={() => openCitationForm(citation?.content.type, false, citation?.id)}
                                    style={
                                        /^(apa|modern-language-association|chicago)/.test(bibliography?.style.code)
                                            ? hangingIndentationStyle
                                            : {}
                                    }
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

export function IntextCitationDialog(props) {
    const { setIntextCitationDialogVisible: setIsVisible } = props;
    const bibliography = useFindBib();
    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);
    const [intextCitation, setIntextCitation] = useState("");
    const [citationsForIntext, setCitationsForIntext] = useState(checkedCitations.map((cit) => cit.content));

    useEffect(() => {
        async function formatIntextCitation() {
            const formattedIntextCitation = await citationEngine.formatIntextCitation(
                citationsForIntext,
                bibliography?.style,
                "html",
                bibliography?.locale
            );
            setIntextCitation(DOMPurify.sanitize(formattedIntextCitation));
        }
        formatIntextCitation();
    }, [citationsForIntext, bibliography?.style]);

    function updateContentField(citId, key, value) {
        setCitationsForIntext((prevCitationsForIntext) =>
            prevCitationsForIntext.map((content) => {
                if (content.id === citId) {
                    return {
                        ...content,
                        [key]: value,
                    };
                }
                return content;
            })
        );
    }

    return (
        <div>
            <div className="font-cambo">{parseHtmlToJsx(intextCitation)}</div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            {citationsForIntext.map((cit) => (
                <div key={uid()}>
                    <div>{cit.title || `${cit.author[0].family} ${cit.issued["date-parts"].join(" ")}`}</div>

                    <select
                        value={cit?.label || DEFAULT_LOCATOR.code}
                        onChange={(event) => updateContentField(cit.id, "label", locatorTypes[event.target.value].code)}
                    >
                        {Object.values(locatorTypes).map((option) => (
                            <option key={uid()} value={option.code}>
                                {option.name}
                            </option>
                        ))}
                    </select>

                    <input
                        name="intext-locator"
                        type="text"
                        placeholder={locatorTypes[cit.label]?.placeholder || DEFAULT_LOCATOR.placeholder}
                        value={citationsForIntext?.locator}
                        onChange={(event) => updateContentField(cit.id, "locator", event.target.value)}
                    />
                    <small>{locatorTypes[cit.label]?.def || DEFAULT_LOCATOR.def}</small>
                </div>
            ))}
        </div>
    );
}

// FIXME: Handle errors. It should't cut the for loop when something returns an error
export function SmartGenerator({ input, setAcceptedCitations }) {
    const bibliography = useFindBib();
    const [references, setReferences] = useState([]);
    const [inputArray, setInputArray] = useState(input.split(/\n+/));
    const [newCitations, setNewCitations] = useState([]);

    useEffect(() => {
        async function generateCitation() {
            let content;
            const identifier = inputArray[0];

            /* eslint-disable indent */
            switch (citationUtils.recognizeIdentifierType(identifier)) {
                case "url":
                    content = await citationUtils.retrieveContentFromURL(identifier);
                    break;
                case "doi":
                    content = await citationUtils.retrieveContentFromDOI(identifier);
                    break;
                case "pmcid":
                    content = await citationUtils.retrieveContentFromPMCID(identifier);
                    break;
                case "pmid":
                    content = await citationUtils.retrieveContentFromPMID(identifier);
                    break;
                case "isbn":
                    content = await citationUtils.retrieveContentFromISBN(identifier);
                    break;
                default:
                    return null;
            }
            /* eslint-enable indent */

            if (content) {
                setInputArray((prevInputArray) => prevInputArray.slice(1));
                const newId = uid();
                setNewCitations((prevNewCitations) => [
                    ...prevNewCitations,
                    { id: newId, content: { ...content, id: newId }, isChecked: true },
                ]);
            } else {
                console.error(`Couldn't find the content of the identifier ${identifier}`);
            }

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
                newCitations,
                bibliography.style,
                "html",
                bibliography?.locale
            );
            setReferences(formattedCitations);
        }
        formatBibliography();
        setAcceptedCitations(newCitations.filter((cit) => cit.isChecked));
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
        <List
            items={references?.map((ref) => {
                const sanitizedReference = DOMPurify.sanitize(ref);

                function getRefId() {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(ref, "text/html");
                    return doc.querySelector("[data-csl-entry-id]").getAttribute("data-csl-entry-id");
                }

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

                return {
                    description: (
                        <div
                            className="break-words font-cambo"
                            style={
                                /^(apa|modern-language-association|chicago)/.test(bibliography?.style.code)
                                    ? hangingIndentationStyle
                                    : {}
                            }
                        >
                            {parseHtmlToJsx(sanitizedReference)}
                        </div>
                    ),
                    start: (
                        <Checkbox
                            checked={newCitations.find((cit) => cit.id === getRefId()).isChecked}
                            onChange={() => handleCheckboxOnChange(getRefId())}
                        />
                    ),
                };
            })}
        />
    );
}

export function AddCitationMenu({ openCitationForm, close }) {
    const bibliography = useFindBib();
    const identifierRef = useRef();
    const isOnline = useOnlineStatus();
    const toast = useToast();
    const dialog = useDialog();
    const dispatch = useEnhancedDispatch();
    const acceptedCitationsRef = useRef([]);

    function handleAcceptCitations() {
        console.warn(acceptedCitationsRef.current); // This will now log the latest state
        dispatch(addCitationsToBib({ bibId: bibliography.id, citations: acceptedCitationsRef.current }));
    }

    function startSmartGenerator(input) {
        if (!isOnline) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        dialog.show({
            headline: "Smart generator",
            content: (
                <SmartGenerator
                    input={input}
                    setAcceptedCitations={(citations) => {
                        acceptedCitationsRef.current = citations;
                    }}
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

    return (
        <div className="p-4">
            <div>
                <small>Experimental</small>
                <label htmlFor="search-by-identifiers">
                    Search by URL, DOI, ISBN, or PubMed and PMC identifiers:
                    <textarea
                        ref={identifierRef}
                        name="search-by-identifiers"
                        placeholder="Search by unique identifiers..."
                    />
                </label>

                <small>You can list all the identifiers at the same time.</small>
                <button
                    type="button"
                    onClick={() => {
                        close();
                        startSmartGenerator(identifierRef.current.value);
                    }}
                >
                    Generate citations
                </button>
            </div>

            {/* <search>
                <input type="text" name="search-by-title" placeholder="Search by title..." />
                <button type="button" onClick={handleSearchByTitle}>
                    Search
                </button>
            </search> */}

            <button type="button" onClick={handleImportCitation}>
                Import citation
            </button>

            <ContextMenu
                options={Object.values(sourceTypes).map((entry) => [
                    entry.label,
                    () => openCitationForm(entry.code, true),
                ])}
                direction="up"
            >
                Choose source type
            </ContextMenu>
        </div>
    );
}

export function CitationForm(props) {
    const { setCitationFormVisible: setIsVisible } = props;
    const bibliography = useFindBib();
    const [content, setContent] = useState(bibliography?.editedCitation?.content || {});
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(updateContentInEditedCitation({ bibliographyId: bibliography.id, content }));
    }, [content]);

    function handleAddReference(event) {
        event.preventDefault();
        dispatch(updateCitation({ bibliographyId: bibliography.id, editedCitation: bibliography?.editedCitation }));
        setIsVisible(false);
    }

    function handleCancel() {
        setIsVisible(false);
    }

    const citationControlProps = {
        content,
        setContent,
        handleAddReference,
        handleCancel,
    };

    const CITATION_COMPONENTS = {
        [sourceTypes.articleJournal.code]: ArticleJournal(citationControlProps),
        [sourceTypes.book.code]: Book(citationControlProps),
        [sourceTypes.webpage.code]: Webpage(citationControlProps),
    };

    return <div className="citation-window">{CITATION_COMPONENTS[content.type]}</div>;
}

export function MoveDialog(props) {
    const { setMoveWindowVisible: setIsVisible } = props;
    const bibliographies = useSelector((state) => state.bibliographies.data);
    const bibliography = useFindBib();
    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);
    const [selectedBibliographyIds, setSelectedBibliographyIds] = useState([]);
    const dispatch = useDispatch();
    const isOnline = useOnlineStatus();
    const toast = useToast();

    function handleSelect(bibId) {
        const index = selectedBibliographyIds.indexOf(bibId);
        if (index !== -1) {
            setSelectedBibliographyIds((prevSelectedBibliographyIds) =>
                prevSelectedBibliographyIds.filter((id) => id !== bibId)
            );
        } else {
            setSelectedBibliographyIds((prevSelectedBibliographyIds) => [...prevSelectedBibliographyIds, bibId]);
        }
    }

    function handleMove(toId) {
        if (!isOnline && bibliographies.find((bib) => bib.id === toId)?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        dispatch(
            moveSelectedCitations({
                fromId: bibliography.id,
                toId,
                checkedCitations,
            })
        );
        setIsVisible(false);
        setSelectedBibliographyIds([]);
    }

    function handleCopy() {
        dispatch(
            copySelectedCitations({
                toIds: selectedBibliographyIds,
                checkedCitations,
            })
        );
        setIsVisible(false);
        setSelectedBibliographyIds([]);
    }

    return (
        <div className="move-window">
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            {bibliographies.map((bib) => {
                if (bib.id !== bibliography.id) {
                    /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
                    return (
                        <div onClick={() => handleSelect(bib.id)}>
                            <BibliographyCard
                                bibliography={bib}
                                styles={{ backgroundColor: bib.id in selectedBibliographyIds ? "red" : "unset" }}
                            />
                        </div>
                    );
                }
                return null;
            })}
            <button
                type="button"
                disabled={selectedBibliographyIds.length !== 1}
                onClick={() => handleMove(selectedBibliographyIds[0])}
            >
                Move
            </button>
            <button type="button" disabled={selectedBibliographyIds.length === 0} onClick={handleCopy}>
                Copy
            </button>
        </div>
    );
}

export function RenameDialog(props) {
    const { title: pTitle } = props;
    const { handleRename, setRenameWindowVisible: setIsVisible } = props;
    const [title, setTitle] = useState(pTitle);

    function handleSubmit() {
        setIsVisible(false);
        handleRename(title);
    }

    return (
        <div className="rename-window">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Untitled Bibliography"
                    value={title}
                    name="title-input"
                />
                <button type="submit">Rename</button>
                <button type="button" onClick={() => setIsVisible(false)}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

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
                    <input
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

export function IconsMenu({ onSubmit, setIsVisible }) {
    const { icons } = useSelector((state) => state.settings);

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <h3>Icons Menu</h3>
            <div>
                {icons.map((icon) => {
                    return (
                        <IconButton
                            key={uid()}
                            name={icon}
                            onClick={() => {
                                onSubmit(icon);
                                setIsVisible(false);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function TagsDialog(props) {
    const { setTagsDialogVisible: setIsVisible, onTagAdded, onTagRemoved } = props;
    const bibliography = useFindBib();
    const settings = useSelector((state) => state.settings);
    // TODO: The bibliography.tags array should only store tag IDs

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <h3>Tags</h3>
            <div className="flex flex-wrap gap-1">
                {bibliography?.tags?.map((tag) => (
                    <Tag key={uid()} tagProps={tag} onClick={onTagRemoved} showX />
                ))}
            </div>

            <div className="flex flex-wrap gap-1">
                {settings.tags
                    ?.filter((tag) => !bibliography?.tags?.some((bibTag) => bibTag.id === tag.id))
                    .map((tag) => (
                        <Tag key={uid()} tagProps={tag} onClick={onTagAdded} />
                    ))}
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
