import { useState } from "react";
import Citation from "./Citation";
import { v4 as uuid4 } from "uuid";
import { useParams } from "react-router-dom";

export default function Bibliography(props) {
    const { id } = useParams();
    const { bibliographies, setBibliographies } = props;
    const bibliography = bibliographies.find((b) => b.id === id);

    const [sourceOptionsHidden, setSourceOptionsHidden] = useState(true);
    const sources = ["Webpage", "Journal", "Book"];

    function handleTitleChange(event) {
        const newTitle = event.target.value;
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((b) => (b.id === id ? { ...b, title: newTitle } : b));
        });
    }

    function handleAddCitation(event) {
        toggleSourceOptions();
        const sourceType = event.target.textContent;
        const newCitation = {
            sourceType: sourceType,
            id: uuid4(),
            reference: "",
            content: {},
        };
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((b) =>
                b.id === id ? { ...b, citations: [...bibliography.citations, newCitation] } : b
            );
        });
    }

    function toggleSourceOptions() {
        setSourceOptionsHidden((prevSourceOptionsHidden) => !prevSourceOptionsHidden);
    }

    return (
        <div className="bibliography">
            <input
                type="text"
                value={bibliography.title}
                className="bibliography-title"
                onChange={handleTitleChange}
                maxLength={10}
            />
            <p>{bibliography.style || ""}</p>
            <p>{id}</p>

            <div className="citations-container">
                {bibliography.citations.map((c) => (
                    <Citation
                        key={c.id}
                        id={c.id}
                        bibliographies={bibliographies}
                        setBibliographies={setBibliographies}
                    />
                ))}
            </div>

            <button onClick={toggleSourceOptions}>Add Citation</button>

            <div className={`source-options ${sourceOptionsHidden && "hidden"}`}>
                {sources.map((s) => (
                    <button onClick={handleAddCitation} key={s}>
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
