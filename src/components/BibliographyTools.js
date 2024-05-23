import { useEffect, useRef, useState } from "react";
import * as citationEngine from "./citationEngine";
import { useParams } from "react-router-dom";
import { SOURCE_TYPES } from "./Bibliography";
import { ACTIONS } from "./reducers/bibliographiesReducer";
import BibliographyCard from "./ui/BibliographyCard";
import ContextMenu from "./ui/ContextMenu";
import DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser/lib/index";
import { FixedSizeList as List } from "react-window";

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
        let sanitizedInnerHTML;
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/Android/i.test(userAgent)) {
            sanitizedInnerHTML = event.target.textContent;
            event.dataTransfer.setData("text/plain", sanitizedInnerHTML);
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            sanitizedInnerHTML = event.target.textContent;
            event.dataTransfer.setData("text/plain", sanitizedInnerHTML);
        } else {
            if (checkedCitations.length !== 0) {
                sanitizedInnerHTML = DOMPurify.sanitize(event.target.innerHTML);
                event.dataTransfer.setData("text/html", sanitizedInnerHTML);
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

                sanitizedInnerHTML = DOMPurify.sanitize(div.innerHTML);
                event.dataTransfer.setData("text/html", sanitizedInnerHTML);

                div.remove();
            }
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

            <div className="max-w-[50rem] mx-auto p-4">
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
                        <div
                            className={`flex items-start justify-between py-2 px-2 space-y-2 space-x-2 rounded-md mb-1 transition-all duration-200 hover:bg-overlay-100 ${
                                citation?.isChecked ? "bg-secondary-100 hover:bg-secondary-200" : ""
                            }`}
                            key={citation?.id}
                            draggable={true}
                            onDragStart={handleDrag}
                        >
                            <input
                                type="checkbox"
                                className="top-0 m-0"
                                checked={citation?.isChecked || false}
                                onChange={() => handleEntryCheck(citation)}
                            />

                            <div
                                className={`font-cambo break-words ${
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
    const {
        setAddCitationMenuVisible,
        openCitationWindow,
        handleSearchByIdentifiers,
        handleImportCitation,
        handleSearchByTitle,
    } = props;
    const identifierRef = useRef();

    return (
        <div className="fixed bottom-[1rem] left-1/2 transform -translate-x-1/2">
            <div>
                <h3>Add citation</h3>
                <button onClick={() => setAddCitationMenuVisible(false)}>X</button>
            </div>

            <div>
                <label>Search by URL, DOI, ISBN, or PubMed and PMC identifiers:</label>
                <textarea
                    ref={identifierRef}
                    name="search-by-identifiers"
                    placeholder="Search by unique identifiers..."
                ></textarea>
                <small>You can list all the identifiers at the same time.</small>
                <button onClick={() => handleSearchByIdentifiers(identifierRef.current.value)}>
                    Generate citations
                </button>
            </div>

            <search>
                <input type="text" name="search-by-title" placeholder="Search by title..."></input>
                <button onClick={handleSearchByTitle}>Search</button>
            </search>

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

export function CitationForm(props) {
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

export function LaTeXDialog(props) {
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

    console.log("run");

    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-transparent bg-overlay-500">
            <div className="top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[50rem] min-h-[70vh] max-h-[80vh] bg-white">
                <div className="flex">
                    <div className="flex">
                        <button onClick={() => setDisplayedLatex(bibtexString)}>BibTex</button>
                        <button onClick={() => setDisplayedLatex(biblatexString)}>BibLaTeX</button>
                        <button onClick={() => setDisplayedLatex(bibTxtString)}>BibTXT</button>
                    </div>
                    <button onClick={() => setLaTeXWindowVisible(false)}>X</button>
                </div>

                <div className="whitespace-pre-wrap">{displayedLatex || bibtexString}</div>
            </div>
        </div>
    );
}

export function MoveDialog(props) {
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

export function RenameDialog(props) {
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
                    // eg. "chicago manual of style 17th edition" => Chicago Manual of Style 17th edition
                    stringsArray[i]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    // eg. "cmos17e" || "c m o s 1 7 e" => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            else return sect[0];
                        })
                        .join("")
                        .includes(searchTerm.toLowerCase().replace(/\s+/g, "")) ||
                    // eg. "cms17e" || "c m s 1 7 e" => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .replace(
                            /\b(of|and|in|on|at|the|from|to|with|about|against|between|into|through|during|before|after|above|below|by|for|over|under|\(|\))\b/gi,
                            ""
                        )
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            else return sect[0];
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

            <List
                height={500} // Adjust based on your needs
                itemCount={filteredStyles.length}
                itemSize={35} // Adjust based on the height of your items
                width={300} // Adjust based on your needs
            >
                {({ index, style }) => (
                    <button
                        style={style}
                        onClick={() => {
                            setCitationStyleMenuVisible(false);
                            dispatch({ type: action, payload: { bibliographyStyle: filteredStyles[index] } });
                        }}
                    >
                        {filteredStyles[index].name.long}
                    </button>
                )}
            </List>
        </div>
    );
}
