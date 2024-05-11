import { useEffect, useState } from "react";
import * as citationEngine from "./citationEngine";
import "../css/BibliographyTools.css";
import { useParams } from "react-router-dom";
import { SOURCE_TYPES } from "./Bibliography";
import { ACTIONS } from "./reducers/bibliographiesReducer";
import BibliographyCard from "./ui/BibliographyCard";
import ContextMenu from "./ui/ContextMenu";
import DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser/lib/index";

// Source types
import ArticleJournal from "./sourceTypes/ArticleJournal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

export function ReferenceEntries(props) {
    const { bibliography, dispatch, ACTIONS, savedCslFiles, setSavedCslFiles, openCitationWindow } = props;
    const [references, setReferences] = useState([]);
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);

    useEffect(() => {
        function updateMasterCheckboxState() {
            let checkedCount = 0;
            bibliography?.citations.forEach((cit) => {
                if (cit.isChecked) {
                    checkedCount++;
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
        async function formatCitations() {
            const formattedCitations = await citationEngine.formatCitations(
                bibliography?.citations,
                bibliography?.style,
                savedCslFiles,
                setSavedCslFiles
            );
            setReferences(formattedCitations);
        }
        formatCitations();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bibliography?.citations, bibliography?.style, savedCslFiles]); // Adding setSavedCslFiles to the dependency array will cause the component to rerender infinitely

    function handleMasterCheck() {
        dispatch({
            type: ACTIONS.HANDLE_MASTER_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliography?.id },
        });
    }

    function handleReferenceEntryCheck(citationId) {
        dispatch({
            type: ACTIONS.TOGGLE_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliography.id, citationId: citationId },
        });
    }

    return (
        <div className="reference-entries-component">
            <div className="reference-entries-header">
                {bibliography?.citations.length !== 0 && (
                    <input
                        type="checkbox"
                        className="master-checkbox"
                        checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                        onChange={handleMasterCheck}
                    />
                )}
            </div>

            <div className="reference-entries-container">
                {bibliography?.citations.map((cit, index) => {
                    return (
                        <div className="reference-entry" key={cit.id}>
                            <input
                                type="checkbox"
                                className="reference-entry-checkbox"
                                checked={cit.isChecked}
                                onChange={() => handleReferenceEntryCheck(cit.id)}
                            />

                            <div
                                className={`reference-entry-text ${
                                    /^(apa|modern-language-association|chicago)$/i.test(bibliography?.style.code)
                                        ? "hanging-indentation"
                                        : ""
                                }`}
                                onClick={() => openCitationWindow(cit.content.type, false, cit.id)}
                            >
                                {HTMLReactParser(DOMPurify.sanitize(references?.[index]))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function AddCitationMenu(props) {
    const { setAddCitationMenuVisible, openCitationWindow, searchByIdentifier, handleImportCitation } = props;

    return (
        <div
            style={{ position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}
            className="add-citation-menu"
        >
            <h3>Add citation</h3>
            <button onClick={() => setAddCitationMenuVisible(false)}>X</button>
            <div>
                <input type="text" name="search-by-identifier" placeholder="Search by title, URL, DOI, or ISBN"></input>
                <button onClick={searchByIdentifier}>Search</button>
            </div>
            <button onClick={handleImportCitation}>Import citation</button>
            <ContextMenu
                label="Choose source type"
                options={Object.values(SOURCE_TYPES).map((entry) => {
                    return {
                        label: entry.label,
                        method: () => openCitationWindow(entry.code, true),
                    };
                })}
                menuStyle={{ position: "fixed", bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
            />
        </div>
    );
}

export function CitationWindow(props) {
    const { bibId: bibliographyId } = useParams();
    const { bibliographies, dispatch, ACTIONS, setCitationWindowVisible, showAcceptDialog } = props;
    const bibliography = bibliographyId ? bibliographies.find((bib) => bib.id === bibliographyId) : undefined;
    const editedCitation = bibliography?.editedCitation;
    const [content, setContent] = useState(editedCitation ? editedCitation.content : {});

    const citationControlProps = {
        content,
        setContent,
        showAcceptDialog,
        handleAddReference,
        handleCancel,
    };

    const CITATION_COMPONENTS = {
        [SOURCE_TYPES.ARTICLE_JOURNAL.code]: ArticleJournal(citationControlProps),
        [SOURCE_TYPES.BOOK.code]: Book(citationControlProps),
        [SOURCE_TYPES.WEBPAGE.code]: Webpage(citationControlProps),
    };

    useEffect(() => {
        function updateContentInEditedCitation() {
            dispatch({
                type: ACTIONS.UPDATE_CONTENT_IN_EDITED_CITATION,
                payload: { bibliographyId: bibliographyId, content: content },
            });
        }
        updateContentInEditedCitation();
    }, [content]);

    function handleAddReference(event) {
        event.preventDefault();
        dispatch({
            type: ACTIONS.UPDATE_CITATION_IN_BIBLIOGRAPHY,
            payload: { bibliographyId: bibliographyId, editedCitation: editedCitation },
        });
        setCitationWindowVisible(false);
    }

    function handleCancel() {
        setCitationWindowVisible(false);
    }

    return <div className="citation-window">{CITATION_COMPONENTS[content.type]}</div>;
}

export function LaTeXWindow(props) {
    const { citations, checkedCitations, setLaTeXWindowVisible, applyOnAll } = props;
    const [bibtexString, setBibtexString] = useState("");
    const [biblatexString, setBiblatexString] = useState("");
    const [bibTxtString, setBibTxtString] = useState("");
    const [displayedLatex, setDisplayedLatex] = useState(bibtexString);

    useEffect(() => {
        async function formatLaTeX() {
            setBibtexString(await citationEngine.formatLaTeX(applyOnAll ? citations : checkedCitations, "bibtex"));
            setBiblatexString(await citationEngine.formatLaTeX(applyOnAll ? citations : checkedCitations, "biblatex"));
            setBibTxtString(await citationEngine.formatLaTeX(applyOnAll ? citations : checkedCitations, "bibtxt"));
        }
        formatLaTeX();
    }, [checkedCitations]);

    return (
        <div className="latex-window-overlay">
            <div className="latex-window">
                <div className="latex-window-header">
                    <div className="tabs-flex">
                        <button onClick={() => setDisplayedLatex(bibtexString)}>BibTex</button>
                        <button onClick={() => setDisplayedLatex(biblatexString)}>BibLaTeX</button>
                        <button onClick={() => setDisplayedLatex(bibTxtString)}>BibTXT</button>
                    </div>
                    <button onClick={() => setLaTeXWindowVisible(false)}>X</button>
                </div>

                <div className="displayed-latex">{displayedLatex || bibtexString}</div>
            </div>
        </div>
    );
}

export function MoveWindow(props) {
    const {
        bibliographies,
        bibliographyId,
        citations,
        checkedCitations,
        setMoveWindowVisible,
        applyOnAll,
        dispatch,
        showConfirmDialog,
    } = props;

    function handleMove(bibliographyId) {
        console.log(applyOnAll);
        dispatch({
            type: ACTIONS.DUPLICATE_SELECTED_CITATIONS, // Duplicate has the same effect of moving, but the bibliographyId is different
            payload: {
                bibliographyId: bibliographyId,
                checkedCitations: applyOnAll ? citations : checkedCitations,
            },
        });
        setMoveWindowVisible(false);
    }

    return (
        <div className="move-window">
            <button onClick={() => setMoveWindowVisible(false)}>X</button>
            {bibliographies.map((bib) => {
                if (bib.id !== bibliographyId)
                    return (
                        <div
                            onClick={() => {
                                if (applyOnAll)
                                    showConfirmDialog(
                                        `Merge with ${bib.title}?`,
                                        "This will move all citations in this bibliography to the selected one. Are you sure you want to proceed?",
                                        () => handleMove(bib.id),
                                        "Merge",
                                        "Cancel"
                                    );
                                else handleMove(bib.id); // Move without showing ConfirmDialog
                            }}
                        >
                            <BibliographyCard bibliography={bib} />
                        </div>
                    );
                return null;
            })}
        </div>
    );
}

export function RenameWindow(props) {
    const { handleRename, setRenameWindowVisible } = props;
    const [title, setTitle] = useState(props.title);

    return (
        <div className="rename-window">
            <form onSubmit={() => handleRename(title)}>
                <input
                    type="text"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Untitled Bibliography"
                    value={title}
                    name="title-input"
                />
                <button type="submit">Rename</button>
                <button onClick={() => setRenameWindowVisible(false)}>Cancel</button>
            </form>
        </div>
    );
}

export function CitationStylesMenu() {
    const [styles, setStyles] = useState(() => {
        async function fetchStyles() {
            const response = await fetch("/%PUBLIC_URL%/styles.json");
            const data = await response.text();
            return data;
        }
        fetchStyles();
    });
    return (
        <div className="citation-styles-menu">
            <search>
                <form>
                    <input type="text" placeholder="Find style by name" />
                </form>
            </search>
            {/* I want to map the styles based on the search input */}
        </div>
    );
}
