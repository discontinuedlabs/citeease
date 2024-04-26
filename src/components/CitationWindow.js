import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SOURCE_TYPES } from "./Bibliography";

// Source types
import ArticleJournal from "./sourceTypes/ArticleJournal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

export default function CitationWindow(props) {
    const { id: bibliographyId } = useParams();
    const { bibliographies, dispatch, ACTIONS, setCitationWindowVisible, showAcceptDialog } = props;
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
        [SOURCE_TYPES.ARTICLE_JOURNAL.code]: ArticleJournal(citationControlProps),
        [SOURCE_TYPES.BOOK.code]: Book(citationControlProps),
        [SOURCE_TYPES.WEBPAGE.code]: Webpage(citationControlProps),
    };

    useEffect(() => {
        function updateContentInEditedCitation() {
            dispatch({
                type: ACTIONS.UPDATE_CONTENT_IN_EDITED_CITATION,
                payload: { bibliographyId: bibliographyId, content: content },
            });
        }
        updateContentInEditedCitation();
    }, [content]);

    function handleAddReference(event) {
        event.preventDefault();
        dispatch({
            type: ACTIONS.UPDATE_CITATION_IN_BIBLIOGRAPHY,
            payload: { bibliographyId: bibliographyId, editedCitation: editedCitation },
        });
        setCitationWindowVisible(false);
    }

    function handleCancel() {
        setCitationWindowVisible(false);
    }

    console.log(content.type);
    return <div className="citation-window">{CITATION_COMPONENTS[content.type]}</div>;
}
