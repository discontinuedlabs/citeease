import "./css/App.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage, useReducerWithLocalStorage } from "./utils";
import AcceptDialog from "./components/ui/AcceptDialog";
import { nanoid } from "nanoid";
import { v4 as uuid4 } from "uuid";
import ConfirmDialog from "./components/ui/ConfirmDialog";

const ACTIONS = {
    ADD_NEW_BIBLIOGRAPHY: "Add new bibliography",
    UPDATE_BIBLIOGRAPHY_FIELDS: "Update bibliography fields",
    ADD_NEW_CITATION_TO_BIBLIOGRAPHY: "Add new citation to bibliography",
    ADD_CITATION_TO_EDITED_CITATION: "Add citation to edited citation",
    UPDATE_CONTENT_IN_EDITED_CITATION: "Update content in edited citation",
    UPDATE_CITATION_IN_BIBLIOGRAPHY: "Update citation in bibliography",
    TOGGLE_REFERENCE_ENTRY_CHECKBOX: "Toggle reference entry checkbox",
    HANDLE_MASTER_REFERENCE_ENTRY_CHECKBOX: "Handle manster reference entry checkbox",
    UNCHECK_ALL_CITATIONS: "Uncheck all citations",
    DELETE_BIBLIOGRAPHY: "Delete bibliography",
    DELETE_SELECTED_CITATIONS: "Delete selected citations",
    DUPLICATE_SELECTED_CITATIONS: "Duplicate selected citations",
};

function reducer(bibliographies, action) {
    switch (action.type) {
        case ACTIONS.ADD_NEW_BIBLIOGRAPHY:
            const newBibliography = {
                title: "Untitled Bibliography", // Default title
                style: action.payload.bibliographyStyle,
                id: "bib=" + nanoid(10), // nanoid offers shorter UUIDs than uuid4. Useful for bibliographyId because they are used in URl params
                citations: [],
            };
            return [...bibliographies, newBibliography];

        case ACTIONS.UPDATE_BIBLIOGRAPHY_FIELDS:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    return { ...bib, [action.payload.key]: action.payload.value };
                }
                return bib;
            });

        case ACTIONS.ADD_NEW_CITATION_TO_BIBLIOGRAPHY:
            const citId = uuid4();
            const newCitation = {
                id: citId,
                content: {
                    id: citId,
                    type: action.payload.sourceType,
                    author: [{ given: "", family: "", id: uuid4() }],
                },
                isChecked: false,
            };
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    return {
                        ...bib,
                        editedCitation: newCitation,
                    };
                }
                return bib;
            });

        case ACTIONS.ADD_CITATION_TO_EDITED_CITATION:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const targetCitation = bib.citations.find((cit) => cit.id === action.payload.vitationId);
                    return {
                        ...bib,
                        editedCitation: { ...targetCitation },
                    };
                }
                return bib;
            });

        case ACTIONS.UPDATE_CONTENT_IN_EDITED_CITATION:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    return {
                        ...bib,
                        editedCitation: { ...bib.editedCitation, content: action.payload.content },
                    };
                }
                return bib;
            });

        case ACTIONS.UPDATE_CITATION_IN_BIBLIOGRAPHY:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.payload.editedCitation.id);
                    let updatedCitations;

                    if (citationIndex !== -1) {
                        // If the citation exists, update it
                        updatedCitations = bib.citations.map((cit, index) => {
                            if (index === citationIndex) {
                                return { ...cit, ...action.payload.editedCitation }; // Update the existing citation
                            }
                            return cit;
                        });
                    } else {
                        // If the citation doesn't exist, add it
                        updatedCitations = [...bib.citations, action.payload.editedCitation];
                    }

                    return {
                        ...bib,
                        citations: updatedCitations,
                    };
                }
                return bib;
            });

        case ACTIONS.TOGGLE_REFERENCE_ENTRY_CHECKBOX:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.payload.citationId);
                    let updatedCitations;

                    updatedCitations = bib.citations.map((cit, index) => {
                        if (index === citationIndex) {
                            return { ...cit, isChecked: !cit.isChecked };
                        }
                        return cit;
                    });

                    return {
                        ...bib,
                        citations: updatedCitations,
                    };
                }
                return bib;
            });

        case ACTIONS.HANDLE_MASTER_REFERENCE_ENTRY_CHECKBOX:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const allChecked = bib.citations.every((cit) => cit.isChecked);
                    const allUnchecked = bib.citations.every((cit) => !cit.isChecked);

                    // If all citations are checked, uncheck all of them
                    if (allChecked) {
                        return {
                            ...bib,
                            citations: bib.citations.map((cit) => ({ ...cit, isChecked: false })),
                        };
                    }
                    // If all citations are unchecked, check all of them
                    else if (allUnchecked) {
                        return {
                            ...bib,
                            citations: bib.citations.map((cit) => ({ ...cit, isChecked: true })),
                        };
                    }
                    // If some citations are checked, check the rest
                    else {
                        return {
                            ...bib,
                            citations: bib.citations.map((cit) => ({ ...cit, isChecked: true })),
                        };
                    }
                }
                return bib;
            });

        case ACTIONS.UNCHECK_ALL_CITATIONS:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    return {
                        ...bib,
                        citations: bib.citations.map((cit) => ({ ...cit, isChecked: false })),
                    };
                }
                return bib;
            });

        case ACTIONS.DELETE_BIBLIOGRAPHY:
            return bibliographies.filter((bib) => bib.id !== action.payload.bibliographyId);

        case ACTIONS.DUPLICATE_SELECTED_CITATIONS:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const duplicatedCitations = action.payload.checkedCitations.map((cit) => {
                        const newId = uuid4();
                        return { ...cit, id: newId, content: { ...cit.content, id: newId } };
                    });
                    return {
                        ...bib,
                        citations: [...bib.citations, ...duplicatedCitations],
                    };
                }
                return bib;
            });

        case ACTIONS.DELETE_SELECTED_CITATIONS:
            return bibliographies.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const targetIds = action.payload.checkedCitations.map((cit) => cit.id);
                    return {
                        ...bib,
                        citations: bib.citations.filter((cit) => !targetIds.includes(cit.id)),
                    };
                }
                return bib;
            });

        default:
            return bibliographies;
    }
}

export default function App() {
    const [bibliographies, dispatch] = useReducerWithLocalStorage("bibliographies", reducer, []);
    const [savedCslFiles, setSavedCslFiles] = useLocalStorage("savedCslFiles", {}); // Used to save the CSL files that don't exist in the public folder
    const [font, setFont] = useLocalStorage("font", { name: "Georgia", family: "Georgia" });
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});

    const FONTS = [
        { name: "Default", family: "unset" },
        { name: "Arial", family: "Arial" },
        { name: "Calibri", family: "Calibri" },
        { name: "Georgia", family: "Georgia" },
        { name: "Helvetica", family: "Helvetica" },
        { name: "Lucida Sans Unicode", family: "Lucida Sans Unicode" },
        {
            name: "System UI",
            family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        },
        { name: "Tahoma", family: "Tahoma" },
        { name: "Times New Roman", family: "Times New Roman" },
        { name: "Verdana", family: "Verdana" },
    ];

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ message: { title, body } });
    }

    function showConfirmDialog(title, body, onConfirmMethod, yesLabel = "Yes", noLabel = "No") {
        setConfirmDialog({ message: { title, body }, onConfirmMethod, yesLabel, noLabel });
    }

    return (
        <div className="app">
            {/* <ContextMenu
                label={font.name}
                options={fonts.map((f) => ({
                    label: f.name,
                    method: () => setFont(f),
                    style: { fontFamily: f.family },
                }))}
            /> */}

            <Routes>
                <Route
                    path="/"
                    element={<Home bibliographies={bibliographies} dispatch={dispatch} ACTIONS={ACTIONS} />}
                />
                <Route
                    path="/:id"
                    element={
                        <Bibliography
                            bibliographies={bibliographies}
                            dispatch={dispatch}
                            ACTIONS={ACTIONS}
                            font={font}
                            showAcceptDialog={showAcceptDialog}
                            showConfirmDialog={showConfirmDialog}
                            savedCslFiles={savedCslFiles}
                            setSavedCslFiles={setSavedCslFiles}
                        />
                    }
                />
            </Routes>
            {acceptDialog.message && (
                <AcceptDialog message={acceptDialog.message} closeDialog={() => setAcceptDialog({})} />
            )}
            {confirmDialog.message && <ConfirmDialog {...confirmDialog} closeDialog={() => setConfirmDialog({})} />}
        </div>
    );
}
