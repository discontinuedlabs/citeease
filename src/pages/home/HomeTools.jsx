import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import db from "../../data/db/firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { mergeWithCurrentBibs } from "../../data/store/slices/bibsSlice";
import { useToast } from "../../context/ToastContext.tsx";
import { useModal } from "../../context/ModalContext.tsx";
import { setTryingToJoinBib } from "../../data/store/slices/settingsSlice";

export function CoBibsSearchDialog({ setIsVisible, tryingToJoinBib }) {
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
    const dispatch = useDispatch();
    const toast = useToast();
    const navigate = useNavigate();
    const modal = useModal();

    useEffect(() => {
        if (!currentUser) {
            modal.open({
                showCloseIcon: false,
                title: "Login required",
                message: "You need to log in first to use this feature.",
                actions: [
                    ["Log in", () => navigate("/login"), { autoFocus: true }],
                    [
                        "Cancel",
                        () => {
                            setIsVisible(false);
                            modal.close();
                        },
                    ],
                ],
            });

            return undefined;
        }
        return undefined;
    }, []);

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
            setSearchError(error);
        }

        setSearchLoading(false);
        dispatch(setTryingToJoinBib({ bibId: null }));
    }

    useEffect(() => {
        if (tryingToJoinBib && bibsLoaded) {
            searchForBib(tryingToJoinBib);
        }
    }, [tryingToJoinBib, bibsLoaded]);

    async function handleSearch(event) {
        event.preventDefault();
        searchForBib(searchRef.current.value);
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
            setPasswordError(error.message);
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

export function Temp() {
    return <div />;
}
