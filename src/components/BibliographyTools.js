import { useEffect, useRef, useState } from "react";
import * as citationEngine from "./citationEngine";
import { SOURCE_TYPES } from "./Bibliography";
import {
    addNewBib,
    addNewCitation,
    copySelectedCitations,
    handleMasterEntriesCheckbox,
    moveSelectedCitations,
    toggleEntryCheckbox,
    updateCitation,
    updateContentInEditedCitation,
} from "./slices/bibsSlice";
import BibliographyCard from "./ui/BibliographyCard";
import ContextMenu from "./ui/ContextMenu";
import DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser/lib/index";
import { FixedSizeList as List } from "react-window";
import * as citationUtils from "./citationUtils";
import { useDispatch, useSelector } from "react-redux";

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
    const { bibliography, savedCslFiles, updateSavedCslFiles, openCitationForm } = props;
    const [references, setReferences] = useState([]);
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);
    const dispatch = useDispatch();

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
                updateSavedCslFiles,
                "html"
            );
            setReferences(formattedCitations);
        }
        formatCitations();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bibliography?.citations, bibliography?.style, savedCslFiles]); // Adding setSavedCslFiles to the dependency array will cause the component to rerender infinitely

    function handleMasterCheck() {
        dispatch(handleMasterEntriesCheckbox({ bibliographyId: bibliography?.id }));
    }

    function handleEntryCheck(citationId) {
        dispatch(toggleEntryCheckbox({ bibliographyId: bibliography.id, citationId: citationId.id }));
    }

    // TODO: This should only grab it as html when the user holds H
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
                    updateSavedCslFiles,
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
            <div className="reference-entries-header" key={"header"}>
                {bibliography?.citations.length !== 0 && (
                    <input
                        type="checkbox"
                        className="master-checkbox"
                        checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                        onChange={handleMasterCheck}
                    />
                )}
            </div>

            <div className="max-w-[50rem] mx-auto p-4" key={"entries-container"}>
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
                                onClick={() => openCitationForm(citation?.content.type, false, citation?.id)}
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
        setAddCitationMenuVisible: setIsVisible,
        openCitationForm,
        handleSearchByIdentifiers,
        handleImportCitation,
        handleSearchByTitle,
    } = props;
    const identifierRef = useRef();

    return (
        <div className="fixed bottom-[1rem] left-1/2 transform -translate-x-1/2">
            <div>
                <h3>Add citation</h3>
                <button onClick={() => setIsVisible(false)}>X</button>
            </div>

            <div>
                <small>Experimental</small>
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
                        method: () => openCitationForm(entry.code, true),
                    };
                })}
                menuStyle={{ position: "fixed", bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
            />
        </div>
    );
}

export function CitationForm(props) {
    const { bibliography, showAcceptDialog, setCitationFormVisible: setIsVisible } = props;
    const [content, setContent] = useState(bibliography?.editedCitation?.content || {});
    const dispatch = useDispatch();

    useEffect(() => {
        setContent(bibliography?.editedCitation?.content || {});
    }, [bibliography?.editedCitation?.content]);

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
        dispatch(updateContentInEditedCitation({ bibliographyId: bibliography.id, content: content }));
    }, [content]);

    function handleAddReference(event) {
        event.preventDefault();
        console.log({ bibliographyId: bibliography.id, editedCitation: bibliography?.editedCitation });
        dispatch(updateCitation({ bibliographyId: bibliography.id, editedCitation: bibliography?.editedCitation }));
        setIsVisible(false);
    }

    function handleCancel() {
        setIsVisible(false);
    }

    return <div className="citation-window">{CITATION_COMPONENTS[content.type]}</div>;
}

export function LaTeXDialog(props) {
    const { checkedCitations, setLaTeXWindowVisible: setIsVisible } = props;
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
                    <button onClick={() => setIsVisible(false)}>X</button>
                </div>

                <div className="whitespace-pre-wrap">{displayedLatex || bibtexString}</div>
            </div>
        </div>
    );
}

export function MoveDialog(props) {
    const { bibliographyId, checkedCitations, setMoveWindowVisible: setIsVisible } = props;
    const bibliographies = useSelector((state) => state.bibliographies);
    const [selectedBibliographyIds, setSelectedBibliographyIds] = useState([]);
    const dispatch = useDispatch();

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
        dispatch(
            moveSelectedCitations({
                fromId: bibliographyId,
                toId: toId,
                checkedCitations: checkedCitations,
            })
        );
        setIsVisible(false);
        setSelectedBibliographyIds([]);
    }

    function handleCopy() {
        dispatch(
            copySelectedCitations({
                toIds: selectedBibliographyIds,
                checkedCitations: checkedCitations,
            })
        );
        setIsVisible(false);
        setSelectedBibliographyIds([]);
    }

    return (
        <div className="move-window">
            <button onClick={() => setIsVisible(false)}>X</button>
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
    const { handleRename, setRenameWindowVisible: setIsVisible } = props;
    const [title, setTitle] = useState(props.title);

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
                <button onClick={() => setIsVisible(false)}>Cancel</button>
            </form>
        </div>
    );
}

export function CitationStylesMenu(props) {
    const { setCitationStyleMenuVisible: setIsVisible } = props;
    const [styles, setStyles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const dispatch = useDispatch();

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
                        .replace(/\b(of|and|in|on|at|the|from|to|with|by|for|\(|\))\b/gi, "")
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
                            setIsVisible(false);
                            dispatch(addNewBib({ bibliographyStyle: filteredStyles[index] }));
                        }}
                    >
                        {filteredStyles[index].name.long}
                    </button>
                )}
            </List>
        </div>
    );
}

// FIXME: Handle errors. It should't cut the for loop when something returns an error
export function SmartGeneratorDialog(props) {
    const {
        searchByIdentifiersInput: input,
        setSmartGeneratorDialogVisible: setIsVisible,
        bibliographyId,
        bibStyle,
        savedCslFiles,
        updateSavedCslFiles,
    } = props;

    const [contentsArray, setContentsArray] = useState([]);
    const [references, setReferences] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        async function generateCitations() {
            const identifiers = input.split(/\n+/);

            let newContentsArray = [];
            identifiers.forEach(async (identifier) => {
                let content;
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

                console.warn(content);

                if (content) {
                    newContentsArray.push(content);
                    dispatch(addNewCitation({ bibliographyId: bibliographyId, content }));
                } else {
                    console.error("Couldn't find the content of the identifier " + identifier);
                }
            });
            setContentsArray(newContentsArray);
        }
        generateCitations();
    }, [input, bibliographyId, dispatch]);

    useEffect(() => {
        async function formatCitations() {
            const formattedCitation = await citationEngine.formatCitations(
                contentsArray.map((content) => ({ content: content })),
                bibStyle,
                savedCslFiles,
                updateSavedCslFiles
            );
            const sanitizedReference = DOMPurify.sanitize(formattedCitation);
            setReferences(sanitizedReference);
        }
        formatCitations();
    }, [contentsArray]);

    return (
        <div>
            <button onClick={() => setIsVisible(false)}>X</button>
            <div>{HTMLReactParser(references)}</div>
            <button>Accept</button>
        </div>
    );
}
