import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { doc, setDoc } from "firebase/firestore";
import firestoreDB from "../../db/firebase/firebase";
import dexieDB from "../../db/dexie/dexie";
import { uid } from "../../../utils/utils.ts";

const initialState = { data: [], loadedLocally: false };

function save(newState, currentUser = undefined) {
    const serializedBibs = JSON.stringify(newState.data);
    dexieDB.items.put({ id: "bibliographies", value: serializedBibs });

    if (!currentUser) return;
    const parsedCurrentUser = JSON.parse(currentUser);
    if (parsedCurrentUser) {
        const userRef = doc(firestoreDB, "users", parsedCurrentUser?.uid);
        setDoc(userRef, { bibliographies: JSON.stringify(newState.data) });

        newState.data.forEach((bib) => {
            if (bib?.collab?.open) {
                const coBibsRef = doc(firestoreDB, "coBibs", bib?.collab?.id);
                setDoc(coBibsRef, { bibliography: JSON.stringify(bib) });
            }
        });
    }
}

export const loadFromIndexedDB = createAsyncThunk("bibliographies/loadFromIndexedDB", async () => {
    const loadedBibs = await dexieDB.items.get("bibliographies");
    const parsedBibs = await JSON.parse(loadedBibs.value);
    const cleanedBibs = parsedBibs?.map((bib) => ({
        ...bib,
        citations: bib.citations.map((cit) => ({ ...cit, isChecked: false })),
    }));

    return cleanedBibs;
});

const bibsSlice = createSlice({
    name: "bibliographies",
    initialState,
    reducers: {
        mergeWithCurrentBibs: (state, action) => {
            if (!action.payload.bibs) return state;
            const newBibs = action.payload.bibs;
            const newBibsIds = newBibs.map((bib) => bib.id);
            const filteredOldBibs = state.data.filter((bib) => !newBibsIds.includes(bib.id));
            const newState = { ...state, data: [...filteredOldBibs, ...newBibs] };
            save(newState, action.payload.currentUser);
            return newState;
        },
        replaceAllBibs: (state, action) => {
            const newState = { ...state, data: action.payload.bibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        enableCollabInBib: (state, action) => {
            const newBibs = state.data.map((bib) => {
                if (bib.id === action.payload.bibId && action.payload.currentUser) {
                    const parsedCurrentUser = JSON.parse(action.payload.currentUser);
                    return {
                        ...bib,
                        collab: {
                            open: true,
                            id: action.payload.coId,
                            adminId: parsedCurrentUser.uid,
                            collaborators: [{ name: parsedCurrentUser.displayName, id: parsedCurrentUser.uid }],
                            preferences: {},
                            changelog: [],
                            password: action.payload.password,
                        },
                    };
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        reEnableCollabInBib: (state, action) => {
            const newBibs = state.data.map((bib) => {
                if (bib.id === action.payload.bibId) {
                    return {
                        ...bib,
                        collab: {
                            ...bib.collab,
                            open: true,
                        },
                    };
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        disableCollabInBib: (state, action) => {
            const newBibs = state.data.map((bib) => {
                if (bib.id === action.payload.bibId) {
                    return {
                        ...bib,
                        collab: {
                            ...bib.collab,
                            open: false,
                            collaborators: [bib.collab.collaborators.find((co) => co.id === bib.collab.adminId)],
                            changelog: [],
                        },
                    };
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        addNewBib: (state, action) => {
            const newBib = {
                title: "Untitled Bibliography",
                style: action.payload.bibliographyStyle,
                dateCreated: new Date().toString(),
                dateModified: new Date().toString(),
                id: uid(10),
                icon: "book_2",
                citations: [],
                tags: [],
            };
            const newBibs = [...state.data, newBib];
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        createBibFromJson: (state, action) => {
            const newBib = {
                title: action.payload?.fileName || "Untitled Bibliography",
                style: action.payload.style,
                dateCreated: new Date().toString(),
                dateModified: new Date().toString(),
                id: uid(10),
                icon: "book_2",
                citations: action.payload.json.map((json) => {
                    const newId = uid();
                    const newCitation = { id: newId, content: { ...json, id: newId }, isChecked: false }; // id should be replaced with a new one because it might be exported from the same user
                    return newCitation;
                }),
                tags: [],
            };
            const newBibs = [...state.data, newBib];
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        deleteBib: (state, action) => {
            const newBibs = state.data?.filter((bib) => bib.id !== action.payload.bibliographyId);
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        updateBibField: (state, action) => {
            const { bibId, key, value, currentUser } = action.payload;

            const newBibs = state.data?.map((bib) => {
                if (bib.id === bibId) {
                    return { ...bib, [key]: value, dateModified: new Date().toString() };
                }
                return bib;
            });

            const newState = { ...state, data: newBibs };
            save(newState, currentUser);
            return newState;
        },
        uncheckAllCitations: (state, action) => {
            // TODO: isChecked should't be part of the saved citations
            const newBibs = state.data?.map((bib) => {
                if (bib.id === action.payload.bibId) {
                    return {
                        ...bib,
                        citations: bib.citations.map((cit) => {
                            return { ...cit, isChecked: false };
                        }),
                    };
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            save(newState);
            return newState;
        },
        addNewCitation: (state, action) => {
            const newBibs = state.data.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const citId = uid();
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
                    }
                    if (action.payload.sourceType) {
                        // If passed a sourceType, it means it doesn't have content, so it gets added to the editedCitation field to get filled with the source's data
                        return {
                            ...bib,
                            editedCitation: {
                                id: citId,
                                content: {
                                    id: citId,
                                    type: action.payload.sourceType,
                                    author: [{ given: "", family: "", id: uid() }],
                                },
                                isChecked: false,
                            },
                            dateModified: new Date().toString(),
                        };
                    }
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        updateCitation: (state, action) => {
            const newBibs = state.data.map((bib) => {
                if (bib.id === action.payload.bibId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.payload.citation.id);
                    let updatedCitations;

                    if (citationIndex !== -1) {
                        // If the citation exists, update it
                        updatedCitations = bib.citations.map((cit, index) => {
                            if (index === citationIndex) {
                                return { ...cit, ...action.payload.citation };
                            }
                            return cit;
                        });
                    } else {
                        // If the citation doesn't exist, add it to the rest of bibliography.citations array
                        updatedCitations = [...bib.citations, action.payload.citation];
                    }

                    return {
                        ...bib,
                        citations: updatedCitations,
                        dateModified: new Date().toString(),
                    };
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        toggleEntryCheckbox: (state, action) => {
            const newBibs = state.data?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === action.payload.citationId);

                    const updatedCitations = bib.citations.map((cit, index) => {
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
            const newState = { ...state, data: newBibs };
            return newState;
        },
        handleMasterEntriesCheckbox: (state, action) => {
            const newBibs = state.data?.map((bib) => {
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
                    if (allUnchecked) {
                        return {
                            ...bib,
                            citations: bib.citations.map((cit) => ({ ...cit, isChecked: true })),
                        };
                    }
                    // If some citations are checked, check the rest

                    return {
                        ...bib,
                        citations: bib.citations.map((cit) => ({ ...cit, isChecked: true })),
                    };
                }
                return bib;
            });
            const newState = { ...state, data: newBibs };
            return newState;
        },
        duplicateSelectedCitations: (state, action) => {
            const newBibs = state.data?.map((bib) => {
                if (bib.id === action.payload.bibliographyId) {
                    const duplicatedCitations = action.payload.checkedCitations?.map((cit) => {
                        const newId = uid();
                        return {
                            ...cit,
                            id: newId,
                            content: { ...cit.content, id: newId },
                            isChecked: false,
                        };
                    });
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
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        deleteSelectedCitations: (state, action) => {
            const newBibs = state.data?.map((bib) => {
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
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        addNewBibAndMoveSelectedCitations: (state, action) => {
            const newBib = {
                title: "Untitled Bibliography",
                style: action.payload.bibliographyStyle,
                dateCreated: new Date().toString(),
                dateModified: new Date().toString(),
                id: uid(10),
                icon: "book_2",
                tags: [],
                citations: [...action.payload.checkedCitations],
            };
            const newBibs = [...state.data, newBib];
            const newState = { ...state, data: newBibs };
            save(newState, action.payload.currentUser);
            return newState;
        },
        deleteAllBibs: () => {
            save(initialState);
            return initialState;
        },
    },

    extraReducers: (builder) => {
        builder.addCase(loadFromIndexedDB.fulfilled, (state, action) => {
            return { ...state, data: action?.payload, loadedLocally: true };
        });
    },
});

export const {
    mergeWithCurrentBibs,
    replaceAllBibs,
    enableCollabInBib,
    reEnableCollabInBib,
    disableCollabInBib,
    addNewBib,
    createBibFromJson,
    deleteBib,
    updateBibField,
    uncheckAllCitations,
    addNewCitation,
    updateCitation,
    toggleEntryCheckbox,
    handleMasterEntriesCheckbox,
    duplicateSelectedCitations,
    deleteSelectedCitations,
    addNewBibAndMoveSelectedCitations,
    deleteAllBibs,
} = bibsSlice.actions;

export default bibsSlice.reducer;
