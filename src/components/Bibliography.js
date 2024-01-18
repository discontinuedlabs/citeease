import Citation from "./Citation";
import { v4 as uuid4 } from "uuid";
import { useParams } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import AutoResizingTextarea from "./formElements/AutoResizingTextarea";

export default function Bibliography(props) {
    const { id } = useParams();
    const { bibliographies, setBibliographies } = props;
    const bibliography = bibliographies.find((biblio) => biblio.id === id);

    function updateBibliographyTitle(event) {
        const newTitle = event.target.value;
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) => (biblio.id === id ? { ...biblio, title: newTitle } : biblio));
        });
    }

    function addCitationWithSourceType(event) {
        const sourceType = event.target.textContent;
        const newCitation = {
            sourceType: sourceType,
            id: uuid4(),
            reference: "",
            referenceCompleted: false,
            content: { authors: [{ firstName: "", lastName: "", id: uuid4() }] },
        };
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === id ? { ...biblio, citations: [...bibliography.citations, newCitation] } : biblio
            );
        });
    }

    return (
        <div className="bibliography">
            <div className="bibliography-header">
                <h3>{bibliography.style}</h3>
                <ContextMenu icon="more_vert" />
            </div>

            <AutoResizingTextarea
                value={bibliography.title}
                className="bibliography-title"
                onChange={updateBibliographyTitle}
                maxLength={200}
                rows={1}
                spellcheck="false"
            />

            <div className="citations-container">
                {bibliography.citations.map((citation) => (
                    <Citation key={citation.id} id={citation.id} {...props} />
                ))}
            </div>

            <ContextMenu
                label="Add Citation"
                options={[
                    { label: "Webpage", method: addCitationWithSourceType },
                    { label: "Journal", method: addCitationWithSourceType },
                    { label: "Book", method: addCitationWithSourceType },
                ]}
            />
        </div>
    );
}
