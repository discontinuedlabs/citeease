import { ACTIONS } from "./reducers/bibliographiesReducer";
import BibliographyCard from "./ui/BibliographyCard";

export default function MoveWindow(props) {
    const {
        bibliographies,
        bibliographyId,
        citations,
        checkedCitations,
        setMoveWindowVisible,
        applyOnAll,
        dispatch,
        showConfirmDialog,
    } = props;

    function handleMove(bibliographyId) {
        console.log(applyOnAll);
        dispatch({
            type: ACTIONS.DUPLICATE_SELECTED_CITATIONS, // Duplicate has the same effect of moving, but the bibliographyId is different
            payload: {
                bibliographyId: bibliographyId,
                checkedCitations: applyOnAll ? citations : checkedCitations,
            },
        });
        setMoveWindowVisible(false);
    }

    return (
        <div className="move-window">
            <button onClick={() => setMoveWindowVisible(false)}>X</button>
            {bibliographies.map((bib) => {
                if (bib.id !== bibliographyId)
                    return (
                        <div
                            onClick={() => {
                                if (applyOnAll)
                                    showConfirmDialog(
                                        `Merge with ${bib.title}?`,
                                        "This will move all citations in this bibliography to the selected one. Are you sure you want to proceed?",
                                        () => handleMove(bib.id),
                                        "Merge",
                                        "Cancel"
                                    );
                                else handleMove(bib.id); // Move without showing ConfirmDialog
                            }}
                        >
                            <BibliographyCard bibliography={bib} />
                        </div>
                    );
                return null;
            })}
        </div>
    );
}
