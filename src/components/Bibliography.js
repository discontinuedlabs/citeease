import { useState } from "react";
import Citation from "./Citation";
import { v4 as uuid4 } from "uuid";
import { useParams } from "react-router-dom";

export default function Bibliography(props) {
    const { id } = useParams();
    const { bibliographies, setBibliographies } = props;
    const content = bibliographies.find((b) => b.id === id);
    const [style, setStyle] = useState(content.style || "");
    const [title, setTitle] = useState(content.title || "");
    const [citations, setCitations] = useState(content.citations || []);
    const [sourceOptionsHidden, setSourceOptionsHidden] = useState(true);

    const sources = ["Journal", "Book", "Website"];

    function handleTitleChange(event) {
        const newTitle = event.target.value;
        setTitle(newTitle);
        setBibliographies((prevBibliographies) => {
            const updatedBibliographies = prevBibliographies.map((bibliography) =>
                bibliography.id === id ? { ...bibliography, title: newTitle } : bibliography
            );
            return updatedBibliographies;
        });
    }

    function handleAddCitation(event) {
        const source = event.target.textContent;
        const newCitation = {
            source: source,
            id: uuid4(),
            content: {},
        };
        setCitations((prevCitations) => [...prevCitations, newCitation]);
        setBibliographies((prevBibliographies) => {
            const updatedBibliographies = prevBibliographies.map((bibliography) =>
                bibliography.id === id
                    ? { ...bibliography, citations: [...citations, newCitation] }
                    : bibliography
            );
            return updatedBibliographies;
        });
    }

    function toggleSourceOptions() {
        setSourceOptionsHidden((prevSourceOptionsHidden) => !prevSourceOptionsHidden);
    }

    return (
        <div className="bibliography">
            <input
                type="text"
                value={title}
                className="bibliography-title"
                onChange={handleTitleChange}
            />
            <p>{style || ""}</p>
            <p>{id}</p>

            <div className="citations-container">
                {citations.map((citation) => (
                    <Citation key={citation.id} />
                ))}
            </div>

            <button onClick={toggleSourceOptions}>Add Citation</button>

            <div className={`source-options ${sourceOptionsHidden && "hidden"}`}>
                {sources.map((source) => (
                    <button onClick={handleAddCitation} key={source}>
                        {source}
                    </button>
                ))}
            </div>
        </div>
    );
}
