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
import MoveWindow from "./MoveWindow";
import { useDocumentTitle } from "../utils";

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
        CITATION_STYLES,
        dispatch,
        ACTIONS,
        settings,
        savedCslFiles,
        setSavedCslFiles,
        showConfirmDialog,
        showAcceptDialog,
    } = props;
    const bibliography = bibliographies.find((bib) => bib.id === bibliographyId);
    useDocumentTitle(bibliography.title);

    const navigate = useNavigate();
    const [collaborationOpened, setCollaborationOpened] = useState(false);
    const [citationWindowVisible, setCitationWindowVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [intextCitationWindowVisible, setIntextCitationWindowVisible] = useState(false);
    const [LaTeXWindowVisible, setLaTeXWindowVisible] = useState(false);
    const [checkedCitations, setCheckedCitations] = useState([]); // TODO: Change checked to selected
    const [applyOnAll, setApplyOnAll] = useState(false); // used for some settings in the bibliography context menu
    const [moveWindowVisible, setMoveWindowVisible] = useState(false);
    const [renameWindowVisible, setRenameWindowVisible] = useState(false);

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

    function handleRename(event) {
        dispatch({
            type: ACTIONS.UPDATE_BIBLIOGRAPHY_FIELDS,
            payload: { bibliographyId: bibliographyId, key: "title", value: event.target[0].value },
        });
        setRenameWindowVisible(false);
    }

    function handleChangeStyle() {}

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
        setApplyOnAll(true);
        setLaTeXWindowVisible(true);
    }

    function handleMove(applyOnAll = false) {
        setApplyOnAll(applyOnAll);
        if (bibliographies.length > 1) setMoveWindowVisible(true);
        else showAcceptDialog("No bibliographies to move", "You have no other bibliography to move citations to.");
    }

    function handleOpenCollaboration() {
        /*
         * If it's the first time, prompts the user with a dialog explaining the benefits of collaboration.
         * Checks whether the user owns any collaborative bibliographies to determine if it's the first time.
         * If the user is not signed in, prompts them to sign in to access this feature. Once signed in, they proceed to create a unique identifier and password for the collaborative bibliography.
         * If the user attempts to open a bibliography that was previously set up for collaboration, they are presented with a confirmation message: "Are you sure you want to open this bibliography for collaboration?"
         */
        setCollaborationOpened(true);
    }

    function handleCloseCollaboration() {
        showConfirmDialog(
            "Close collaboration?",
            "This will remove all collaborators, permanently delete the collaboration history, and revoke access foe all contributors. The bibliography will be removed from their list of accessible bibliographies. Are you sure you want to proceed? Collaboration can be opened anytime if needed.",
            () => setCollaborationOpened(false)
        );
    }

    return (
        <div className="bibliography">
            <div className="bibliography-header">
                <h1>{bibliography.title}</h1>
                <h3>{bibliography.style.name}</h3>
                <ContextMenu
                    icon="more_vert"
                    menuStyle={{
                        position: "absolute",
                        right: "0",
                    }}
                    buttonType={"Small Button"}
                    options={[
                        { label: "Rename", method: () => setRenameWindowVisible(true) },
                        {
                            label: "Change style",
                            method: [
                                CITATION_STYLES.map((style) => {
                                    return {
                                        label: style.name,
                                        method: () =>
                                            dispatch({
                                                type: ACTIONS.UPDATE_BIBLIOGRAPHY_FIELDS,
                                                payload: { bibliographyId: bibliographyId, key: "style", value: style },
                                            }),
                                    };
                                }),
                            ],
                        },

                        "DEVIDER",

                        { label: "Copy to clipboard", method: handleCopyAll },
                        {
                            label: "Export to LaTeX", // TODO: This should be "export" only, and gives you more options to export to.
                            method: handleExportAllToLatex,
                        },

                        "DEVIDER",

                        ...(collaborationOpened
                            ? [
                                  {
                                      label: "bibliography settings",
                                      method: () => navigate(`/${bibliographyId}/settings`),
                                  },

                                  {
                                      label: "Close collaboration",
                                      method: handleCloseCollaboration,
                                  },
                              ]
                            : [
                                  {
                                      label: "Open collaboration",
                                      method: handleOpenCollaboration,
                                      badge: { label: "test", color: "white", backgroundColor: "blue" },
                                  },
                              ]),

                        "DEVIDER",

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
                />
            </div>

            {/* <AutoResizingTextarea
                value={bibliography.title}
                className="bibliography-title"
                onChange={updateBibliographyTitle}
                maxLength={200}
                rows={1}
                spellCheck="false"
            /> */}

            <ReferenceEntries
                bibliography={bibliography}
                settings={settings}
                dispatch={dispatch}
                ACTIONS={ACTIONS}
                handleReferenceEntryCheck={handleReferenceEntryCheck}
                savedCslFiles={savedCslFiles}
                setSavedCslFiles={setSavedCslFiles}
                checkedCitations={checkedCitations}
                setLaTeXWindowVisible={setLaTeXWindowVisible}
                setApplyOnAll={setApplyOnAll}
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
                    setApplyOnAll={setApplyOnAll}
                />
            )}

            {moveWindowVisible && (
                <MoveWindow
                    bibliographies={bibliographies}
                    bibliographyId={bibliographyId}
                    citations={bibliography.citations}
                    checkedCitations={checkedCitations}
                    setMoveWindowVisible={setMoveWindowVisible}
                    applyOnAll={applyOnAll}
                    dispatch={dispatch}
                    showConfirmDialog={showConfirmDialog}
                />
            )}

            {renameWindowVisible && (
                <form className="rename-window" onSubmit={handleRename}>
                    <input type="text" placeholder={bibliography.title} />
                    <button type="submit">Rename</button>
                    <button onClick={() => setRenameWindowVisible(false)}>Cancel</button>
                </form>
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
