import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import * as citationEngine from "../../utils/citationEngine";
import {
    ReferenceEntries,
    MoveDialog,
    CitationForm,
    AddCitationMenu,
    CitationStylesMenu,
    TagsDialog,
    IdAndPasswordDialogVisible,
    IconsMenu,
} from "./BibliographyTools";
import {
    addNewBibAndMoveSelectedCitations,
    deleteBib,
    deleteSelectedCitations,
    duplicateSelectedCitations,
    updateBibField,
    enableCollabInBib,
    reEnableCollabInBib,
    disableCollabInBib,
    uncheckAllCitations,
    updateCitation,
} from "../../data/store/slices/bibsSlice";
import { useEnhancedDispatch, useFindBib, useKeyboardShortcuts, useOnlineStatus } from "../../hooks/hooks.tsx";
import { useAuth } from "../../context/AuthContext";
import firestoreDB from "../../data/db/firebase/firebase";
import { ChipSet, EmptyPage, Fab, Icon, List, TextField, TopBar } from "../../components/ui/MaterialComponents";
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
import * as citationUtils from "../../utils/citationUtils.ts";

// TODO: The user cannot do any actions in collaborative bibliographies when they are offline
export default function Bibliography() {
    const { data: bibliographies, loadedLocally: bibsLoaded } = useSelector((state) => state.bibliographies);
    const { data: settings } = useSelector((state) => state.settings);
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
    const citationFormRef = useRef();
    const receiverBibsRef = useRef([]);
    const renameInputRef = useRef();
    const selectedTagsRef = useRef([]);

    const [collaborationOpened, setCollaborationOpened] = useState(bibliography?.collab?.open);
    const [idAndPasswordDialogVisible, setIdAndPasswordDialogVisible] = useState(false);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [iconsMenuVisible, setIconsMenuVisible] = useState(false);

    useEffect(() => {
        if (!bibsLoaded || !bibliography) return;
        dispatch(uncheckAllCitations({ bibId: bibliography.id }));
    }, [bibsLoaded]);

    useEffect(() => {
        // Prioritizes showing collab.id in the URL instead of the regular id if bibliography is collaborative
        if (!bibliography) return;
        if (bibliography?.collab?.open && bibId !== bibliography?.collab?.id) {
            navigate(`/bib/collab/${bibliography.collab.id}`, { replace: true });
        } else if (!bibliography?.collab?.open && bibId !== bibliography.id) {
            navigate(`/bib/${bibliography.id}`, { replace: true });
        }
    }, [bibId, bibliography?.collab?.open, location.pathname]);

    function openCitationForm(
        targetCitation,
        onApply,
        options = { formTitle: "Reference data", applyLabel: "Add reference" }
    ) {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        const { formTitle, applyLabel } = options;

        dialog.show({
            id: "citation-form",
            headline: formTitle,
            content: <CitationForm content={targetCitation.content} ref={citationFormRef} />,
            actions: [
                ["Cancel", () => dialog.close()],
                [applyLabel, () => onApply(citationUtils.getContentFromForm(citationFormRef.current))],
            ],
        });
    }

    function openAddCitationMenu() {
        const id = uid();
        dialog.show({
            id,
            headline: "Add citation",
            content: <AddCitationMenu openCitationForm={openCitationForm} close={() => dialog.close(id)} />,
            actions: [["Cancel", () => dialog.close()]],
        });
    }

    function showTagsDialog() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        function updateTags() {
            const selectedTags = selectedTagsRef.current;
            dispatch(updateBibField({ key: "tags", value: selectedTags }));
        }

        dialog.show({
            headline: "Change tags",
            content: (
                <TagsDialog
                    setSelectedTags={(tags) => {
                        selectedTagsRef.current = tags;
                    }}
                />
            ),
            actions: [
                ["Cancel", () => dialog.close()],
                ["Manage tags", () => navigate("/settings")], // TODO: Use query to open TagsManager
                ["Update tags", updateTags],
            ],
        });
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
            } catch (error) {
                console.error("Failed to copy text: ", error);
            }
        }
    }

    function handleMove() {
        function moveCitations(moveMode = true) {
            if (
                !isOnline &&
                bibliographies
                    .filter((bib) => !receiverBibsRef.current.includes(bib.id))
                    .some((sBib) => sBib?.collab?.open)
            ) {
                toast.show({
                    message: "You can't move to a collaborative bibliography in offline mode",
                    icon: "error",
                    color: "red",
                });
                return;
            }

            const movedCitations = checkedCitations.map((cit) => {
                const newId = uid();
                return { ...cit, id: newId, content: { ...cit.content, id: newId } };
            });

            receiverBibsRef.current.forEach((receiverId) => {
                const receiverBib = bibliographies.find((bib) => bib.id === receiverId);
                dispatch(
                    updateBibField({
                        bibId: receiverId,
                        key: "citations",
                        value: [...receiverBib.citations, ...movedCitations],
                    })
                );
            });

            if (moveMode) {
                dispatch(
                    updateBibField({
                        key: "citations",
                        value: bibliography.citations.filter(
                            (cit) => !checkedCitations.some((checked) => checked.id === cit.id)
                        ),
                    })
                );
            }
        }

        function addNewBib() {
            dispatch(
                addNewBibAndMoveSelectedCitations({
                    checkedCitations,
                    bibliographyStyle: bibliography?.style,
                })
            );
        }

        if (bibliographies.length > 1) {
            dialog.show({
                headline: "Move",
                content: (
                    <MoveDialog
                        setReceiverBibs={(ids) => {
                            receiverBibsRef.current = ids;
                        }}
                    />
                ),
                actions: [
                    ["Cancel", () => dialog.close()],
                    ["Move", moveCitations],
                    ["Copy", () => moveCitations(false)],
                ],
            });
        } else {
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
                icon: "delete",
                content: `Are you sure you want to delete ${
                    checkedCitations?.length === 1 ? "this citation" : "these citations"
                }?`,
                actions: [
                    [
                        "Delete",
                        () => dispatch(deleteSelectedCitations({ bibliographyId: bibliography?.id, checkedCitations })),
                    ],
                    ["Cancel", () => dialog.close(), { type: "filled" }],
                ],
            });
        }
    }

    function showRenameDialog() {
        if (!isOnline && bibliography?.collab?.open) {
            toast.show({ message: "You are offline", icon: "error", color: "red" });
            return;
        }

        function rename() {
            const newTitle = renameInputRef.current.value;

            if (!isOnline && bibliography?.collab?.open) {
                toast.show({ message: "You are offline", icon: "error", color: "red" });
                return;
            }

            if (/^\s*$/.test(newTitle)) {
                dialog.show({
                    headline: "Title is empty",
                    content: "You cant't set the title to an emdpty value.",
                    actions: [["Ok", () => dialog.close()]],
                });
            } else {
                dispatch(updateBibField({ key: "title", value: newTitle }));
            }
        }

        dialog.show({
            headline: "Rename bibliography",
            content: (
                <div className="px-5">
                    <TextField
                        className="w-full"
                        placeholder="Untitled Bibliography"
                        value={bibliography.title || ""}
                        type="text"
                        ref={renameInputRef}
                    />
                </div>
            ),
            actions: [
                ["Cancel", () => dialog.close()],
                ["Rename", rename],
            ],
        });
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
            icon: "group_off",
            content:
                "This will remove all collaborators, permanently delete the collaboration history, and revoke access foe all contributors. The bibliography will be removed from their list of accessible bibliographies. Are you sure you want to proceed? Collaboration can be opened anytime if needed.",
            actions: [
                ["Close collaboration", closeCollaboration],
                ["Cancel", () => dialog.close(), { type: "filled" }],
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
            icon: "logout",
            content: "Are you sure you want to leave this collaborative bibliography?",
            actions: [
                ["Leave", leave],
                ["Cancel", () => dialog.close(), { type: "filled" }],
            ],
        });
    }

    function handleDeleteBibliography() {
        dialog.show({
            headline: "Delete bibliography?",
            icon: "delete",
            content:
                "You'll no longer see this bibliography in your list. This will also delete related work and citations.",
            actions: [
                [
                    "Delete",
                    () => {
                        navigate("/");
                        dispatch(deleteBib({ bibliographyId: bibliography.id }));
                    },
                ],
                ["Cancel", () => dialog.close(), { type: "filled" }],
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
            const options = [
                {
                    headline: "Edit",
                    onClick: (newContent) => {
                        const targetCitation = checkedCitations[0];
                        openCitationForm(
                            targetCitation,
                            () =>
                                dispatch(
                                    updateCitation({
                                        bibId: bibliography.id,
                                        citation: {
                                            ...targetCitation,
                                            content: {
                                                ...targetCitation.content,
                                                ...newContent,
                                            },
                                        },
                                    })
                                ),
                            { formTitle: "Edit reference", applyLabel: "Apply changes" }
                        );
                    },
                },
            ];

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
                    onClick: () =>
                        exportToTxt(checkedCitations, bibliography.style, bibliography?.locale, {
                            fileName: bibliography.title,
                        }),
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
                    onClick: () =>
                        exportToHtml(checkedCitations, bibliography.style, bibliography?.locale, {
                            fileName: bibliography.title,
                        }),
                },
                {
                    headline: "Markdown",
                    onClick: () =>
                        exportToMd(checkedCitations, bibliography.style, bibliography?.locale, {
                            fileName: bibliography.title,
                        }),
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
        if (collaborationOpened && bibliography?.collab?.adminId === currentUser?.uid) {
            return [
                { headline: "Tags", onClick: showTagsDialog },
                { headline: "Rename bibliography", onClick: showRenameDialog },
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
            bibliography?.collab?.collaborators.some((collaborator) => collaborator.id === currentUser?.uid)
        ) {
            return [{ headline: "Leave collaboration", onClick: handleLeaveCollaboration }];
        }

        // Options if bibliography not open for collaboration
        if (!collaborationOpened) {
            return [
                { headline: "Tags", onClick: showTagsDialog },
                { headline: "Rename bibliography", onClick: showRenameDialog },
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

    if (!bibliography) {
        return (
            <EmptyPage
                icon="error"
                title="Bibliography Not Found"
                message="We're sorry, but the bibliography you're trying to access could not be found. Please verify the URL or check if you have the correct bibliography ID. If you need further assistance, feel free to contact us."
                actions={[
                    ["Home", () => navigate("/")],
                    [
                        "Contact support",
                        () => (window.location.href = "mailto:discontinuedlabs@gmail.com?subject=Support Request"), // eslint-disable-line no-return-assign
                    ],
                ]}
            />
        );
    }

    return (
        // mb-20 needed in pages with a Fab component
        <div className="mx-auto mb-20 max-w-[50rem]">
            <TopBar
                icon={bibliography?.icon}
                headline={bibliography?.title}
                options={[
                    ...(checkedCitations?.length !== 0 ? optionsWhenCitationsSelected : optionsWhenNothingSelected),
                ]}
                description={
                    <div className="grid gap-2">
                        {bibliography?.collab?.open ? <Icon name="group" className="text-xl" /> : ""}
                        {`${bibliography?.collab?.open ? ` ${bibliography?.collab?.id} • ` : ""}${bibliography?.style.name.long}`}
                        <ChipSet
                            chips={settings?.tags
                                .filter((tag) => bibliography.tags.includes(tag.id))
                                .map((tag) => {
                                    return {
                                        ...tag,
                                        selected: true,
                                        onClick: showTagsDialog,
                                    };
                                })}
                        />
                    </div>
                }
            />

            <ReferenceEntries openCitationForm={openCitationForm} />

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
                variant="primary"
                className="fixed bottom-5 right-5"
                onClick={openAddCitationMenu}
            />
        </div>
    );
}
