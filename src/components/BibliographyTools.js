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

    const checkedCitations = bibliography?.citations.filter((cit) => cit?.isChecked === true);

    useEffect(() => {
        function updateMasterCheckboxState() {
            let checkedCount = 0;
            bibliography?.citations.forEach((cit) => {
                if (cit?.isChecked) {
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
                setSavedCslFiles,
                "html"
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

    function handleEntryCheck(citationId) {
        dispatch({
            type: ACTIONS.TOGGLE_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliography.id, citationId: citationId.id },
        });
    }

    async function handleDrag(event) {
        if (!checkedCitations.length) {
            event.dataTransfer.setData("text/html", event.target.innerHTML);
        } else {
            const formattedCitations = await citationEngine.formatCitations(
                checkedCitations,
                bibliography?.style,
                savedCslFiles,
                setSavedCslFiles,
                "html"
            );

            const div = document.createElement("div");
            for (const cit of formattedCitations) {
                const parser = new DOMParser();
                const docFragment = parser.parseFromString(cit, "text/html");
                const element = docFragment.body.firstChild;
                div.appendChild(element);
                div.appendChild(document.createElement("br"));
            }

            event.dataTransfer.setData("text/html", div.innerHTML);
            div.remove();
        }
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
                {/* IMPORTANT: Entries need to be mapped by the references array because it gets sorted according to the CSL file rules, unlike the bibliography.citations array */}
                {references?.map((ref) => {
                    const refId = () => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(ref, "text/html");
                        return doc.querySelector("[data-csl-entry-id]").getAttribute("data-csl-entry-id");
                    };
                    const citation = bibliography?.citations.find((cit) => cit?.id === refId());
                    const sanitizedReferences = DOMPurify.sanitize(ref);
                    return (
                        <div className="reference-entry" key={citation?.id} draggable={true} onDragStart={handleDrag}>
                            <input
                                type="checkbox"
                                className="reference-entry-checkbox"
                                checked={citation?.isChecked || false}
                                onChange={() => handleEntryCheck(citation)}
                            />

                            <div
                                className={`reference-entry-text ${
                                    /^(apa|modern-language-association|chicago)$/i.test(bibliography?.style.code) // Include any other style that needs hanging indentation
                                        ? "hanging-indentation"
                                        : ""
                                }`}
                                onClick={() => openCitationWindow(citation?.content.type, false, citation?.id)}
                            >
                                {HTMLReactParser(sanitizedReferences)}
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
    const { citations, checkedCitations, setLaTeXWindowVisible } = props;
    const [bibtexString, setBibtexString] = useState("");
    const [biblatexString, setBiblatexString] = useState("");
    const [bibTxtString, setBibTxtString] = useState("");
    const [displayedLatex, setDisplayedLatex] = useState(bibtexString);

    useEffect(() => {
        async function formatLaTeX() {
            setBibtexString(await citationEngine.formatLaTeX(checkedCitations, "bibtex"));
            setBiblatexString(await citationEngine.formatLaTeX(checkedCitations, "biblatex"));
            setBibTxtString(await citationEngine.formatLaTeX(checkedCitations, "bibtxt"));
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
    const { bibliographies, bibliographyId, checkedCitations, setMoveWindowVisible, dispatch } = props;
    const [selectedBibliographyIds, setSelectedBibliographyIds] = useState([]);

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
        dispatch({
            type: ACTIONS.MOVE_SELECTED_CITATIONS,
            payload: {
                fromId: bibliographyId,
                toId: toId,
                checkedCitations: checkedCitations,
            },
        });
        setMoveWindowVisible(false);
        setSelectedBibliographyIds([]);
    }

    function handleCopy() {
        dispatch({
            type: ACTIONS.COPY_SELECTED_CITATIONS,
            payload: {
                toIds: selectedBibliographyIds,
                checkedCitations: checkedCitations,
            },
        });
        setMoveWindowVisible(false);
        setSelectedBibliographyIds([]);
    }

    return (
        <div className="move-window">
            <button onClick={() => setMoveWindowVisible(false)}>X</button>
            {bibliographies.map((bib) => {
                if (bib.id !== bibliographyId)
                    return (
                        <div onClick={() => handleSelect(bib.id)}>
                            <BibliographyCard
                                bibliography={bib}
                                styles={{ backgroundColor: bib.id in selectedBibliographyIds ? "red" : "unset" }}
                            />
                        </div>
                    );
                return null;
            })}
            <button
                disabled={selectedBibliographyIds.length !== 1}
                onClick={() => handleMove(selectedBibliographyIds[0])}
            >
                Move
            </button>
            <button disabled={selectedBibliographyIds.length === 0} onClick={handleCopy}>
                Copy
            </button>
        </div>
    );
}

export function RenameWindow(props) {
    const { handleRename, setRenameWindowVisible } = props;
    const [title, setTitle] = useState(props.title);

    function handleSubmit() {
        setRenameWindowVisible(false);
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
                <button onClick={() => setRenameWindowVisible(false)}>Cancel</button>
            </form>
        </div>
    );
}

// TODO...
export function CitationStylesMenu(props) {
    const { dispatch, action, setCitationStyleMenuVisible } = props;
    const [styles, setStyles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchStyles() {
            const response = await fetch(`${process.env.PUBLIC_URL}/styles.json`);
            const data = await response.json();
            setStyles(data);
        }
        fetchStyles();
    }, []);

    const filteredStyles = styles?.filter((style) => {
        function testStrings(stringsArray) {
            let found = false;
            for (let i = 0; i < stringsArray.length; i++) {
                if (
                    // eg. chicago manual of style 17th edition => Chicago Manual of Style 17th edition
                    stringsArray[i]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    // eg. cmos17e => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            else return sect[0];
                        })
                        .join("")
                        .includes(searchTerm.toLowerCase()) ||
                    // eg. cms17e => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .replace(/of|in|on|at|the|from/gi, "")
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            else return sect[0];
                        })
                        .join("")
                        .includes(searchTerm.toLowerCase())
                ) {
                    found = true;
                    break;
                }
            }
            return found;
        }

        if (searchTerm) {
            return testStrings([style.name.long, style.name.short, style.code]);
        } else {
            return true;
        }
    });

    return (
        <div className="citation-styles-menu">
            <search>
                <form>
                    <input
                        type="text"
                        name="citation-style-search-input"
                        placeholder="Find style by name..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </form>
            </search>

            {filteredStyles.map((style, index) => (
                <button
                    key={index}
                    onClick={() => {
                        setCitationStyleMenuVisible(false);
                        dispatch({ type: action, payload: { bibliographyStyle: style } });
                    }}
                >
                    {style.name.long}
                </button>
            ))}
        </div>
    );
}
