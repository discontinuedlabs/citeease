import "../css/ReferenceEntries.css";
import { useEffect, useState } from "react";
import * as citationEngine from "./citationEngine.js";
import ContextMenu from "./ui/ContextMenu.js";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

export default function ReferenceEntries(props) {
    const {
        bibliography,
        dispatch,
        ACTIONS,
        handleReferenceEntryCheck,
        savedCslFiles,
        setSavedCslFiles,
        checkedCitations,
        setLaTeXWindowVisible,
        setExportAll,
        showConfirmDialog,
        openCitationWindow,
    } = props;
    const [references, setReferences] = useState([]);
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);

    useEffect(() => {
        function updateMasterCheckboxState() {
            let checkedCount = 0;
            bibliography.citations.forEach((cit) => {
                if (cit.isChecked) {
                    checkedCount++;
                }
            });

            if (checkedCount === bibliography.citations.length) {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.CHECKED);
            } else if (checkedCount === 0) {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.UNCHECKED);
            } else {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.INDETERMINATE);
            }
        }
        updateMasterCheckboxState();
    }, [bibliography.citations]);

    useEffect(() => {
        async function formatCitations() {
            const formattedCitations = await citationEngine.formatCitations(
                bibliography.citations,
                bibliography.style,
                savedCslFiles,
                setSavedCslFiles
            );
            setReferences(formattedCitations);
        }
        formatCitations();
    }, [bibliography.citations, bibliography.style]);

    function handleMasterCheck() {
        dispatch({
            type: ACTIONS.HANDLE_MASTER_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliography.id },
        });
    }

    async function handleCopy() {
        const formattedCitations = await citationEngine.formatCitations(
            checkedCitations,
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

    function handleExportToLatex() {
        setExportAll(false);
        setLaTeXWindowVisible(true);
    }

    function handleDuplicate() {
        dispatch({
            type: ACTIONS.DUPLICATE_SELECTED_CITATIONS,
            payload: { bibliographyId: bibliography.id, checkedCitations: checkedCitations },
        });
    }

    function handleDelete() {
        dispatch({
            type: ACTIONS.DELETE_SELECTED_CITATIONS,
            payload: { bibliographyId: bibliography.id, checkedCitations: checkedCitations },
        });
    }

    return (
        <div className="reference-entries-component">
            <div className="reference-entries-header">
                {bibliography.citations.length !== 0 && (
                    <input
                        type="checkbox"
                        className="master-checkbox"
                        checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                        onChange={handleMasterCheck}
                    />
                )}
                {checkedCitations.length >= 1 && (
                    <ContextMenu
                        icon="more_vert"
                        options={[
                            { label: "Copy", method: handleCopy },
                            {
                                label: "Export to LaTeX",
                                method: handleExportToLatex,
                            },

                            "DEVIDER",

                            // { label: "Move", method: handleMove },
                            { label: "Duplicate", method: handleDuplicate },

                            "DEVIDER",

                            ...(checkedCitations.length === 1 && checkedCitations[0].content.URL
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
                                        `Delete ${checkedCitations.length === 1 ? "citation" : "citations"}?`,
                                        `Are you sure you want to delete ${
                                            checkedCitations.length === 1 ? "this citation" : "these citations"
                                        }?`,
                                        handleDelete,
                                        "Delete",
                                        "Cancel"
                                    ),
                                icon: "delete",
                                style: { color: "crimson" },
                            },
                        ]}
                        menuStyle={{
                            position: "absolute",
                            left: "0",
                        }}
                        buttonType={"smallButton"}
                    />
                )}
            </div>

            <div className="reference-entries-container">
                {bibliography.citations.map((cit, index) => {
                    return (
                        <div
                            className="reference-entry"
                            key={cit.id}
                            // onClick={() => openCitationWindow(cit.content.type, false, cit.id)} // FIXME: it can be clicked when you click on the checkbox
                        >
                            <input
                                type="checkbox"
                                className="reference-entry-checkbox"
                                checked={cit.isChecked}
                                onChange={() => handleReferenceEntryCheck(cit.id)}
                            />
                            <div
                                className="reference-entry-text"
                                dangerouslySetInnerHTML={{ __html: references[index] }}
                            ></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
