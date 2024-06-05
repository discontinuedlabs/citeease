import { useEffect, useRef, useState } from "react";
import * as citationEngine from "../utils/citationEngine";
import { SOURCE_TYPES } from "./Bibliography";
import {
    addNewCitation,
    copySelectedCitations,
    handleMasterEntriesCheckbox,
    moveSelectedCitations,
    toggleEntryCheckbox,
    updateCitation,
    updateContentInEditedCitation,
} from "../store/slices/bibsSlice";
import BibliographyCard from "./ui/BibliographyCard";
import ContextMenu from "./ui/ContextMenu";
import DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser/lib/index";
import { FixedSizeList as List } from "react-window";
import * as citationUtils from "../utils/citationUtils";
import { useDispatch, useSelector } from "react-redux";
import { useFindBib, useFindCheckedCitations } from "../hooks/hooks";

// Source types
import ArticleJournal from "./sourceTypes/ArticleJournal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";
import Tag from "./ui/Tag";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

// ATTENTION: Needs review
const LOCATOR_OPTIONS = {
    appendix: {
        def: "A supplementary section at the end of a document.",
        placeholder: "eg., Appendix A or Appendix B",
        name: "Appendix",
        code: "appendix",
    },
    "article-locator": {
        def: "A unique identifier for an article, often used in digital or online publications.",
        placeholder: "eg., 12345",
        name: "Article Locator",
        code: "article-locator",
    },
    book: {
        def: "A specific book or volume within a series or collection.",
        placeholder: "eg., Book Title or Book Collection",
        name: "Book",
        code: "book",
    },
    canon: {
        def: "A standard or rule, often used in legal or religious contexts.",
        placeholder: "eg., 15 or 15-20",
        name: "Canon",
        code: "canon",
    },
    chapter: {
        def: "A specific chapter within a book.",
        placeholder: "eg., 5 or 5-7",
        name: "Chapter",
        code: "chapter",
    },
    column: {
        def: "A vertical division of text in a document, often in newspapers or magazines.",
        placeholder: "eg., 3 or 3-4",
        name: "Column",
        code: "column",
    },
    elocation: {
        def: "An electronic location identifier for digital content.",
        placeholder: "eg., e12345",
        name: "Elocation",
        code: "elocation",
    },
    equation: {
        def: "A specific equation within a text.",
        placeholder: "eg., 7",
        name: "Equation",
        code: "equation",
    },
    figure: {
        def: "A specific figure or illustration in a document.",
        placeholder: "eg., 2",
        name: "Figure",
        code: "figure",
    },
    folio: {
        def: "A leaf of a manuscript or book, numbered on the front side only.",
        placeholder: "eg., 10",
        name: "Folio",
        code: "folio",
    },
    issue: {
        def: "A specific issue of a journal or magazine.",
        placeholder: "eg., 4",
        name: "Issue",
        code: "issue",
    },
    line: {
        def: "A specific line in a poem, play, or other text.",
        placeholder: "eg., 23",
        name: "Line",
        code: "line",
    },
    note: {
        def: "A specific footnote or endnote in a text.",
        placeholder: "eg., 7",
        name: "Note",
        code: "note",
    },
    opus: {
        def: "A specific work or composition, often used in music.",
        placeholder: "eg., 22",
        name: "Opus",
        code: "opus",
    },
    page: {
        def: "A specific page or range of pages in a document.",
        placeholder: "eg., 3 or 9-22",
        name: "Page",
        code: "page",
    },
    paragraph: {
        def: "A specific paragraph in a document.",
        placeholder: "eg., 4 or 4-6",
        name: "Paragraph",
        code: "paragraph",
    },
    part: {
        def: "A specific part or section of a larger work.",
        placeholder: "eg., 2 or 2-3",
        name: "Part",
        code: "part",
    },
    rule: {
        def: "A specific rule or regulation, often used in legal or procedural contexts.",
        placeholder: "eg., 5 or 5-8",
        name: "Rule",
        code: "rule",
    },
    section: {
        def: "A specific section of a document.",
        placeholder: "eg., Introduction",
        name: "Section",
        code: "section",
    },
    "sub-verbo": {
        def: "An entry under a specific word or heading in a reference work.",
        placeholder: "eg., Equity",
        name: "Sub-Verbo",
        code: "sub-verbo",
    },
    supplement: {
        def: "A supplementary issue or addition to a publication.",
        placeholder: "eg., 1",
        name: "Supplement",
        code: "supplement",
    },
    table: {
        def: "A specific table within a document.",
        placeholder: "eg., 4",
        name: "Table",
        code: "table",
    },
    timestamp: {
        def: "A specific time marker, often used in audiovisual materials.",
        placeholder: "eg., 00:15:30",
        name: "Timestamp",
        code: "timestamp",
    },
    title: {
        def: "A specific title of a work or section within a larger work.",
        placeholder: "eg., Title",
        name: "Title",
        code: "title",
    },
    verse: {
        def: "A specific verse in a poem, song, or scripture.",
        placeholder: "eg., 7 or 2-16",
        name: "Verse",
        code: "verse",
    },
    volume: {
        def: "A specific volume within a series or set.",
        placeholder: "eg., 3 or 3-4",
        name: "Volume",
        code: "volume",
    },
};

const DEFAULT_LOCATOR = LOCATOR_OPTIONS.page;

const MOST_POPULAR_STYLES = [
    "apa",
    "apa-6th-edition",
    "modern-language-association",
    "chicago-author-date",
    "ieee",
    "council-of-science-editors",
];

const TAGS_COLORS = {
    blue: "rgb(79,91,213)",
    orange: "rgb(250,126,30)",
    pink: "rgb(214,41,118)",
    purple: "rgb(150,47,191)",
    yellow: "rgb(170,150,0)",
    green: "rgb(0,128,0)",
    red: "rgb(255,0,0)",
    gray: "rgb(128,128,128)",
    teal: "rgb(0,128,128)",
    cyan: "rgb(0,170,190)",
    Bluishgray: "rgb(128,128,170)",
};

const PREBUILT_TAGS = [
    { label: "Completed", color: TAGS_COLORS.green, id: "builtin-completed" },
    { label: "In progress", color: TAGS_COLORS.yellow, id: "builtin-inProgress" },
    { label: "Pending Review", color: TAGS_COLORS.orange, id: "builtin-pendingReview" },
    { label: "High priority", color: TAGS_COLORS.red, id: "builtin-highPriority" },
    { label: "Low priority", color: TAGS_COLORS.blue, id: "builtin-lowPriority" },
    { label: "Research topic", color: TAGS_COLORS.purple, id: "builtin-researchTopic" },
    { label: "Course project", color: TAGS_COLORS.cyan, id: "builtin-courseProject" },
    { label: "Personal project", color: TAGS_COLORS.pink, id: "builtin-personalProject" },
    { label: "Collaborative", color: TAGS_COLORS.teal, id: "builtin-collaborative" },
    { label: "Archived", color: TAGS_COLORS.gray, id: "builtin-archived" },
    { label: "Discontinued", color: TAGS_COLORS.Bluishgray, id: "builtin-discontinued" },
];

export function ReferenceEntries(props) {
    const { openCitationForm, openIntextCitationDialog } = props;
    const bibliography = useFindBib();
    const checkedCitations = useFindCheckedCitations();
    const [references, setReferences] = useState([]);
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);
    const dispatch = useDispatch();

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
        async function formatBibliography() {
            const formattedCitations = await citationEngine.formatBibliography(
                bibliography?.citations,
                bibliography?.style,
                "html"
            );
            setReferences(formattedCitations);
        }
        formatBibliography();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bibliography?.citations, bibliography?.style]); // Adding setSavedCslFiles to the dependency array will cause the component to rerender infinitely

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
                const formattedCitations = await citationEngine.formatBibliography(
                    checkedCitations,
                    bibliography?.style,
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

                {checkedCitations?.length !== 0 && <button onClick={openIntextCitationDialog}>In-text citation</button>}
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

export function IntextCitationDialog(props) {
    const { setIntextCitationDialogVisible: setIsVisible } = props;
    const bibliography = useFindBib();
    const checkedCitations = useFindCheckedCitations();
    const [IntextCitation, setIntextCitation] = useState("");
    const [citationsForIntext, setCitationsForIntext] = useState(checkedCitations.map((cit) => cit.content));

    useEffect(() => {
        async function formatIntextCitation() {
            const formattedIntextCitation = await citationEngine.formatIntextCitation(
                citationsForIntext,
                bibliography?.style,
                "html"
            );
            setIntextCitation(formattedIntextCitation);
        }
        formatIntextCitation();
    }, [citationsForIntext, bibliography?.style]);

    function updateContentField(citId, key, value) {
        setCitationsForIntext((prevCitationsForIntext) => {
            return prevCitationsForIntext.map((content) => {
                if (content.id === citId) {
                    return {
                        ...content,
                        [key]: value,
                    };
                }
                return content;
            });
        });
    }

    return (
        <div>
            <div className="font-cambo">{IntextCitation}</div>
            <button onClick={() => setIsVisible(false)}>X</button>
            {citationsForIntext.map((cit, index) => {
                return (
                    <div key={index}>
                        <div>{cit.title || `${cit.author[0].family} ${cit.issued["date-parts"].join(" ")}`}</div>

                        <select
                            value={cit?.label || DEFAULT_LOCATOR.code}
                            onChange={(event) =>
                                updateContentField(cit.id, "label", LOCATOR_OPTIONS[event.target.value].code)
                            }
                        >
                            {Object.values(LOCATOR_OPTIONS).map((option, index) => (
                                <option key={index} value={option.code}>
                                    {option.name}
                                </option>
                            ))}
                        </select>

                        <input
                            name="intext-locator"
                            type="text"
                            placeholder={LOCATOR_OPTIONS[cit.label]?.placeholder || DEFAULT_LOCATOR.placeholder}
                            value={citationsForIntext?.locator}
                            onChange={(event) => updateContentField(cit.id, "locator", event.target.value)}
                        />
                        <small>{LOCATOR_OPTIONS[cit.label]?.def || DEFAULT_LOCATOR.def}</small>
                    </div>
                );
            })}
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
    const { showAcceptDialog, setCitationFormVisible: setIsVisible } = props;
    const bibliography = useFindBib();
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
        dispatch(updateCitation({ bibliographyId: bibliography.id, editedCitation: bibliography?.editedCitation }));
        setIsVisible(false);
    }

    function handleCancel() {
        setIsVisible(false);
    }

    return <div className="citation-window">{CITATION_COMPONENTS[content.type]}</div>;
}

export function LaTeXDialog(props) {
    const { setLaTeXWindowVisible: setIsVisible } = props;
    const [bibtexString, setBibtexString] = useState("");
    const [biblatexString, setBiblatexString] = useState("");
    const [bibTxtString, setBibTxtString] = useState("");
    const [displayedLatex, setDisplayedLatex] = useState(bibtexString);
    const checkedCitations = useFindCheckedCitations();

    useEffect(() => {
        async function formatLaTeX() {
            setBibtexString(await citationEngine.formatLaTeX(checkedCitations, "bibtex"));
            setBiblatexString(await citationEngine.formatLaTeX(checkedCitations, "biblatex"));
            setBibTxtString(await citationEngine.formatLaTeX(checkedCitations, "bibtxt"));
        }
        formatLaTeX();
    }, [checkedCitations]);

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
    const { setMoveWindowVisible: setIsVisible } = props;
    const bibliographies = useSelector((state) => state.bibliographies);
    const bibliography = useFindBib();
    const checkedCitations = useFindCheckedCitations();
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
            <button onClick={() => setIsVisible(false)}>X</button>
            {bibliographies.map((bib) => {
                if (bib.id !== bibliography.id)
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
    const { setCitationStyleMenuVisible: setIsVisible, onStyleSelected } = props;
    const [styles, setStyles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const MOST_POPULAR_STYLES_LABEL = "Most popular styles";
    const OTHER_STYLES_LABEL = "Other styles";

    useEffect(() => {
        async function fetchStyles() {
            const response = await fetch(`${process.env.PUBLIC_URL}/styles.json`);
            const data = await response.json();

            data.unshift(OTHER_STYLES_LABEL);
            const sortedData = data.sort((a, b) => {
                if (MOST_POPULAR_STYLES.includes(a?.code)) return -1;
                if (MOST_POPULAR_STYLES.includes(b?.code)) return 1;
                return 0;
            });
            sortedData.unshift(MOST_POPULAR_STYLES_LABEL);

            setStyles(sortedData);
        }
        fetchStyles();
    }, []);

    const filteredStyles = styles?.filter((style) => {
        function testStrings(stringsArray) {
            let found = false;
            for (let i = 0; i < stringsArray.length; i++) {
                if (
                    // eg., "chicago manual of style 17th edition" => Chicago Manual of Style 17th edition
                    stringsArray[i]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    // eg., "cmos17e" || "c m o s 1 7 e" => Chicago Manual of Style 17th edition
                    stringsArray[i]
                        ?.toLowerCase()
                        .split(/\s+|-/)
                        .map((sect) => {
                            if (/\d/.test(sect)) return sect.replace(/\D/g, "");
                            else return sect[0];
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

        if (style === MOST_POPULAR_STYLES_LABEL || style === OTHER_STYLES_LABEL) return true;
        else if (searchTerm) return testStrings([style?.name?.long, style?.name?.short, style?.code]);
        else return true;
    });

    return (
        <div className="citation-styles-menu">
            <button onClick={() => setIsVisible(false)}>X</button>

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

            <List height={500} itemCount={filteredStyles.length} itemSize={35} width={300}>
                {({ index, style }) => {
                    const targetStyle = filteredStyles[index];
                    if (/other styles|most popular/i.test(targetStyle)) {
                        return <h3 style={style}>{targetStyle}</h3>;
                    }
                    return (
                        <button
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
            </List>
            <small>
                <b>Note:</b> Some less common citation styles may have formatting issues. If you encounter any problems,
                please report them by opening an issue on the{" "}
                <a href="https://github.com/citation-style-language/styles/issues">CSL GitHub repository</a> or contact
                us at <a href="mailto:discontinuedlabs@gmail.com">discontinuedlabs@gmail.com</a>.
            </small>
        </div>
    );
}

// FIXME: Handle errors. It should't cut the for loop when something returns an error
export function SmartGeneratorDialog(props) {
    const { searchByIdentifiersInput: input, setSmartGeneratorDialogVisible: setIsVisible } = props;
    const bibliography = useFindBib();
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

                if (content) {
                    newContentsArray.push(content);
                    dispatch(addNewCitation({ bibliographyId: bibliography.id, content }));
                } else {
                    console.error("Couldn't find the content of the identifier " + identifier);
                }
            });
            setContentsArray(newContentsArray);
        }
        generateCitations();
    }, [input, bibliography.id, dispatch]);

    useEffect(() => {
        async function formatBibliography() {
            const formattedCitation = await citationEngine.formatBibliography(
                contentsArray.map((content) => ({ content: content })),
                bibliography.style
            );
            const sanitizedReference = DOMPurify.sanitize(formattedCitation);
            setReferences(sanitizedReference);
        }
        formatBibliography();
    }, [contentsArray]);

    return (
        <div>
            <button onClick={() => setIsVisible(false)}>X</button>
            <div>{HTMLReactParser(references)}</div>
            <button>Accept</button>
        </div>
    );
}

export function TagsDialog(props) {
    const { setTagsDialogVisible: setIsVisible, onTagAdded, onTagRemoved } = props;
    const bibliography = useFindBib();
    const settings = useSelector((state) => state.settings);
    const tags = settings?.tags || PREBUILT_TAGS;

    return (
        <div>
            <button onClick={() => setIsVisible(false)}>X</button>
            <h3>Tags</h3>
            <div className="flex gap-1 flex-wrap">
                {bibliography?.tags?.map((tag, index) => (
                    <Tag key={index} tagProps={tag} onClick={onTagRemoved} showX={true} />
                ))}
            </div>
            <div className="flex gap-1 flex-wrap">
                {tags
                    .filter((tag) => !bibliography?.tags?.some((bibTag) => bibTag.id === tag.id))
                    .map((tag, index) => {
                        return <Tag key={index} tagProps={tag} onClick={onTagAdded} />;
                    })}
            </div>
        </div>
    );
}
