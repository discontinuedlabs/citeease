import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Source types
import JournalArticle from "./sourceTypes/JournalArticle";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

export default function CitationWindow(props) {
    const { id: bibliographyId } = useParams();
    const { bibliographies, dispatch, ACTIONS, sourceType, setCitationWindowVisible, showAcceptDialog } = props;
    const bibliography = bibliographyId ? bibliographies.find((bib) => bib.id === bibliographyId) : undefined;
    const editedCitation = bibliography.editedCitation;
    const [content, setContent] = useState(editedCitation ? editedCitation.content : {});

    const citationControlProps = {
        content,
        setContent,
        showAcceptDialog,
        handleAddReference,
        handleCancel,
    };

    const CITATION_COMPONENTS = {
        "Journal article": JournalArticle(citationControlProps),
        Book: Book(citationControlProps),
        Webpage: Webpage(citationControlProps),
    };

    useEffect(() => {
        function updateContentInEditedCitation() {
            dispatch({
                type: ACTIONS.UPDATE_CONTENT_IN_EDITED_CITATION,
                bibliographyId: bibliographyId,
                content: content,
            });
        }
        updateContentInEditedCitation();
    }, [content]);

    function handleAddReference(event) {
        event.preventDefault();
        dispatch({
            type: ACTIONS.UPDATE_CITATION_IN_BIBLIOGRAPHY,
            bibliographyId: bibliographyId,
            editedCitation: editedCitation,
        });
        setCitationWindowVisible(false);
    }

    function handleCancel() {
        setCitationWindowVisible(false);
    }

    return <div className="citation-window">{CITATION_COMPONENTS[sourceType]}</div>;
}
