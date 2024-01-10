import { useState } from "react";
import Citation from "./Citation";
import { v4 as uuid4 } from "uuid";
import { useParams } from "react-router-dom";

export default function Bibliography(props) {
    const { id } = useParams();
    const { bibliographies, setBibliographies, showToast } = props;
    const bibliography = bibliographies.find((biblio) => biblio.id === id);

    const [isSourceOptionsHidden, setIsSourceOptionsHidden] = useState(true);
    const sources = ["Webpage", "Journal", "Book"];

    function updateBibliographyTitle(event) {
        const newTitle = event.target.value;
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === id ? { ...biblio, title: newTitle } : biblio
            );
        });
    }

    function addCitationWithSourceType(event) {
        toggleSourceOptions();
        const sourceType = event.target.textContent;
        const newCitation = {
            sourceType: sourceType,
            id: uuid4(),
            reference: "",
            content: {},
        };
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === id
                    ? { ...biblio, citations: [...bibliography.citations, newCitation] }
                    : biblio
            );
        });
    }

    function toggleSourceOptions() {
        setIsSourceOptionsHidden((prevSourceOptionsHidden) => !prevSourceOptionsHidden);
    }

    return (
        <div className="bibliography">
            <input
                type="text"
                value={bibliography.title}
                className="bibliography-title"
                onChange={updateBibliographyTitle}
                maxLength={100}
            />
            <p>{bibliography.style || ""}</p>
            <p>{id}</p>

            <div className="citations-container">
                {bibliography.citations.map((citation) => (
                    <Citation
                        key={citation.id}
                        id={citation.id}
                        bibliographies={bibliographies}
                        setBibliographies={setBibliographies}
                        showToast={showToast}
                    />
                ))}
            </div>

            <button onClick={toggleSourceOptions}>Add Citation</button>

            <div className={`source-options ${isSourceOptionsHidden && "hidden"}`}>
                {sources.map((source) => (
                    <button onClick={addCitationWithSourceType} key={source}>
                        {source}
                    </button>
                ))}
            </div>
        </div>
    );
}
