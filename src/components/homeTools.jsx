import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useId, useRef, useState } from "react";
import { useSelector } from "react-redux";
import db from "../data/db/firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { mergeWithCurrentBibs, updateBibField } from "../data/store/slices/bibsSlice";
import { useToast } from "../context/ToastContext.tsx";
import { useEnhancedDispatch, useFindBib, useTheme } from "../hooks/hooks.tsx";
import { useDialog } from "../context/DialogContext.tsx";
import { ChipSet, Icon, List } from "./ui/MaterialComponents";
import defaults from "../assets/json/defaults.json";
import { timeAgo } from "../utils/utils.ts";
import { EmptyStar, FilledStar } from "./ui/Star";

const { colors: colorValues } = defaults;

export function CoBibsSearchDialog({ setIsVisible, tryingToJoinBib = undefined }) {
    const { data: bibliographies, loadedFromIndexedDB: bibsLoaded } = useSelector((state) => state.bibliographies);
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const id = useId();
    const searchRef = useRef();
    const passwordRef = useRef();
    const { currentUser } = useAuth();
    const dispatch = useEnhancedDispatch();
    const toast = useToast();
    const navigate = useNavigate();
    const dialog = useDialog();

    function promptToLogin() {
        dialog.show({
            headline: "Login required",
            content: "You need to log in first to use this feature.",
            actions: [
                ["Cancel", () => dialog.close()],
                ["Log in", () => navigate("/login")],
            ],
        });
    }

    async function searchForBib(bibId) {
        try {
            setSearchError(null);
            setSearchLoading(true);
            const docRef = doc(db, "coBibs", bibId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const result = JSON.parse(docSnap.data().bibliography);
                console.log(
                    result.id,
                    bibliographies.map((bib) => bib.id)
                );
                if (bibliographies.some((bib) => bib.id === result.id)) {
                    setSearchError(`You are already a collaborator in ${result.title} (${result.collab.id})`);
                } else {
                    setSearchResult(result);
                }
            } else {
                setSearchError("No such collaborative bibliography!");
            }
        } catch (error) {
            console.error(error);
            setSearchError(error.toString());
        }

        setSearchLoading(false);
    }

    useEffect(() => {
        if (tryingToJoinBib && bibsLoaded) {
            if (!currentUser) {
                promptToLogin();
            } else {
                searchForBib(tryingToJoinBib);
            }
        }
    }, [tryingToJoinBib, bibsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleSearch(event) {
        event.preventDefault();
        if (!currentUser) {
            promptToLogin();
        } else {
            searchForBib(searchRef.current.value);
        }
    }

    async function handleJoin(event) {
        event.preventDefault();
        try {
            setPasswordError(null);
            setPasswordLoading(true);
            if (passwordRef.current.value === searchResult.collab.password) {
                const newCoBibState = {
                    ...searchResult,
                    dateModified: new Date().toString(),
                    collab: {
                        ...searchResult.collab,
                        collaborators: [
                            ...searchResult.collab.collaborators,
                            { name: currentUser.displayName, id: currentUser.uid },
                        ],
                    },
                };
                dispatch(mergeWithCurrentBibs({ bibs: [newCoBibState] }));

                const coBibsRef = doc(db, "coBibs", newCoBibState?.collab?.id);
                setDoc(coBibsRef, { bibliography: JSON.stringify(newCoBibState) });

                toast.show({
                    message: `You successfully joined ${searchResult.title} (${searchResult.collab.id})`,
                    icon: "check",
                    color: "green",
                });

                navigate(`/collab/${newCoBibState.collab.id}`);
            } else {
                setPasswordError("The password you entered is wrong");
            }
        } catch (error) {
            console.error(error);
            setPasswordError(error.toString());
        }
        setPasswordLoading(false);
    }

    return (
        <div>
            <h3>Search for collaborative bibliographies</h3>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>

            <search>
                <pre>{searchError}</pre>
                <form onSubmit={handleSearch}>
                    <input type="search" ref={searchRef} placeholder="Search for collaborative bibliographies..." />
                    <button type="submit" disabled={searchLoading}>
                        Search
                    </button>
                </form>
            </search>

            {searchResult && (
                <div>
                    <div>
                        <h3>{searchResult.title}</h3>
                        <div>Number of collaborators:{searchResult?.collab?.collaborators.length}</div>
                    </div>
                    <pre>{passwordError}</pre>
                    <form onSubmit={handleJoin}>
                        <label htmlFor={`${id}-password`}>
                            Enter the password to join
                            <input autoFocus ref={passwordRef} type="password" name="password" id={`${id}-password`} />
                        </label>
                        <button type="submit" disabled={passwordLoading}>
                            Join
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export function BibsList({ hideCurrentBib = false, disableStar = false, highlightedBibs = [], onBibClick }) {
    const { data: bibliographies } = useSelector((state) => state.bibliographies);
    const { data: settings } = useSelector((state) => state.settings);
    const currentBib = useFindBib();
    const [theme] = useTheme();
    const dispatch = useEnhancedDispatch();

    const sortedBibliographies = Array.from(bibliographies).sort((a, b) => {
        const dateA = new Date(a.dateModified);
        const dateB = new Date(b.dateModified);
        return dateB - dateA;
    });

    function addBibToFavorite(id) {
        const targetBib = bibliographies.find((bib) => bib.id === id);
        dispatch(
            updateBibField({
                bibId: id,
                key: "favorite",
                value: !targetBib?.favorite,
                options: {
                    updateDateModified: false,
                },
            })
        );
    }

    return (
        <List
            items={sortedBibliographies.map((bib) => {
                if (hideCurrentBib && bib.id === currentBib.id) return null;

                const bibTags = settings?.tags.filter((tag) => bib.tags.includes(tag.id));
                const defaultIcon = defaults.bibliography.icon;
                return {
                    start: (
                        <Icon
                            style={{
                                background: colorValues[theme][bib?.icon?.color || defaultIcon.color],
                                color: "var(--md-sys-color-surface)",
                            }}
                            className="rounded-full p-5"
                            name={bib?.icon?.name || defaultIcon.name}
                        />
                    ),
                    title: (
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1 font-semibold">
                                {bib.title}
                                <small className="font-normal">{bib.citations.length}</small>
                            </div>
                            <small>{timeAgo(bib.dateModified)}</small>
                        </div>
                    ),
                    description: (
                        <div className="flex items-center justify-between">
                            <div>{bib.style.name.short || bib.style.name.long.replace(/\((.*?)\)/g, "")}</div>
                            <button
                                type="button"
                                className="h-6 w-6 cursor-pointer border-none bg-transparent p-0"
                                onClick={() => {
                                    if (!disableStar) {
                                        addBibToFavorite(bib.id);
                                    }
                                }}
                            >
                                {bib?.favorite ? <FilledStar /> : <EmptyStar />}
                            </button>
                        </div>
                    ),
                    content: bibTags && bibTags.length !== 0 && (
                        <ChipSet
                            chips={bibTags.map((tag) => {
                                return {
                                    ...tag,
                                    selected: true,
                                };
                            })}
                        />
                    ),
                    onClick: () => onBibClick(bib),
                    style: {
                        backgroundColor: highlightedBibs.includes(bib.id)
                            ? "var(--md-sys-color-secondary-container)"
                            : "",
                    },
                };
            })}
        />
    );
}
