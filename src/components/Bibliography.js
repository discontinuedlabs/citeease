import "../css/Bibliography.css";
import { v4 as uuid4 } from "uuid";
import { useParams } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import CitationWindow from "./CitationWindow";
import AutoResizingTextarea from "./formElements/AutoResizingTextarea";
import { useState } from "react";
import ReferenceEntry from "./ReferenceEntry.js";

export default function Bibliography(props) {
    const { id: bibliographyId } = useParams();
    const { bibliographies, setBibliographies, font } = props;
    const bibliography = bibliographies.find((bib) => bib.id === bibliographyId);

    const [sourceType, setSourceType] = useState("Webpage"); // Can be changed to any other source type as default
    const [citationWindowVisible, setCitationWindowVisible] = useState(false);
    const [addCitationMenuVisible, setAddCitationMenuVisible] = useState(false);
    const [chosenCitationId, setChosenCitationId] = useState();

    // TODO: Change this to an option in the setting that also have an accept button to prevent changing the title by accident
    function updateBibliographyTitle(event) {
        const newTitle = event.target.value;
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((bib) => (bib.id === bibliographyId ? { ...bib, title: newTitle } : bib));
        });
    }

    function openCitationMenu(event) {
        // TODO: First check if there are checked reference entries, if no one is checked, it sets the chosenCitation as a newCitation
        const newCitationId = uuid4();
        addNewCitationToBibliography(newCitationId);
        setChosenCitationId(newCitationId);
        setSourceType(event.target.textContent);
        setCitationWindowVisible(true);
        setAddCitationMenuVisible(false);
    }

    function addNewCitationToBibliography(id) {
        const newCitation = {
            id: id,
            content: { id: id, author: [{ given: "", family: "", id: uuid4() }] },
            isChecked: false,
            reference: "",
            new: true,
        };
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((bib) => {
                if (bib.id === bibliographyId) {
                    return { ...bib, citations: [...bib.citations, newCitation] };
                }
                return bib;
            });
        });
    }

    // function handleCopy() {
    //     try {
    //         const regex = /(<([^>]+)>)/gi;
    //         const cleanedReference = citation.reference.replace(regex, "");
    //         navigator.clipboard.writeText(cleanedReference);
    //     } catch (err) {
    //         console.error("Failed to copy text: ", err);
    //     }
    // }

    // function handleMove() {}

    // function handleDuplicate() {
    //     const newCitation = { ...citation, id: uuid4() };

    //     setBibliographies((prevBibliographies) => {
    //         return prevBibliographies.map((biblio) =>
    //             biblio.id === bibliographyId
    //                 ? {
    //                       ...biblio,
    //                       citations: [...biblio.citations, newCitation],
    //                   }
    //                 : biblio
    //         );
    //     });
    // }

    // function handleDelete() {
    //     setBibliographies((prevBibliographies) => {
    //         return prevBibliographies.map((biblio) =>
    //             biblio.id === bibliographyId
    //                 ? {
    //                       ...biblio,
    //                       citations: biblio.citations.filter((c) => c.id !== id),
    //                   }
    //                 : biblio
    //         );
    //     });
    // }

    function searchByIdentifier() {}

    function handleImportCitation() {}

    return (
        <div className="bibliography">
            <div className="bibliography-header">
                <h3>{bibliography.style.name}</h3>
                {/* <ContextMenu
                    icon="more_vert"
                    options={[
                        { label: "Copy to clipboard", method: handleCopy },
                        {
                            label: "Export to LaTeX",
                            method: () => LaTeX.exportToLaTeX(bibliography.title, citation),
                        },

                        "DEVIDER",

                        { label: "Move", method: handleMove },
                        { label: "Duplicate", method: handleDuplicate },

                        "DEVIDER",

                        content.url && {
                            label: "Visit website",
                            method: () => window.open(content.url, "_blank"),
                        },
                        { label: "Edit", method: toggleEditMode },

                        "DEVIDER",

                        { label: "Delete", method: handleDelete, icon: "delete", style: { color: "crimson" } },
                    ]}
                    menuStyle={{
                        position: "absolute",
                        right: "0",
                    }}
                    buttonType={"smallButton"}
                /> */}
            </div>

            <AutoResizingTextarea
                value={bibliography.title}
                className="bibliography-title"
                onChange={updateBibliographyTitle}
                maxLength={200}
                rows={1}
                spellCheck="false"
            />

            <div className="citations-container">
                {bibliography.citations.map((citation) => (
                    <ReferenceEntry citation={citation} font={font} key={citation.id} />
                ))}
            </div>

            {citationWindowVisible && (
                <CitationWindow
                    className="citation-window"
                    {...props}
                    id={chosenCitationId}
                    sourceType={sourceType}
                    setCitationWindowVisible={setCitationWindowVisible}
                />
            )}

            {addCitationMenuVisible && (
                <div
                    style={{ position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}
                    className="add-citation-menu"
                >
                    <h3>Add citation</h3>
                    <button onClick={() => setAddCitationMenuVisible(false)}>X</button>
                    <div>
                        <input
                            type="text"
                            name="search-by-identifier"
                            placeholder="Search by title, URL, DOI, or ISBN"
                        ></input>
                        <button onClick={searchByIdentifier}>Search</button>
                    </div>
                    <button onClick={handleImportCitation}>Import citation</button>
                    <ContextMenu
                        label="Choose source type"
                        options={[
                            { label: "Webpage", method: openCitationMenu },
                            { label: "Journal article", method: openCitationMenu },
                            { label: "Book", method: openCitationMenu },
                        ]}
                        menuStyle={{ position: "fixed", bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
                    />
                </div>
            )}

            <button onClick={() => setAddCitationMenuVisible(true)}>Add citation</button>
        </div>
    );
}