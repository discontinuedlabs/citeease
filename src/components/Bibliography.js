import "../css/Bibliography.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import CitationWindow from "./CitationWindow";
import AutoResizingTextarea from "./formElements/AutoResizingTextarea";
import { useEffect, useState } from "react";
import ReferenceEntries from "./ReferenceEntries";
import LaTeXWindow from "./LaTeX";
import * as citationEngine from "./citationEngine";

export const SOURCE_TYPES = {
    ARTICLE_JOURNAL: {
        label: "Journal article",
        code: "article-journal",
    },
    BOOK: { label: "Book", code: "book" },
    WEBPAGE: { label: "Webpage", code: "webpage" },
};

export default function Bibliography(props) {
    const { bibId: bibliographyId } = useParams();
    const {
        bibliographies,
        dispatch,
        ACTIONS,
        font,
        savedCslFiles,
        setSavedCslFiles,
        showConfirmDialog,
        showAcceptDialog,
    } = props;
    const bibliography = bibliographies.find((bib) => bib.id === bibliographyId);

    const navigate = useNavigate();
    const [citationWindowVisible, setCitationWindowVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [intextCitationWindowVisible, setIntextCitationWindowVisible] = useState(false);
    const [LaTeXWindowVisible, setLaTeXWindowVisible] = useState(false);
    const [checkedCitations, setCheckedCitations] = useState([]); // TODO: Change checked to selected
    const [exportAll, setExportAll] = useState(false); // used for all kind of export in the master context menu
    const [moveWindowVisible, setMoveWindowVisible] = useState(false);

    useEffect(() => {
        // isChecked should not get saved, but since it's in an object that gets saved and loaded, it should be set to false when opening the bibliography page
        dispatch({ type: ACTIONS.UNCHECK_ALL_CITATIONS, payload: { bibliographyId: bibliographyId } });
    }, []);

    useEffect(() => {
        // FIXME: If you check one from two citations, it will add the unchecked one. But this doesnt happen with more than two citations
        function updateCheckedCitations() {
            setCheckedCitations(bibliography.citations.filter((cit) => cit.isChecked === true));
        }
        updateCheckedCitations();
    }, [bibliography.citations]);

    // TODO: Change this to an option in the setting that also have an accept button to prevent changing the title by accident
    function updateBibliographyTitle(event) {
        dispatch({
            type: ACTIONS.UPDATE_BIBLIOGRAPHY_FIELDS,
            payload: { bibliographyId: bibliographyId, key: "title", value: event.target.value },
        });
    }

    function openCitationWindow(sourceType, isNew = false, specificId = "") {
        let checkedCitationsIds = [...(specificId ? [specificId] : [])];
        bibliography.citations.forEach((cit) => {
            if (cit.isChecked) {
                checkedCitationsIds.push(cit.id);
            }
        });
        if (isNew)
            dispatch({
                type: ACTIONS.ADD_NEW_CITATION_TO_BIBLIOGRAPHY,
                payload: { bibliographyId: bibliographyId, sourceType: sourceType },
            });
        else if (checkedCitationsIds.length === 1)
            dispatch({
                type: ACTIONS.ADD_CITATION_TO_EDITED_CITATION,
                payload: { bibliographyId: bibliographyId, citationId: checkedCitationsIds[0] },
            });
        setCitationWindowVisible(true);
        setAddCitationMenuVisible(false);
    }

    async function handleCopyAll() {
        const formattedCitations = await citationEngine.formatCitations(
            bibliography.citations,
            bibliography.style,
            savedCslFiles,
            setSavedCslFiles,
            "text"
        );

        try {
            navigator.clipboard.writeText(formattedCitations);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }

    function handleDeleteBibliography() {
        navigate("/");
        dispatch({ type: ACTIONS.DELETE_BIBLIOGRAPHY, payload: { bibliographyId: bibliographyId } });
    }

    function searchByIdentifier() {}

    function handleImportCitation() {}

    function handleReferenceEntryCheck(citationId) {
        dispatch({
            type: ACTIONS.TOGGLE_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliographyId, citationId: citationId },
        });
    }

    function handleExportAllToLatex() {
        setExportAll(true);
        setLaTeXWindowVisible(true);
    }

    function handleMove() {
        if (bibliographies.length > 1) setMoveWindowVisible(true);
        else showAcceptDialog("No bibliographies to move", "You have no other bibliography to move citations to.");
    }

    return (
        <div className="bibliography">
            <div className="bibliography-header">
                <h3>{bibliography.style.name}</h3>
                <ContextMenu
                    icon="more_vert"
                    options={[
                        { label: "Copy all to clipboard", method: handleCopyAll },
                        {
                            label: "Export all to LaTeX", // TODO: This should be "export" only, and gives you more options to export to.
                            method: handleExportAllToLatex,
                        },

                        "DEVIDER",

                        // { label: "Merge with bibliography", method: handleMerge },
                        // { label: "Duplicate all citations", method: handleDuplicateAll },

                        // "DEVIDER",

                        // { label: "bibliography settings", method: navigate(`/${bibliographyId}/settings`) },

                        // "DEVIDER",

                        {
                            label: "Delete bibliography?",
                            method: () =>
                                showConfirmDialog(
                                    "Delete bibliography",
                                    "You'll no longer see this bibliography in your list. This will also delete related work and citations.",
                                    handleDeleteBibliography,
                                    "Delete",
                                    "Cancel"
                                ),
                            icon: "delete",
                            style: { color: "crimson" },
                        },
                    ]}
                    menuStyle={{
                        position: "absolute",
                        right: "0",
                    }}
                    buttonType={"smallButton"}
                />
            </div>

            <h1>{bibliography.title}</h1>

            {/* <AutoResizingTextarea
                value={bibliography.title}
                className="bibliography-title"
                onChange={updateBibliographyTitle}
                maxLength={200}
                rows={1}
                spellCheck="false"
            /> */}

            <ReferenceEntries
                style={{ fontFamily: font }}
                bibliography={bibliography}
                font={font}
                dispatch={dispatch}
                ACTIONS={ACTIONS}
                handleReferenceEntryCheck={handleReferenceEntryCheck}
                savedCslFiles={savedCslFiles}
                setSavedCslFiles={setSavedCslFiles}
                checkedCitations={checkedCitations}
                setLaTeXWindowVisible={setLaTeXWindowVisible}
                setExportAll={setExportAll}
                showConfirmDialog={showConfirmDialog}
                openCitationWindow={openCitationWindow}
                handleMove={handleMove}
            />

            {citationWindowVisible && bibliography.editedCitation && (
                <CitationWindow
                    bibliographies={bibliographies}
                    dispatch={dispatch}
                    ACTIONS={ACTIONS}
                    {...props}
                    setCitationWindowVisible={setCitationWindowVisible}
                />
            )}

            {intextCitationWindowVisible && <div>intext</div>}

            {LaTeXWindowVisible && (
                <LaTeXWindow
                    citations={bibliography.citations}
                    checkedCitations={checkedCitations}
                    setLaTeXWindowVisible={setLaTeXWindowVisible}
                    exportAll={exportAll}
                />
            )}

            {moveWindowVisible && (
                <div className="move-window">
                    <button onClick={() => setMoveWindowVisible(false)}>X</button>
                    {bibliographies.map((bib) => {
                        if (bib.id !== bibliographyId)
                            return (
                                <div
                                    className="bibliography-card"
                                    onClick={() => {
                                        dispatch({
                                            type: ACTIONS.DUPLICATE_SELECTED_CITATIONS,
                                            payload: { bibliographyId: bib.id, checkedCitations: checkedCitations },
                                        });
                                        setMoveWindowVisible(false);
                                    }}
                                >
                                    <h4>{bib.title}</h4>
                                    <p>{bib.style.name}</p>
                                    <p>{bib.dateCreated}</p>
                                    <p>{bib.dateModified}</p>
                                    <p>{bib.citations.length} sources</p>
                                </div>
                            );
                        return null;
                    })}
                </div>
            )}

            {addCitationMenuVisible && (
                <div
                    style={{ position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}
                    className="add-citation-menu"
                >
                    <h3>Add citation</h3>
                    <button onClick={() => setAddCitationMenuVisible(false)}>X</button>
                    <div>
                        <input
                            type="text"
                            name="search-by-identifier"
                            placeholder="Search by title, URL, DOI, or ISBN"
                        ></input>
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
            )}

            <button onClick={() => setAddCitationMenuVisible(true)}>Add citation</button>
        </div>
    );
}
