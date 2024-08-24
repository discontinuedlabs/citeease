import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import * as citationEngine from "../../utils/citationEngine";
import {
    IntextCitationDialog,
    ReferenceEntries,
    MoveDialog,
    CitationForm,
    RenameDialog,
    AddCitationMenu,
    SmartGeneratorDialog,
    CitationStylesMenu,
    TagsDialog,
    IdAndPasswordDialogVisible,
    IconsMenu,
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
import useOnlineStatus, { useEnhancedDispatch, useFindBib, useKeyboardShortcuts } from "../../hooks/hooks.tsx";
import { useAuth } from "../../context/AuthContext";
import firestoreDB from "../../data/db/firebase/firebase";
import { ChipSet, Fab, Icon, List, TopBar } from "../../components/ui/MaterialComponents";
import { useToast } from "../../context/ToastContext.tsx";
import {
    exportToBibJson,
    exportToCslJson,
    exportToHtml,
    exportToLatex,
    exportToMd,
    exportToTxt,
} from "../../utils/exportUtils.ts";
import { useDialog } from "../../context/DialogContext.tsx";
import locales from "../../assets/json/locales.json";
import { uid } from "../../utils/utils.ts";

// TODO: The user cannot do any actions in collaborative bibliographies when they are offline
export default function Bibliography() {
    const { data: bibliographies, loadedFromIndexedDB: bibsLoaded } = useSelector((state) => state.bibliographies);
    const bibliography = useFindBib();
    const checkedCitations = bibliography?.citations.filter((cit) => cit.isChecked);
    const { currentUser } = useAuth();
    const { bibId } = useParams();
    const dialog = useDialog();
    const navigate = useNavigate();
    const dispatch = useEnhancedDispatch();
    const location = useLocation();
    const isOnline = useOnlineStatus();
    const toast = useToast();

    const [collaborationOpened, setCollaborationOpened] = useState(bibliography?.collab?.open);
    const [idAndPasswordDialogVisible, setIdAndPasswordDialogVisible] = useState(false);
    const [intextCitationDialogVisible, setIntextCitationDialogVisible] = useState(false);
    const [citationFormVisible, setCitationFormVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [moveWindowVisible, setMoveWindowVisible] = useState(false);
    const [renameWindowVisible, setRenameWindowVisible] = useState(false);
    const [smartGeneratorDialogVisible, setSmartGeneratorDialogVisible] = useState(false);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [tagsDialogVisible, setTagsDialogVisible] = useState(false);
    const [searchByIdentifiersInput, setSearchByIdentifiersInput] = useState("");
    const [iconsMenuVisible, setIconsMenuVisible] = useState(false);

    useEffect(() => {
        if (bibsLoaded && !bibliography) {
            navigate("/");
            toast.show({ message: "No such bibliography", color: "red", icon: "error" });
        }
    }, [bibsLoaded]);

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
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

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
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        setSearchByIdentifiersInput(input);
        setSmartGeneratorDialogVisible(true);
    }

    function addTagToBib(tag) {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        dispatch(
            updateBibField({
                bibliographyId: bibliography.id,
                key: "tags",
                value: [...bibliography.tags, tag],
            })
        );
    }

    function removeTagFromBib(tag) {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        dispatch(
            updateBibField({
                bibliographyId: bibliography.id,
                key: "tags",
                value: bibliography.tags.filter((prevTag) => prevTag.id !== tag.id),
            })
        );
    }

    function handleImportCitation() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return undefined;
        }
        return undefined;
    }

    async function handleCopy() {
        if (checkedCitations.length !== 0) {
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
            dialog.show({
                headline: "No bibliographies to move",
                content:
                    "You have no other bibliography to move citations to. Would you like to create a new bibliography and move the selected citations to it?",
                actions: [
                    ["Cancel", () => dialog.close()],
                    ["Create new bibliography", addNewBib],
                ],
            });
        }
    }

    function handleDuplicate() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        if (checkedCitations.length !== 0) {
            dispatch(duplicateSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations }));
        }
    }

    function handleDeleteSelectedCitations() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        if (checkedCitations.length !== 0) {
            dialog.show({
                headline: `Delete ${checkedCitations?.length === 1 ? "citation" : "citations"}?`,
                content: `Are you sure you want to delete ${
                    checkedCitations?.length === 1 ? "this citation" : "these citations"
                }?`,
                actions: [
                    ["Cancel", () => dialog.close()],
                    [
                        "Delete",
                        () => dispatch(deleteSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations })),
                    ],
                ],
            });
        }
    }

    function handleRename(value) {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        if (/^\s*$/.test(value)) {
            dialog.show({
                headline: "Title is empty",
                content: "You cant't set the title to an emdpty value.",
                actions: [["Ok", () => dialog.close()]],
            });
        } else {
            dispatch(updateBibField({ bibliographyId: bibliography.id, key: "title", value }));
        }
    }

    async function openCollaboration(data) {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

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
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

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
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        await deleteDoc(doc(firestoreDB, "coBibs", bibliography.collab.id));
        dispatch(disableCollabInBib({ bibId: bibliography.id }));
        setCollaborationOpened(false);
    }

    function handleOpenCollaboration() {
        if (!currentUser) {
            // If not logged in
            dialog.show({
                headline: "Login required",
                content: "You need to log in first to use this feature.",
                actions: [
                    ["Cancel", () => dialog.close()],
                    ["Log in", () => navigate("/login")],
                ],
            });
        } else if (bibliography?.collab) {
            // When attempting to open a bibliography that was previously set up for collaboration
            dialog.show({
                headline: "Open collaboration?",
                content: "Are you sure you want to open this bibliography for collaboration?",
                actions: [
                    ["Cancel", () => dialog.close()],
                    ["Open", reopenCollaboration],
                ],
            });
        } else {
            const firstTimeEver = bibliographies.some((bib) => bib?.collab);
            if (firstTimeEver) {
                // First time to open collaboration in any bibliography
                dialog.show({
                    headline: "Open collaboration?",
                    content: "Are you sure you want to open this bibliography for collaboration?",
                    actions: [
                        ["Cancel", () => dialog.close()],
                        ["Open", () => setIdAndPasswordDialogVisible(true)],
                    ],
                });
            } else {
                // First time to open collaboration for the current bibliography only
                dialog.show({
                    headline: "Open collaboration?",
                    content: "Are you sure you want to open this bibliography for collaboration?",
                    actions: [
                        ["Cancel", () => dialog.close()],
                        ["Open", () => setIdAndPasswordDialogVisible(true)],
                    ],
                });
            }
        }
    }

    function handleCloseCollaboration() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        dialog.show({
            headline: "Close collaboration?",
            content:
                "This will remove all collaborators, permanently delete the collaboration history, and revoke access foe all contributors. The bibliography will be removed from their list of accessible bibliographies. Are you sure you want to proceed? Collaboration can be opened anytime if needed.",
            actions: [
                ["Cancel", () => dialog.close()],
                ["Close collaboration", closeCollaboration],
            ],
        });
    }

    async function handleLeaveCollaboration() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        function leave() {
            const coBibsRef = doc(firestoreDB, "coBibs", bibliography.collab.id);
            const newCoBib = {
                ...bibliography,
                collab: {
                    ...bibliography.collab,
                    collaborators: bibliography.collab.collaborators.filter((co) => co.id !== currentUser.uid),
                },
            };

            setDoc(coBibsRef, { bibliography: JSON.stringify(newCoBib) })
                .then(() => {
                    navigate("/");
                    dispatch(deleteBib({ bibliographyId: bibliography.id }));
                })
                .catch((error) => {
                    toast.show({
                        message: `Failed to leave ${bibliography.title}. Try again later.`,
                        icon: "error",
                        color: "red",
                    });
                    console.error(error);
                });
        }

        dialog.show({
            headline: `Leave ${bibliography.title}?`,
            content: "Are you sure you want to leave this collaborative bibliography?",
            actions: [
                ["Cancel", () => dialog.close()],
                ["Leave", leave],
            ],
        });
    }

    function handleDeleteBibliography() {
        dialog.show({
            headline: "Delete bibliography?",
            content:
                "You'll no longer see this bibliography in your list. This will also delete related work and citations.",
            actions: [
                ["Cancel", () => dialog.close()],
                [
                    "Delete",
                    () => {
                        navigate("/");
                        dispatch(deleteBib({ bibliographyId: bibliography.id }));
                    },
                ],
            ],
        });
    }

    function handleChangeLocale() {
        const dialogId = uid();
        dialog.show({
            id: dialogId,
            headline: "Change locale",
            content: (
                <List
                    items={locales.map((locale) => {
                        return {
                            title: `${locale.code} (${locale.label})`,
                            onClick: () => {
                                dispatch(
                                    updateBibField({
                                        bibliographyId: bibliography.id,
                                        key: "locale",
                                        value: locale.code,
                                    })
                                );
                                dialog.close(dialogId);
                            },
                        };
                    })}
                />
            ),
            actions: [
                ["Manage locales", () => navigate("/settings")],
                ["Cancel", () => dialog.close()],
            ],
        });
    }

    function getConditionalOptionsWhenCitationsSelected() {
        if (checkedCitations?.length === 1) {
            const options = [{ headline: "Edit", onClick: () => openCitationForm(checkedCitations[0].content.type) }];

            if (checkedCitations[0].content.URL) {
                options.push({
                    headline: "Visit website",
                    onClick: () => window.open(checkedCitations[0].content.URL, "_blank"),
                });
            }

            return options;
        }
        return [];
    }

    const optionsWhenCitationsSelected = [
        { headline: "Copy to clipboard", onClick: handleCopy }, // TODO: This should give options to choose the type of copied text: Text, HTML, or Markdown.
        {
            headline: "Export",
            subItems: [
                {
                    headline: "Plain text",
                    onClick: () => exportToTxt(checkedCitations, bibliography.style, { fileName: bibliography.title }),
                },
                {
                    headline: "LaTeX",
                    subItems: [
                        {
                            headline: "BibTex",
                            onClick: () =>
                                exportToLatex(checkedCitations, "bibtex", {
                                    fileName: bibliography.title,
                                }),
                        },
                        {
                            headline: "BibLaTeX",
                            onClick: () =>
                                exportToLatex(checkedCitations, "biblatex", {
                                    fileName: bibliography.title,
                                }),
                        },
                        {
                            headline: "BibTXT",
                            onClick: () =>
                                exportToLatex(checkedCitations, "bibtxt", {
                                    fileName: bibliography.title,
                                }),
                        },
                    ],
                },
                {
                    headline: "HTML",
                    onClick: () => exportToHtml(checkedCitations, bibliography.style, { fileName: bibliography.title }),
                },
                {
                    headline: "Markdown",
                    onClick: () => exportToMd(checkedCitations, bibliography.style, { fileName: bibliography.title }),
                },
                {
                    headline: "JSON",
                    subItems: [
                        {
                            headline: "CSL-JSON",
                            onClick: () => exportToCslJson(checkedCitations, { fileName: bibliography.title }),
                        },
                        {
                            headline: "BibJSON",
                            onClick: () => exportToBibJson(checkedCitations, { fileName: bibliography.title }),
                        },
                    ],
                },
            ],
        },
        { headline: "Move", onClick: handleMove },
        { headline: "Duplicate", onClick: handleDuplicate },
        { headline: "Delete", onClick: handleDeleteSelectedCitations },
    ].concat(getConditionalOptionsWhenCitationsSelected());

    function getConditionalOptionsWhenNothingSelected() {
        // Options for admin of collaborative bibliographies
        if (collaborationOpened && bibliography?.collab?.adminId === currentUser.uid) {
            return [
                { headline: "Tags", onClick: () => setTagsDialogVisible(true) },
                { headline: "Rename bibliography", onClick: () => setRenameWindowVisible(true) },
                { headline: "Change icon", onClick: () => setIconsMenuVisible(true) },
                { headline: "Change style", onClick: () => setCitationStyleMenuVisible(true) },
                { headline: "Change locale", onClick: handleChangeLocale },
                { headline: "Bibliography settings", onClick: () => navigate(`/bib/${bibliography.id}/settings`) },
                { headline: "Close collaboration", onClick: handleCloseCollaboration },
            ];
        }

        // Options for collaborators
        if (
            collaborationOpened &&
            bibliography?.collab?.collaborators.some((collaborator) => collaborator.id === currentUser.uid)
        ) {
            return [{ headline: "Leave collaboration", onClick: handleLeaveCollaboration }];
        }

        // Options if bibliography not open for collaboration
        if (!collaborationOpened) {
            return [
                { headline: "Tags", onClick: () => setTagsDialogVisible(true) },
                { headline: "Rename bibliography", onClick: () => setRenameWindowVisible(true) },
                { headline: "Change icon", onClick: () => setIconsMenuVisible(true) },
                { headline: "Change style", onClick: () => setCitationStyleMenuVisible(true) },
                { headline: "Change locale", onClick: handleChangeLocale },
                { headline: "Bibliography settings", onClick: () => navigate(`/bib/${bibliography.id}/settings`) },
                { headline: "Open collaboration", onClick: handleOpenCollaboration },
                { headline: "Delete bibliography", onClick: handleDeleteBibliography },
            ];
        }

        return [];
    }

    const optionsWhenNothingSelected = [].concat(getConditionalOptionsWhenNothingSelected());

    useKeyboardShortcuts({
        // "ctrl+a": () => dispatch(handleMasterEntriesCheckbox({ bibliographyId: bibliography?.id })),
        // "delete|backspace": handleDeleteSelectedCitations,
        // "ctrl+d": handleDuplicate,
        // "ctrl+c": handleCopy,
        // "ctrl+z": undo,
        // "ctrl+y": redo,
        // "ctrl+e": exportSelected,
        // "ctrl+m": move,
        // f2: rename,
        // "ctrl+s": changeStyle,
        // "ctrl+n": addCitation,
    });

    return (
        <div className="mx-auto max-w-[50rem]">
            <TopBar
                icon={bibliography?.icon}
                headline={bibliography?.title}
                description={
                    <>
                        <>
                            {bibliography?.collab?.open ? <Icon name="group" className="text-xl" /> : ""}
                            {`${bibliography?.collab?.open ? ` ${bibliography?.collab?.id} • ` : ""}${bibliography?.style.name.long}`}
                        </>

                        <ChipSet
                            chips={bibliography?.tags?.map(({ label, color }) => ({ label, color }))}
                            style={{ marginTop: bibliography?.tags?.length === 0 ? "0" : "0.5rem" }}
                        />
                    </>
                }
                options={[
                    ...(checkedCitations?.length !== 0 ? optionsWhenCitationsSelected : optionsWhenNothingSelected),
                ]}
            />

            <ReferenceEntries
                {...{
                    openCitationForm,
                    openIntextCitationDialog,
                }}
            />

            {intextCitationDialogVisible && checkedCitations.length !== 0 && (
                <IntextCitationDialog {...{ setIntextCitationDialogVisible }} />
            )}

            {citationFormVisible && bibliography?.editedCitation && <CitationForm {...{ setCitationFormVisible }} />}

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
                <TagsDialog {...{ setTagsDialogVisible, onTagAdded: addTagToBib, onTagRemoved: removeTagFromBib }} />
            )}

            {idAndPasswordDialogVisible && (
                <IdAndPasswordDialogVisible setIsVisible={setIdAndPasswordDialogVisible} onSubmit={openCollaboration} />
            )}

            {iconsMenuVisible && (
                <IconsMenu
                    setIsVisible={setIconsMenuVisible}
                    onSubmit={(chosenIcon) =>
                        dispatch(updateBibField({ bibliographyId: bibliography.id, key: "icon", value: chosenIcon }))
                    }
                />
            )}

            <Fab
                label="Add citation"
                icon="add"
                variant="tertiary"
                className="fixed bottom-5 right-5"
                onClick={() => setAddCitationMenuVisible(true)}
            />
        </div>
    );
}
