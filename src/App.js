import "./css/App.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage, useReducerWithLocalStorage } from "./utils";
import AcceptDialog from "./components/ui/AcceptDialog";
import { nanoid } from "nanoid";
import { v4 as uuid4 } from "uuid";

const ACTIONS = {
    ADD_NEW_BIBLIOGRAPHY: "Add new bibliography",
    ADD_NEW_CITATION_TO_BIBLIOGRAPHY: "Add new citation to bibliography",
    UPDATE_CONTENT_IN_EDITED_CITATION: "Update content in edited citation",
    UPDATE_CITATION_IN_BIBLIOGRAPHY: "Update citation in bibliography",
    TOGGLE_REFERENCE_ENTRY_CHECKBOX: "Toggle reference entry checkbox",
};

function reducer(bibliographies, action) {
    switch (action.type) {
        case ACTIONS.ADD_NEW_BIBLIOGRAPHY:
            const newBibliography = {
                title: "Untitled Bibliography", // Default title
                style: action.bibStyle,
                id: "bib=" + nanoid(10), // nanoid offers shorter UUIDs than uuid4. Useful for bibId because they are used in URl params
                citations: [],
            };
            return [...bibliographies, newBibliography];

        case ACTIONS.ADD_NEW_CITATION_TO_BIBLIOGRAPHY:
            const citId = uuid4();
            const newCitation = {
                id: citId,
                content: { id: citId, author: [{ given: "", family: "", id: uuid4() }] },
                isChecked: false,
            };
            return bibliographies.map((bib) => {
                if (bib.id === action.bibliographyId) {
                    return {
                        ...bib,
                        editedCitation: newCitation,
                    };
                }
                return bib;
            });

        case ACTIONS.UPDATE_CONTENT_IN_EDITED_CITATION:
            return bibliographies.map((bib) => {
                if (bib.id === action.bibliographyId) {
                    return {
                        ...bib,
                        editedCitation: { ...bib.editedCitation, content: action.content },
                    };
                }
                return bib;
            });

        case ACTIONS.UPDATE_CITATION_IN_BIBLIOGRAPHY:
            return bibliographies.map((bib) => {
                if (bib.id === action.bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.editedCitation.id);
                    let updatedCitations;

                    if (citationIndex !== -1) {
                        // If the citation exists, update it
                        updatedCitations = bib.citations.map((cit, index) => {
                            if (index === citationIndex) {
                                return { ...cit, ...action.editedCitation }; // Update the existing citation
                            }
                            return cit;
                        });
                    } else {
                        // If the citation doesn't exist, add it
                        updatedCitations = [...bib.citations, action.editedCitation];
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
                if (bib.id === action.bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.citationId);
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

        default:
            return bibliographies;
    }
}

export default function App() {
    const [bibliographies, dispatch] = useReducerWithLocalStorage("bibliographies", reducer, []);
    const [savedCslFiles, setSavedCslFiles] = useLocalStorage("savedCslFiles", {}); // Used to save the CSL files that don't exist in the public folder
    const [font, setFont] = useLocalStorage("font", { name: "Georgia", family: "Georgia" });
    const [acceptDialog, setAcceptDialog] = useState({});

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
        setAcceptDialog({ title, body });
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
                            savedCslFiles={savedCslFiles}
                            setSavedCslFiles={setSavedCslFiles}
                        />
                    }
                />
            </Routes>
            {acceptDialog.title && <AcceptDialog message={acceptDialog} closeToast={() => setAcceptDialog("")} />}
        </div>
    );
}
