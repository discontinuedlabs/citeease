import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { HotKeys } from "react-hotkeys";
import { useSelector } from "react-redux";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import ContextMenu from "../../components/ui/ContextMenu";
import * as citationEngine from "../../utils/citationEngine";
import {
    IntextCitationDialog,
    ReferenceEntries,
    MoveDialog,
    CitationForm,
    LaTeXDialog,
    RenameDialog,
    AddCitationMenu,
    SmartGeneratorDialog,
    CitationStylesMenu,
    TagsDialog,
    IdAndPasswordDialogVisible,
} from "./BibliographyTools";
import {
    addNewBibAndMoveSelectedCitations,
    addNewCitation,
    deleteBib,
    deleteSelectedCitations,
    duplicateSelectedCitations,
    editCitation,
    updateBibField,
    enableCollabInBib,
    reEnableCollabInBib,
    disableCollabInBib,
} from "../../data/store/slices/bibsSlice";
import { useEnhancedDispatch, useFindBib, useFindCheckedCitations } from "../../hooks/hooks.ts";
import Tag from "../../components/ui/Tag";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/ui/Icon";
import firestoreDB from "../../data/db/firebase/firebase";
import { useModal } from "../../context/ModalContext.tsx";

// TODO: The user cannot do any actions in collaborative bibliographies when they are offline
export default function Bibliography() {
    const bibliographies = useSelector((state) => state.bibliographies);
    const bibliography = useFindBib();
    const checkedCitations = useFindCheckedCitations();
    const { currentUser } = useAuth();
    const { bibId } = useParams();
    const modal = useModal();

    const [collaborationOpened, setCollaborationOpened] = useState(bibliography?.collab?.open);
    const [idAndPasswordDialogVisible, setIdAndPasswordDialogVisible] = useState(false);
    const [intextCitationDialogVisible, setIntextCitationDialogVisible] = useState(false);
    const [citationFormVisible, setCitationFormVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [LaTeXWindowVisible, setLaTeXWindowVisible] = useState(false);
    const [moveWindowVisible, setMoveWindowVisible] = useState(false);
    const [renameWindowVisible, setRenameWindowVisible] = useState(false);
    const [smartGeneratorDialogVisible, setSmartGeneratorDialogVisible] = useState(false);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [tagsDialogVisible, setTagsDialogVisible] = useState(false);
    const [searchByIdentifiersInput, setSearchByIdentifiersInput] = useState("");

    const navigate = useNavigate();
    const dispatch = useEnhancedDispatch();
    const location = useLocation();

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
        // Prioritizes showing collab.id in the URL instead of the regular id
        if (!bibliography) return;
        if (bibliography?.collab?.open && bibId !== bibliography?.collab?.id) {
            navigate(`/collab/${bibliography.collab.id}`, { replace: true });
        } else if (!bibliography?.collab?.open && bibId !== bibliography.id) {
            navigate(`/bib/${bibliography.id}`, { replace: true });
        }
    }, [bibId, bibliography?.collab?.open, location.pathname]);

    function openIntextCitationDialog() {
        setIntextCitationDialogVisible(true);
    }

    function openCitationForm(sourceType, isNew = false, specificId = "") {
        const checkedCitationsIds = [...(specificId ? [specificId] : [])];
        bibliography?.citations.forEach((cit) => {
            if (cit.isChecked) {
                checkedCitationsIds.push(cit.id);
            }
        });
        if (isNew) dispatch(addNewCitation({ bibliographyId: bibliography.id, sourceType }));
        else if (checkedCitationsIds.length === 1)
            dispatch(editCitation({ bibliographyId: bibliography.id, citationId: checkedCitationsIds[0] }));
        setCitationFormVisible(true);
        setAddCitationMenuVisible(false);
    }

    function handleSearchByIdentifiers(input) {
        setSearchByIdentifiersInput(input);
        setSmartGeneratorDialogVisible(true);
    }

    function addTagToBib(tag) {
        dispatch(
            updateBibField({
                bibliographyId: bibliography.id,
                key: "tags",
                value: [...bibliography.tags, tag],
            })
        );
    }

    function removeTagFromBib(tag) {
        dispatch(
            updateBibField({
                bibliographyId: bibliography.id,
                key: "tags",
                value: bibliography.tags.filter((prevTag) => prevTag.id !== tag.id),
            })
        );
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

    function handleMove() {
        function addNewBib() {
            dispatch(
                addNewBibAndMoveSelectedCitations({
                    checkedCitations,
                    bibliographyStyle: bibliography?.style,
                })
            );
        }
        if (bibliographies.length > 1) setMoveWindowVisible(true);
        else {
            modal.open({
                title: "No bibliographies to move",
                message:
                    "You have no other bibliography to move citations to. Would you like to create a new bibliography and move the selected citations to it?",
                actions: [
                    ["Create new bibliography", addNewBib, "autofocus"],
                    ["Cancel", () => modal.close()],
                ],
            });
        }
    }

    function handleDuplicate() {
        dispatch(duplicateSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations }));
    }

    function handleDelete() {
        dispatch(deleteSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations }));
    }

    function handleRename(value) {
        if (/^\s*$/.test(value)) {
            modal.open({
                title: "Title is empty",
                message: "You cant't set the title to an emdpty value.",
                actions: [["Accept", () => modal.close()]],
            });
        } else {
            dispatch(updateBibField({ bibliographyId: bibliography.id, key: "title", value }));
        }
    }

    async function openCollaboration(data) {
        const newCoBib = {
            ...bibliography,
            collab: {
                open: true,
                id: data.id,
                adminId: currentUser.uid,
                collaborators: [{ name: currentUser.adminName, id: currentUser.uid }],
                preferences: {},
                changelog: [],
                password: data.password,
            },
        };
        const coBibsRef = doc(firestoreDB, "coBibs", data.id);
        await setDoc(coBibsRef, { bibliography: JSON.stringify(newCoBib) });

        dispatch(
            enableCollabInBib({
                bibId: bibliography.id,
                coId: data.id,
                password: data.password,
            })
        );
        setCollaborationOpened(true);
    }

    async function reopenCollaboration() {
        const reopenedCoBib = {
            ...bibliography,
            collab: {
                ...bibliography.collab,
                open: true,
            },
        };
        const coBibsRef = doc(firestoreDB, "coBibs", bibliography.collab.id);
        await setDoc(coBibsRef, { bibliography: JSON.stringify(reopenedCoBib) });
        dispatch(reEnableCollabInBib({ bibId: bibliography.id }));
        setCollaborationOpened(true);
    }

    async function closeCollaboration() {
        await deleteDoc(doc(firestoreDB, "coBibs", bibliography.collab.id));
        dispatch(disableCollabInBib({ bibId: bibliography.id }));
        setCollaborationOpened(false);
    }

    function handleOpenCollaboration() {
        if (!currentUser) {
            // If not logged in
            modal.open({
                title: "Login required",
                message: "You need to log in first to use this feature.",
                actions: [
                    ["Log in", () => navigate("/login"), "autofocus"],
                    ["Cancel", () => modal.close()],
                ],
            });
        } else if (bibliography?.collab) {
            // When attempting to open a bibliography that was previously set up for collaboration
            modal.open({
                title: "Open collaboration?",
                message: "Are you sure you want to open this bibliography for collaboration?",
                actions: [
                    ["Open", reopenCollaboration, "autofocus"],
                    ["Cancel", () => modal.close()],
                ],
            });
        } else {
            const firstTimeEver = bibliographies.some((bib) => bib?.collab);
            if (firstTimeEver) {
                // First time to open collaboration in any bibliography
                modal.open({
                    title: "Open collaboration?",
                    message: "Are you sure you want to open this bibliography for collaboration?",
                    actions: [
                        ["Open", () => setIdAndPasswordDialogVisible(true), "autofocus"],
                        ["Cancel", () => modal.close()],
                    ],
                });
            } else {
                // First time to open collaboration for the current bibliography only
                modal.open({
                    title: "Open collaboration?",
                    message: "Are you sure you want to open this bibliography for collaboration?",
                    actions: [
                        ["Open", () => setIdAndPasswordDialogVisible(true), "autofocus"],
                        ["Cancel", () => modal.close()],
                    ],
                });
            }
        }
    }

    function handleCloseCollaboration() {
        modal.open({
            title: "Close collaboration?",
            message:
                "This will remove all collaborators, permanently delete the collaboration history, and revoke access foe all contributors. The bibliography will be removed from their list of accessible bibliographies. Are you sure you want to proceed? Collaboration can be opened anytime if needed.",
            actions: [
                ["Close collaboration", closeCollaboration, "autofocus"],
                ["Cancel", () => modal.close()],
            ],
        });
    }

    function handleDeleteBibliography() {
        navigate("/");
        dispatch(deleteBib({ bibliographyId: bibliography.id }));
    }

    return (
        <div className="mx-auto max-w-[50rem]">
            <HotKeys keyMap={keyMap}>
                <div>
                    <div className="flex justify-between items-center">
                        <div>
                            {bibliography?.collab?.open && (
                                <div className="text-md font-bold w-fit rounded-md transition duration-150 ease-in-out hover:bg-neutral-transparentGray">
                                    <Icon name="group" /> {bibliography?.collab?.id}
                                </div>
                            )}
                            <button type="button" style={{ all: "unset" }} onClick={() => setRenameWindowVisible(true)}>
                                <h1 className="m-0 rounded-md transition duration-150 ease-in-out hover:bg-neutral-transparentGray">
                                    {bibliography?.title}
                                </h1>
                            </button>
                        </div>

                        {/* eslint-disable indent */}
                        <ContextMenu
                            className="self-start"
                            icon="more_vert"
                            menuStyle={{
                                position: "absolute",
                                right: "0",
                            }}
                            buttonType="Small Button"
                            options={[
                                ...(checkedCitations?.length !== 0
                                    ? // When there are selected ciattions, only options that target citations show to the user
                                      [
                                          { label: "Copy to clipboard", method: handleCopy }, // TODO: This should give options to choose the type of copied text: Text, HTML, or Markdown.
                                          {
                                              label: "Export to LaTeX",
                                              method: () => setLaTeXWindowVisible(true), // TODO: This should be "Export" only, and gives you more options to export to: LaTeX, HTML, Markdown, PDF, Word, or JSON.
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
                                                        method: () =>
                                                            openCitationForm(checkedCitations[0].content.type),
                                                    },
                                                    "DEVIDER",
                                                ]
                                              : []),

                                          {
                                              label: "Delete",
                                              method: () =>
                                                  modal.open({
                                                      title: `Delete ${
                                                          checkedCitations?.length === 1 ? "citation" : "citations"
                                                      }?`,
                                                      message: `Are you sure you want to delete ${
                                                          checkedCitations?.length === 1
                                                              ? "this citation"
                                                              : "these citations"
                                                      }?`,
                                                      actions: [
                                                          ["Delete", handleDelete, "autofocus"],
                                                          ["Cancel", () => modal.close()],
                                                      ],
                                                  }),
                                              icon: "delete",
                                              style: { color: "crimson" },
                                          },
                                      ]
                                    : // When nothing is selected, only options that target the bibliography itself show to the user
                                      [
                                          { label: "Rename", method: () => setRenameWindowVisible(true) },
                                          { label: "Tags", method: () => setTagsDialogVisible(true) },
                                          {
                                              label: "Change style",
                                              method: () => setCitationStyleMenuVisible(true),
                                          },

                                          "DEVIDER",

                                          {
                                              label: "Preferences",
                                              method: () => navigate(`/${bibliography.id}/preferences`),
                                          },

                                          ...(collaborationOpened
                                              ? [
                                                    {
                                                        label: "Close collaboration",
                                                        method: handleCloseCollaboration,
                                                    },
                                                ]
                                              : [
                                                    {
                                                        label: "Open collaboration",
                                                        method: handleOpenCollaboration,
                                                        badge: {
                                                            label: "test",
                                                            color: "white",
                                                            backgroundColor: "blue",
                                                        },
                                                    },
                                                ]),

                                          "DEVIDER",

                                          {
                                              label: "Delete bibliography",
                                              method: () =>
                                                  modal.open({
                                                      title: "Delete bibliography?",
                                                      message:
                                                          "You'll no longer see this bibliography in your list. This will also delete related work and citations.",
                                                      actions: [
                                                          ["Delete", handleDeleteBibliography, "autofocus"],
                                                          ["Cancel", () => modal.close()],
                                                      ],
                                                  }),
                                              icon: "delete",
                                              style: { color: "crimson" },
                                          },
                                      ]),
                            ]}
                        />
                    </div>
                    <button type="button" style={{ all: "unset" }} onClick={() => setCitationStyleMenuVisible(true)}>
                        <h3 className="w-fit rounded-md transition duration-150 ease-in-out hover:bg-neutral-transparentGray">
                            {bibliography?.style.name.long}
                        </h3>
                    </button>

                    <div className="flex gap-1 flex-wrap">
                        {bibliography?.tags?.map((tag) => (
                            <Tag key={nanoid()} tagProps={tag} onClick={() => setTagsDialogVisible(true)} />
                        ))}
                    </div>
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
                    <CitationForm {...{ setCitationFormVisible }} />
                )}

                {citationStyleMenuVisible && (
                    <CitationStylesMenu
                        {...{
                            setCitationStyleMenuVisible,
                            onStyleSelected: (style) =>
                                dispatch(
                                    updateBibField({
                                        bibliographyId: bibliography.id,
                                        key: "style",
                                        value: style,
                                    })
                                ),
                        }}
                    />
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
                    // TODO: Since the openCitationForm is passed to this component, make the handleSearchByIdentifiers and handleImportCitation inside it
                    <AddCitationMenu
                        {...{
                            setAddCitationMenuVisible,
                            openCitationForm,
                            handleSearchByIdentifiers,
                            handleImportCitation,
                        }}
                    />
                )}

                {tagsDialogVisible && (
                    <TagsDialog
                        {...{ setTagsDialogVisible, onTagAdded: addTagToBib, onTagRemoved: removeTagFromBib }}
                    />
                )}

                {idAndPasswordDialogVisible && (
                    <IdAndPasswordDialogVisible
                        setIsVisible={setIdAndPasswordDialogVisible}
                        onSubmit={openCollaboration}
                    />
                )}

                <button type="button" onClick={() => setAddCitationMenuVisible(true)}>
                    Add citation
                </button>
            </HotKeys>
        </div>
    );
}
