import { useEffect, useId, useRef, useState } from "react";
import { nanoid } from "nanoid";
import DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser/lib/index";
import { FixedSizeList as List } from "react-window";
import { useDispatch, useSelector } from "react-redux";
import locatorTypes from "../../assets/locatorOptions.json";
import * as citationEngine from "../../utils/citationEngine";
import sourceTypes from "../../assets/sourceTypes.json";
import {
    addNewCitation,
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
import { useFindBib, useFindCheckedCitations } from "../../hooks/hooks.ts";
import Tag from "../../components/ui/Tag";
import citationStyles from "../../assets/styles.json";
import mostPopularStyles from "../../assets/mostPopularStyles.json";

// Source types
import ArticleJournal from "../../components/sourceTypes/ArticleJournal";
import Webpage from "../../components/sourceTypes/Webpage";
import Book from "../../components/sourceTypes/Book";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

const DEFAULT_LOCATOR = locatorTypes.page;

export function ReferenceEntries(props) {
    const { openCitationForm, openIntextCitationDialog } = props;
    const bibliography = useFindBib();
    const checkedCitations = useFindCheckedCitations();
    // eslint-disable-next-line
    const [formattedSelectedCitations, setFormattedSelectedCitations] = useState([]);
    const [references, setReferences] = useState([]);
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);
    const dispatch = useDispatch();

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
                bibliography?.style
            );
            setReferences(formattedCitations);
        }
        formatBibliography();
    }, [bibliography?.citations, bibliography?.style]);

    // FIXME: This useEffect causes infinte rerenders
    // useEffect(() => {
    //     // console.log(checkedCitations, bibliography?.style);
    //     // Used for the handleDrag function because event.dataTransfer.setData("text/html", sanitizedInnerHTML); doesn't wait
    //     async function formatSelectedCitations() {
    //         const formattedCitations = await citationEngine.formatBibliography(checkedCitations, bibliography?.style);
    //         setFormattedSelectedCitations(formattedCitations);
    //     }
    //     formatSelectedCitations();
    // }, [checkedCitations, bibliography?.style]);

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
            formattedSelectedCitations.forEach((cit) => {
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
            <div>
                {bibliography?.citations.length !== 0 && (
                    <input
                        type="checkbox"
                        className="master-checkbox"
                        checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                        onChange={handleMasterCheck}
                    />
                )}

                {checkedCitations?.length !== 0 && (
                    <button type="button" onClick={openIntextCitationDialog}>
                        In-text citation
                    </button>
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
                            className={`flex items-start justify-between py-2 px-2 space-y-2 space-x-2 rounded-md mb-1 transition-all duration-200 hover:bg-neutral-transparentGray ${
                                citation?.isChecked ? "bg-secondary-100 hover:bg-secondary-200" : ""
                            }`}
                            key={citation?.id || nanoid()}
                            draggable
                            onDragStart={handleDrag}
                        >
                            <input
                                type="checkbox"
                                className="top-0 m-0"
                                checked={citation?.isChecked || false}
                                onChange={() => handleEntryCheck(citation)}
                            />

                            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                            <div
                                type="button"
                                className={`font-cambo ${
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
    const [intextCitation, setIntextCitation] = useState("");
    const [citationsForIntext, setCitationsForIntext] = useState(checkedCitations.map((cit) => cit.content));

    useEffect(() => {
        async function formatIntextCitation() {
            const formattedIntextCitation = await citationEngine.formatIntextCitation(
                citationsForIntext,
                bibliography?.style,
                "html"
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
            <div className="font-cambo">{HTMLReactParser(intextCitation)}</div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            {citationsForIntext.map((cit) => (
                <div key={nanoid()}>
                    <div>{cit.title || `${cit.author[0].family} ${cit.issued["date-parts"].join(" ")}`}</div>

                    <select
                        value={cit?.label || DEFAULT_LOCATOR.code}
                        onChange={(event) => updateContentField(cit.id, "label", locatorTypes[event.target.value].code)}
                    >
                        {Object.values(locatorTypes).map((option) => (
                            <option key={nanoid()} value={option.code}>
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
                <button type="button" onClick={() => setIsVisible(false)}>
                    X
                </button>
            </div>

            <div>
                <small>Experimental</small>
                <label>Search by URL, DOI, ISBN, or PubMed and PMC identifiers:</label>
                <textarea
                    ref={identifierRef}
                    name="search-by-identifiers"
                    placeholder="Search by unique identifiers..."
                />
                <small>You can list all the identifiers at the same time.</small>
                <button type="button" onClick={() => handleSearchByIdentifiers(identifierRef.current.value)}>
                    Generate citations
                </button>
            </div>

            <search>
                <input type="text" name="search-by-title" placeholder="Search by title..." />
                <button type="button" onClick={handleSearchByTitle}>
                    Search
                </button>
            </search>

            <button type="button" onClick={handleImportCitation}>
                Import citation
            </button>

            <ContextMenu
                label="Choose source type"
                options={Object.values(sourceTypes).map((entry) => ({
                    label: entry.label,
                    method: () => openCitationForm(entry.code, true),
                }))}
                menuStyle={{
                    position: "fixed",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
            />
        </div>
    );
}

export function CitationForm(props) {
    const { setCitationFormVisible: setIsVisible } = props;
    const bibliography = useFindBib();
    const [content, setContent] = useState(bibliography?.editedCitation?.content || {});
    const dispatch = useDispatch();

    useEffect(() => {
        setContent(bibliography?.editedCitation?.content || {});
    }, [bibliography?.editedCitation?.content]);

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
                        <button type="button" onClick={() => setDisplayedLatex(bibtexString)}>
                            BibTex
                        </button>
                        <button type="button" onClick={() => setDisplayedLatex(biblatexString)}>
                            BibLaTeX
                        </button>
                        <button type="button" onClick={() => setDisplayedLatex(bibTxtString)}>
                            BibTXT
                        </button>
                    </div>
                    <button type="button" onClick={() => setIsVisible(false)}>
                        X
                    </button>
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

            <List height={500} itemCount={filteredStyles.length} itemSize={45} width={300}>
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
            </List>
            <small>
                <b>Note:</b> Some less common citation styles may have formatting issues. If you encounter any problems,
                please report them by opening an issue on the{" "}
                <a href="https://github.com/citation-style-language/styles/issues">CSL GitHub repository</a> or contact
                us at<a href="mailto:discontinuedlabs@gmail.com">discontinuedlabs@gmail.com</a>.
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

    // TODO: Refactor
    useEffect(() => {
        async function generateCitations() {
            const identifiers = input.split(/\n+/);

            const newContentsArray = [];
            identifiers.forEach(async (identifier) => {
                let content;
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

                if (content) {
                    newContentsArray.push(content);
                    dispatch(addNewCitation({ bibliographyId: bibliography.id, content }));
                    return null;
                }
                console.error(`Couldn't find the content of the identifier ${identifier}`);
                return null;
            });
            setContentsArray(newContentsArray);
            return null;
        }
        generateCitations();
    }, [input, bibliography.id, dispatch]);

    useEffect(() => {
        async function formatBibliography() {
            const formattedCitation = await citationEngine.formatBibliography(
                contentsArray.map((content) => ({ content })),
                bibliography.style
            );
            const sanitizedReference = DOMPurify.sanitize(formattedCitation);
            setReferences(sanitizedReference);
        }
        formatBibliography();
    }, [contentsArray]);

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <div>{HTMLReactParser(references)}</div>
            <button type="button">Accept</button>
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
            <div className="flex gap-1 flex-wrap">
                {bibliography?.tags?.map((tag) => (
                    <Tag key={nanoid()} tagProps={tag} onClick={onTagRemoved} showX />
                ))}
            </div>

            <div className="flex gap-1 flex-wrap">
                {settings.tags
                    ?.filter((tag) => !bibliography?.tags?.some((bibTag) => bibTag.id === tag.id))
                    .map((tag) => (
                        <Tag key={nanoid()} tagProps={tag} onClick={onTagAdded} />
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
            console.log(Object.fromEntries(data.entries()));
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
                <label htmlFor={`${id}-id`}>Unique identifer</label>
                <input autoComplete="off" ref={idRef} type="text" id={`${id}-id`} name="id" required />
                <label htmlFor={`${id}-password`}>Password</label>
                <input
                    autoComplete="off"
                    ref={passwordRef}
                    type="password"
                    id={`${id}-password`}
                    name="password"
                    required
                />
                <label htmlFor={`${id}-confirmPassword`}>Confirm password</label>
                <input
                    autoComplete="off"
                    ref={confirmPasswordRef}
                    type="password"
                    id={`${id}-confirmPassword`}
                    name="confirmPassword"
                    required
                />
                <button type="submit">Open collaboration</button>
            </form>
        </div>
    );
}
