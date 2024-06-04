import { useNavigate } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useEffect, useState } from "react";
import * as citationEngine from "../utils/citationEngine";
import {
    IntextCitationDialog,
    ReferenceEntries,
    MoveDialog,
    CitationForm,
    LaTeXDialog,
    RenameDialog,
    AddCitationMenu,
    SmartGeneratorDialog,
} from "./BibliographyTools";
import { HotKeys } from "react-hotkeys";
import { useDispatch, useSelector } from "react-redux";
import {
    addNewBibAndMoveSelectedCitations,
    addNewCitation,
    deleteBib,
    deleteSelectedCitations,
    duplicateSelectedCitations,
    editCitation,
    loadFromIndexedDB,
    updateBibField,
} from "../store/slices/bibsSlice";
import { useFindBib, useFindCheckedCitations } from "../hooks/hooks";

export const SOURCE_TYPES = {
    ARTICLE_JOURNAL: {
        label: "Journal article",
        code: "article-journal",
    },
    BOOK: { label: "Book", code: "book" },
    WEBPAGE: { label: "Webpage", code: "webpage" },
};

export default function Bibliography(props) {
    const { showConfirmDialog, showAcceptDialog } = props;
    const bibliographies = useSelector((state) => state.bibliographies);
    const bibliography = useFindBib();
    const checkedCitations = useFindCheckedCitations();

    // const [collaborationOpened, setCollaborationOpened] = useState(false);
    const [intextCitationDialogVisible, setIntextCitationDialogVisible] = useState(false);
    const [citationFormVisible, setCitationFormVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [LaTeXWindowVisible, setLaTeXWindowVisible] = useState(false);
    const [moveWindowVisible, setMoveWindowVisible] = useState(false);
    const [renameWindowVisible, setRenameWindowVisible] = useState(false);
    const [smartGeneratorDialogVisible, setSmartGeneratorDialogVisible] = useState(false);
    const [searchByIdentifiersInput, setSearchByIdentifiersInput] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const keyMap = {
        // "ctrl+a": selectAll,
        // "delete|backspace": deleteSelected,
        // "ctrl+d": duplicate,
        // "ctrl+c": copy,
        // "ctrl+z": undo,
        // "ctrl+y": redo,
        // "ctrl+e": exportSelected,
        // "ctrl+m": move,
        // f2: rename,
        // "ctrl+s": changeStyle,
        // "ctrl+n": addCitation,
    };

    useEffect(() => {
        dispatch(loadFromIndexedDB());
    }, [dispatch]);

    function openIntextCitationDialog() {
        setIntextCitationDialogVisible(true);
    }

    function openCitationForm(sourceType, isNew = false, specificId = "") {
        let checkedCitationsIds = [...(specificId ? [specificId] : [])];
        bibliography?.citations.forEach((cit) => {
            if (cit.isChecked) {
                checkedCitationsIds.push(cit.id);
            }
        });
        if (isNew) dispatch(addNewCitation({ bibliographyId: bibliography.id, sourceType: sourceType }));
        else if (checkedCitationsIds.length === 1)
            dispatch(editCitation({ bibliographyId: bibliography.id, citationId: checkedCitationsIds[0] }));
        setCitationFormVisible(true);
        setAddCitationMenuVisible(false);
    }

    function handleSearchByIdentifiers(input) {
        setSearchByIdentifiersInput(input);
        setSmartGeneratorDialogVisible(true);
    }

    function handleImportCitation() {}

    async function handleCopy() {
        const formattedCitations = await citationEngine.formatBibliography(
            checkedCitations,
            bibliography?.style,
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
                    dispatch(
                        addNewBibAndMoveSelectedCitations({
                            checkedCitations,
                            bibliographyStyle: bibliography?.style,
                        })
                    ),
                "Create new bibliography",
                "Cancel"
            );
    }

    function handleDuplicate() {
        dispatch(duplicateSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations }));
    }

    function handleDelete() {
        dispatch(deleteSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations }));
    }

    function handleRename(value) {
        if (/^\s*$/.test(value)) {
            showAcceptDialog("Title is empty", "You cant't set the title to an emdpty value.");
        } else {
            dispatch(updateBibField({ bibliographyId: bibliography.id, key: "title", value: value }));
        }
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
        dispatch(deleteBib({ bibliographyId: bibliography.id }));
    }

    return (
        <div className="bibliography">
            <HotKeys keyMap={keyMap}>
                <div className="flex justify-between items-center">
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

                                      ...(checkedCitations?.length === 1
                                          ? [
                                                ...(checkedCitations[0].content.URL
                                                    ? [
                                                          {
                                                              label: "Visit website",
                                                              method: () =>
                                                                  window.open(
                                                                      checkedCitations[0].content.URL,
                                                                      "_blank"
                                                                  ),
                                                          },
                                                      ]
                                                    : []),
                                                {
                                                    label: "Edit",
                                                    method: () => openCitationForm(checkedCitations[0].content.type),
                                                },
                                                "DEVIDER",
                                            ]
                                          : []),

                                      {
                                          label: "Delete",
                                          method: () =>
                                              showConfirmDialog(
                                                  `Delete ${
                                                      checkedCitations?.length === 1 ? "citation" : "citations"
                                                  }?`,
                                                  `Are you sure you want to delete ${
                                                      checkedCitations?.length === 1
                                                          ? "this citation"
                                                          : "these citations"
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
                    {...{
                        openCitationForm,
                        openIntextCitationDialog,
                    }}
                />

                {intextCitationDialogVisible && checkedCitations.length !== 0 && (
                    <IntextCitationDialog {...{ setIntextCitationDialogVisible }} />
                )}

                {citationFormVisible && bibliography?.editedCitation && (
                    <CitationForm {...{ showAcceptDialog, setCitationFormVisible }} />
                )}

                {LaTeXWindowVisible && <LaTeXDialog {...{ setLaTeXWindowVisible }} />}

                {moveWindowVisible && <MoveDialog {...{ setMoveWindowVisible }} />}

                {renameWindowVisible && (
                    <RenameDialog {...{ title: bibliography?.title, setRenameWindowVisible, handleRename }} />
                )}

                {smartGeneratorDialogVisible && searchByIdentifiersInput.length && (
                    <SmartGeneratorDialog
                        {...{
                            searchByIdentifiersInput,
                            setSmartGeneratorDialogVisible,
                        }}
                    />
                )}

                {addCitationMenuVisible && (
                    // Since the openCitationForm is passed to this component, make the handleSearchByIdentifiers and handleImportCitation inside it
                    <AddCitationMenu
                        {...{
                            setAddCitationMenuVisible,
                            openCitationForm,
                            handleSearchByIdentifiers,
                            handleImportCitation,
                        }}
                    />
                )}

                <button onClick={() => setAddCitationMenuVisible(true)}>Add citation</button>
            </HotKeys>
        </div>
    );
}
