import { useEffect, useState } from "react";
import * as citationEngine from "./citationEngine";
import "../css/LaTeX.css";
import { useParams } from "react-router-dom";
import { SOURCE_TYPES } from "./Bibliography";
import { ACTIONS } from "./reducers/bibliographiesReducer";
import BibliographyCard from "./ui/BibliographyCard";

// Source types
import ArticleJournal from "./sourceTypes/ArticleJournal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

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
