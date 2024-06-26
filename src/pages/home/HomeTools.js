import { doc, getDoc, setDoc } from "firebase/firestore";
import { useId, useRef, useState } from "react";
import db from "../../data/db/firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { mergeWithCurrent } from "../../data/store/slices/bibsSlice";
import { useAuth } from "../../context/AuthContext";

export function CoBibsSearchDialog({ setIsVisible }) {
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const id = useId();
    const searchRef = useRef();
    const passwordRef = useRef();
    const bibliographies = useSelector((state) => state.bibliographies);
    const dispatch = useDispatch();
    const { currentUser } = useAuth();

    async function handleSearch(event) {
        event.preventDefault();
        console.log();
        try {
            setSearchError(null);
            setSearchLoading(true);
            const docRef = doc(db, "coBibs", searchRef.current.value);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const result = JSON.parse(docSnap.data().bibliography);
                if (bibliographies.some((bib) => bib.id === result.id)) {
                    setSearchError(`You are already a collaborator in ${result.title} (${result.collab.id})`);
                } else {
                    setSearchResult(result);
                }
            } else {
                setSearchError("No such collaborative bibliography!");
            }
        } catch (error) {
            setSearchError(error);
        }
        setSearchLoading(false);
    }

    async function handleJoin(event) {
        event.preventDefault();
        try {
            setPasswordError(null);
            setPasswordLoading(true);
            if (passwordRef.current.value === searchResult.collab.password) {
                const newCoBibState = {
                    ...searchResult,
                    collab: {
                        ...searchResult.collab,
                        collaborators: [
                            ...searchResult.collab.collaborators,
                            { name: currentUser.displayName, id: currentUser.uid },
                        ],
                    },
                };
                const coBibRef = doc(db, "coBibs", newCoBibState.collab.id);
                await setDoc(coBibRef, { bibliography: JSON.stringify(newCoBibState) });
                dispatch(mergeWithCurrent({ bibliographies: [newCoBibState] }));

                // push the user to coBib.collaborators
                // push the coBib to the users bibliographies array
                // Show toast: `You successfully joined ${result.title} (${result.collab.id})`
            } else {
                setPasswordError("The password you entered is wrong");
            }
        } catch (error) {
            setPasswordError(error);
        }
        setPasswordLoading(false);
    }

    return (
        <div>
            <h3>Search for collaborative bibliographies</h3>
            <button onClick={() => setIsVisible(false)}>X</button>

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
                        <div>Number of collaborators: {searchResult.collab.collaborators.length}</div>
                    </div>
                    <pre>{passwordError}</pre>
                    <form onSubmit={handleJoin}>
                        <label htmlFor={`${id}-password`}>Enter the password to join</label>
                        <input ref={passwordRef} type="password" name="password" id={`${id}-password`} />
                        <button type="submit" disabled={passwordLoading}>
                            Join
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
