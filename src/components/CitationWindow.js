import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Source types
import JournalArticle from "./sourceTypes/JournalArticle";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

export default function CitationWindow(props) {
    const { id: bibliographyId } = useParams();
    const { bibliographies, setBibliographies, sourceType, setCitationWindowVisible, showAcceptDialog } = props;
    const bibliography = bibliographyId ? bibliographies.find((bib) => bib.id === bibliographyId) : undefined;

    const [editedCitation, setEditedCitation] = useState(bibliography.editedCitation);
    const [content, setContent] = useState(editedCitation ? editedCitation.content : {});

    const citationControlProps = {
        content,
        setContent,
        setCitationWindowVisible,
        showAcceptDialog,
        handleAddReference,
    };

    const CITATION_COMPONENTS = {
        "Journal article": JournalArticle(citationControlProps),
        Book: Book(citationControlProps),
        Webpage: Webpage(citationControlProps),
    };

    useEffect(() => {
        console.log(editedCitation);
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((bib) => {
                if (bib.id === bibliographyId) {
                    const citationIndex = bib.citations.findIndex((cit) => cit.id === editedCitation.id);
                    let updatedCitations;

                    if (citationIndex !== -1) {
                        // If the citation exists, update it
                        updatedCitations = bib.citations.map((cit, index) => {
                            if (index === citationIndex) {
                                return { ...cit, ...editedCitation }; // Update the existing citation
                            }
                            return cit;
                        });
                    } else {
                        // If the citation doesn't exist, add it
                        updatedCitations = [...bib.citations, editedCitation];
                    }

                    return {
                        ...bib,
                        citations: updatedCitations,
                    };
                }
                return bib;
            });
        });
    }, [editedCitation, bibliographyId, setBibliographies]);

    function handleAddReference(event, newContent) {
        console.log(newContent);
        event.preventDefault();
        setEditedCitation((prevCitation) => {
            // Create a new object to ensure React recognizes the change
            return { ...prevCitation, content: newContent };
        });
        setCitationWindowVisible(false);
    }

    return <div className="citation-window">{CITATION_COMPONENTS[sourceType]}</div>;
}
