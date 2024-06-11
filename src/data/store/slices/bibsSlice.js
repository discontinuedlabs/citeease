import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import db from "../../db/dexie/dexie";

const initialState = [];

function saveToIndexedDB(newState) {
    const serializedState = JSON.stringify(newState);
    db.items.put({ id: "bibliographies", value: serializedState });
}

// IMPORTANT: Date() objects should get converted toString() because they need to be serialized when saved to indexedDB
const bibsSlice = createSlice({
    name: "bibliographies",
    initialState,
    reducers: {
        addNewBib: (bibs, action) => {
            const newBib = {
                title: "Untitled Bibliography",
                style: action.payload.bibliographyStyle,
                dateCreated: new Date().toString(),
                dateModified: new Date().toString(),
                id: "bib=" + nanoid(10),
                citations: [],
                tags: [],
            };
            const newState = [...bibs, newBib];
            saveToIndexedDB(newState);
            return newState;
        },
        deleteBib: (bibs, action) => {
            const newState = bibs?.filter((bib) => bib.id !== action.payload.bibliographyId);
            saveToIndexedDB(newState);
            return newState;
        },
        updateBibField: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    return { ...bib, [action.payload.key]: action.payload.value, dateModified: new Date().toString() };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        addNewCitation: (bibs, action) => {
            const newState = bibs.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const citId = nanoid();
                    if (action.payload?.content) {
                        // If passed ready content, it gets added directly to the citations array
                        return {
                            ...bib,
                            citations: [
                                ...bib.citations,
                                {
                                    id: citId,
                                    content: {
                                        ...action.payload?.content,
                                        id: citId,
                                    },
                                    isChecked: false,
                                },
                            ],
                            dateModified: new Date().toString(),
                        };
                    } else if (action.payload.sourceType) {
                        // If passed a sourceType, it means it doesn't have content, so it gets added to the editedCitation field to get filled with the source's data
                        return {
                            ...bib,
                            editedCitation: {
                                id: citId,
                                content: {
                                    id: citId,
                                    type: action.payload.sourceType,
                                    author: [{ given: "", family: "", id: nanoid() }],
                                },
                                isChecked: false,
                            },
                            dateModified: new Date().toString(),
                        };
                    }
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        editCitation: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const targetCitation = bib.citations.find((cit) => cit.id === action.payload.citationId);
                    return {
                        ...bib,
                        editedCitation: { ...targetCitation },
                    };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        updateContentInEditedCitation: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    return {
                        ...bib,
                        editedCitation: { ...bib.editedCitation, content: action.payload.content },
                        dateModified: new Date().toString(),
                    };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        updateCitation: (bibs, action) => {
            const newState = bibs.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.payload.editedCitation.id);
                    let updatedCitations;

                    if (citationIndex !== -1) {
                        // If the citation exists, update it
                        updatedCitations = bib.citations.map((cit, index) => {
                            if (index === citationIndex) {
                                return { ...cit, ...action.payload.editedCitation, isChecked: false };
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
                        dateModified: new Date().toString(),
                    };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        toggleEntryCheckbox: (bibs, action) => {
            const newState = bibs?.map((bib) => {
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
            return newState;
        },
        handleMasterEntriesCheckbox: (bibs, action) => {
            const newState = bibs?.map((bib) => {
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
            return newState;
        },
        moveSelectedCitations: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                if (bib.id === action.payload.toId) {
                    return {
                        ...bib,
                        citations: [...bib.citations, ...action.payload.checkedCitations],
                        dateModified: new Date().toString(),
                    };
                } else if (bib.id === action.payload.fromId) {
                    const idsForDelete = action.payload.checkedCitations.map((cit) => cit.id);
                    return {
                        ...bib,
                        citations: bib.citations.filter((cit) => !idsForDelete.includes(cit.id)),
                        dateModified: new Date().toString(),
                    };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        copySelectedCitations: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                const filteredCitations = bib.citations.filter(
                    (cit) => !action.payload.checkedCitations.some((checkedCit) => checkedCit.id === cit.id)
                );
                const updatedCitations = filteredCitations.map((cit) => ({ ...cit, isChecked: false }));
                const copiedCitations = action.payload.checkedCitations.map((cit) => {
                    const newId = nanoid();
                    return { ...cit, id: newId, content: { ...cit.content, id: newId }, isChecked: false };
                });
                return {
                    ...bib,
                    citations: [...updatedCitations, ...copiedCitations],
                    dateModified: new Date().toString(),
                };
            });
            saveToIndexedDB(newState);
            return newState;
        },
        duplicateSelectedCitations: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const newIds = action.payload.checkedCitations.map(() => nanoid());
                    const duplicatedCitations = action.payload.checkedCitations.map((cit, index) => ({
                        ...cit,
                        id: newIds[index],
                        content: { ...cit.content, id: newIds[index] },
                        isChecked: false,
                    }));
                    return {
                        ...bib,
                        citations: [
                            ...bib.citations.map((cit) => ({ ...cit, isChecked: false })),
                            ...duplicatedCitations,
                        ],
                        dateModified: new Date().toString(),
                    };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        deleteSelectedCitations: (bibs, action) => {
            const newState = bibs?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const targetIds = action.payload.checkedCitations.map((cit) => cit.id);
                    return {
                        ...bib,
                        citations: bib.citations.filter((cit) => !targetIds.includes(cit.id)),
                        dateModified: new Date().toString(),
                    };
                }
                return bib;
            });
            saveToIndexedDB(newState);
            return newState;
        },
        addNewBibAndMoveSelectedCitations: (bibs, action) => {
            const newBib = {
                title: "Untitled Bibliography",
                style: action.payload.bibliographyStyle,
                dateCreated: new Date().toString(),
                dateModified: new Date().toString(),
                id: "bib=" + nanoid(10),
                citations: [...action.payload.checkedCitations],
            };
            const newState = [...bibs, newBib];
            saveToIndexedDB(newState);
            return newState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadFromIndexedDB.fulfilled, (state, action) => {
            return action?.payload || state;
        });
    },
});

export const loadFromIndexedDB = createAsyncThunk("bibliographies/loadFromIndexedDB", async () => {
    const loadedBibs = await db.items.get("bibliographies");
    const parsedBibs = await JSON.parse(loadedBibs.value);
    const cleanedBibs = parsedBibs?.map((bib) => {
        return {
            ...bib,
            citations: bib.citations.map((cit) => ({ ...cit, isChecked: false })),
        };
    });

    return cleanedBibs;
});

export const {
    addNewBib,
    deleteBib,
    updateBibField,
    addNewCitation,
    editCitation,
    updateContentInEditedCitation,
    updateCitation,
    toggleEntryCheckbox,
    handleMasterEntriesCheckbox,
    moveSelectedCitations,
    copySelectedCitations,
    duplicateSelectedCitations,
    deleteSelectedCitations,
    addNewBibAndMoveSelectedCitations,
} = bibsSlice.actions;

export default bibsSlice.reducer;
