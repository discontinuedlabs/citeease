import "../css/Bibliography.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useEffect, useState } from "react";
import * as citationEngine from "./citationEngine";
import { useDocumentTitle } from "../utils";
import {
    ReferenceEntries,
    MoveWindow,
    CitationWindow,
    LaTeXWindow,
    RenameWindow,
    AddCitationMenu,
} from "./BibliographyTools";

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
    const { bibliographies, dispatch, ACTIONS, savedCslFiles, setSavedCslFiles, showConfirmDialog, showAcceptDialog } =
        props;
    const bibliography = bibliographies?.find((bib) => bib.id === bibliographyId);
    useDocumentTitle(bibliography?.title);

    const navigate = useNavigate();
    // const [collaborationOpened, setCollaborationOpened] = useState(false);
    const [citationWindowVisible, setCitationWindowVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [LaTeXWindowVisible, setLaTeXWindowVisible] = useState(false);
    const [moveWindowVisible, setMoveWindowVisible] = useState(false);
    const [renameWindowVisible, setRenameWindowVisible] = useState(false);

    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);

    // FIXME: This doesnt run when the component mounts because the bibliographyId is still defined as useIndexedDB is asynchronous
    useEffect(() => {
        // isChecked should not get saved, but since it's in an object that gets saved and loaded, it should be set to false when opening the bibliography page
        dispatch({ type: ACTIONS.UNCHECK_ALL_CITATIONS, payload: { bibliographyId: bibliographyId } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openCitationWindow(sourceType, isNew = false, specificId = "") {
        let checkedCitationsIds = [...(specificId ? [specificId] : [])];
        bibliography?.citations.forEach((cit) => {
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

    function handleSearchByIdentifier() {}

    function handleImportCitation() {}

    async function handleCopy() {
        const formattedCitations = await citationEngine.formatCitations(
            checkedCitations,
            bibliography?.style,
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

    function handleExportToLatex() {
        setLaTeXWindowVisible(true);
    }

    function handleMove() {
        if (bibliographies.length > 1) setMoveWindowVisible(true);
        else
            showConfirmDialog(
                "No bibliographies to move",
                "You have no other bibliography to move citations to. Would you like to create a new bibliography and move the selected citations to it?",
                () =>
                    dispatch({
                        type: ACTIONS.ADD_NEW_BIBLIOGRAPHY_AND_MOVE_CITATIONS,
                        payload: { checkedCitations: checkedCitations, bibliographyStyle: bibliography?.style },
                    }),
                "Create new bibliography",
                "Cancel"
            );
    }

    function handleDuplicate() {
        dispatch({
            type: ACTIONS.DUPLICATE_SELECTED_CITATIONS,
            payload: { bibliographyId: bibliography?.id, checkedCitations: checkedCitations },
        });
    }

    function handleDelete() {
        dispatch({
            type: ACTIONS.DELETE_SELECTED_CITATIONS,
            payload: { bibliographyId: bibliography?.id, checkedCitations: checkedCitations },
        });
    }

    function handleRename(value) {
        if (/^\s*$/.test(value)) {
            showAcceptDialog("Title is empty", "You cant't set the title to an emdpty value.");
        } else {
            dispatch({
                type: ACTIONS.UPDATE_BIBLIOGRAPHY_FIELDS,
                payload: { bibliographyId: bibliographyId, key: "title", value: value },
            });
        }
        setRenameWindowVisible(false);
    }

    function handleChangeStyle() {}

    // function handleOpenCollaboration() {
    //     // If it's the first time, prompts the user with a dialog explaining the benefits of collaboration.
    //     // Checks whether the user owns any collaborative bibliographies to determine if it's the first time.
    //     // If the user is not signed in, prompts them to sign in to access this feature. Once signed in, they proceed to create a unique identifier and password for the collaborative bibliography.
    //     // If the user attempts to open a bibliography that was previously set up for collaboration, they are presented with a confirmation message: "Are you sure you want to open this bibliography for collaboration?"
    //     setCollaborationOpened(true);
    // }

    // function handleCloseCollaboration() {
    //     showConfirmDialog(
    //         "Close collaboration?",
    //         "This will remove all collaborators, permanently delete the collaboration history, and revoke access foe all contributors. The bibliography will be removed from their list of accessible bibliographies. Are you sure you want to proceed? Collaboration can be opened anytime if needed.",
    //         () => setCollaborationOpened(false)
    //     );
    // }

    function handleDeleteBibliography() {
        navigate("/");
        dispatch({ type: ACTIONS.DELETE_BIBLIOGRAPHY, payload: { bibliographyId: bibliographyId } });
    }

    return (
        <div className="bibliography">
            <div className="bibliography-header">
                <h1>{bibliography?.title}</h1>
                <h3>{bibliography?.style.name.long}</h3>
                <ContextMenu
                    icon="more_vert"
                    menuStyle={{
                        position: "absolute",
                        right: "0",
                    }}
                    buttonType={"Small Button"}
                    options={[
                        ...(checkedCitations?.length !== 0
                            ? // When there are selected ciattions, only options that target citations show to the user
                              [
                                  { label: "Copy to clipboard", method: handleCopy }, // TODO: This should give options to choose the type of copied text: Text, HTML, or Markdown.
                                  {
                                      label: "Export to LaTeX",
                                      method: handleExportToLatex, // TODO: This should be "Export" only, and gives you more options to export to: LaTeX, HTML, Markdown, PDF, Word, or JSON.
                                  },

                                  "DEVIDER",

                                  { label: "Move", method: handleMove },
                                  { label: "Duplicate", method: handleDuplicate },

                                  "DEVIDER",

                                  ...(checkedCitations?.length === 1 && checkedCitations[0].content.URL
                                      ? [
                                            {
                                                label: "Visit website",
                                                method: () => window.open(checkedCitations[0].content.URL, "_blank"),
                                            },
                                            {
                                                label: "Edit",
                                                method: () => openCitationWindow(checkedCitations[0].content.type),
                                            },
                                            "DEVIDER",
                                        ]
                                      : []),

                                  {
                                      label: "Delete",
                                      method: () =>
                                          showConfirmDialog(
                                              `Delete ${checkedCitations?.length === 1 ? "citation" : "citations"}?`,
                                              `Are you sure you want to delete ${
                                                  checkedCitations?.length === 1 ? "this citation" : "these citations"
                                              }?`,
                                              handleDelete,
                                              "Delete",
                                              "Cancel"
                                          ),
                                      icon: "delete",
                                      style: { color: "crimson" },
                                  },
                              ]
                            : // When nothing is selected, only options that target the bibliography itself show to the user
                              [
                                  { label: "Rename", method: () => setRenameWindowVisible(true) },
                                  {
                                      label: "Change style",
                                      method: handleChangeStyle,
                                  },

                                  "DEVIDER",

                                  //   ...(collaborationOpened
                                  //       ? [
                                  //             {
                                  //                 label: "bibliography settings",
                                  //                 method: () => navigate(`/${bibliographyId}/settings`),
                                  //             },

                                  //             {
                                  //                 label: "Close collaboration",
                                  //                 method: handleCloseCollaboration,
                                  //             },
                                  //         ]
                                  //       : [
                                  //             {
                                  //                 label: "Open collaboration",
                                  //                 method: handleOpenCollaboration,
                                  //                 badge: { label: "test", color: "white", backgroundColor: "blue" },
                                  //             },
                                  //         ]),

                                  //   "DEVIDER",

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
                              ]),
                    ]}
                />
            </div>

            <ReferenceEntries
                bibliography={bibliography}
                dispatch={dispatch}
                ACTIONS={ACTIONS}
                savedCslFiles={savedCslFiles}
                setSavedCslFiles={setSavedCslFiles}
                openCitationWindow={openCitationWindow}
            />

            {citationWindowVisible && bibliography?.editedCitation && (
                <CitationWindow
                    bibliographies={bibliographies}
                    dispatch={dispatch}
                    ACTIONS={ACTIONS}
                    {...props}
                    setCitationWindowVisible={setCitationWindowVisible}
                />
            )}

            {LaTeXWindowVisible && (
                <LaTeXWindow
                    citations={bibliography?.citations}
                    checkedCitations={checkedCitations}
                    setLaTeXWindowVisible={setLaTeXWindowVisible}
                />
            )}

            {moveWindowVisible && (
                <MoveWindow
                    bibliographies={bibliographies}
                    bibliographyId={bibliographyId}
                    checkedCitations={checkedCitations}
                    setMoveWindowVisible={setMoveWindowVisible}
                    dispatch={dispatch}
                />
            )}

            {renameWindowVisible && <RenameWindow title={bibliography?.title} handleRename={handleRename} />}

            {addCitationMenuVisible && (
                // Since the openCitationWindow is passed to this component, make the handleSearchByIdentifier and handleImportCitation inside it
                <AddCitationMenu
                    setAddCitationMenuVisible={setAddCitationMenuVisible}
                    openCitationWindow={openCitationWindow}
                    handleSearchByIdentifier={handleSearchByIdentifier}
                    handleImportCitation={handleImportCitation}
                />
            )}

            <button onClick={() => setAddCitationMenuVisible(true)}>Add citation</button>
        </div>
    );
}
