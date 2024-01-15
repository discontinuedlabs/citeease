import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid4 } from "uuid";
import * as LaTeX from "./LaTeX";
import "../css/Citation.css";

// Source Types
import Journal from "./sourceTypes/Journal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

// Citations Styles
import APA from "./citationStyles/APA";
import MLA from "./citationStyles/MLA";
import Chicago from "./citationStyles/Chicago";
import ContextMenu from "./ContextMenu";

export default function Citation(props) {
    const { id: bibliographyId } = useParams();
    const { id, bibliographies, setBibliographies, font, showToast } = props;
    const bibliography = bibliographies.find((b) => b.id === bibliographyId);

    const [citation, setCitation] = useState(bibliography.citations.find((c) => c.id === id));
    const [content, setContent] = useState(citation.content);
    const [isEditModeVisible, setIsEditModeVisible] = useState(false);

    const citationControlProps = {
        content,
        setContent,
        toggleEditMode,
        showToast,
        setCitation,
    };
    const citationComponents = {
        Journal: Journal(citationControlProps),
        Book: Book(citationControlProps),
        Webpage: Webpage(citationControlProps),
    };

    useEffect(() => {
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === bibliographyId
                    ? {
                          ...biblio,
                          citations: biblio.citations.map((c) => (c.id === citation.id ? citation : c)),
                      }
                    : biblio
            );
        });
    }, [citation]);

    useEffect(() => {
        setCitation((prevCitation) => ({
            ...prevCitation,
            reference: citation.reference,
        }));
    }, [citation.reference]);

    useEffect(() => {
        console.log(citation.referenceCompleted);
        toggleEditMode();
    }, [citation.referenceCompleted]);

    useEffect(() => {
        const newReference = generateCitationReference();
        setCitation((prevCitation) => ({
            ...prevCitation,
            reference: newReference,
            content: content,
        }));
    }, [content]);

    function toggleEditMode(deleteIfNotComplete = false) {
        if (deleteIfNotComplete && !citation.referenceCompleted) handleDelete();
        else setIsEditModeVisible((prevEditMode) => !prevEditMode);
    }

    function handleCopy() {
        try {
            navigator.clipboard.writeText(citation.reference);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }

    function handleDuplicate() {
        const newCitation = { ...citation, id: uuid4() };

        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === bibliographyId
                    ? {
                          ...biblio,
                          citations: [...biblio.citations, newCitation],
                      }
                    : biblio
            );
        });
    }

    function handleDelete() {
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === bibliographyId
                    ? {
                          ...biblio,
                          citations: biblio.citations.filter((c) => c.id !== id),
                      }
                    : biblio
            );
        });
    }

    function generateCitationReference() {
        switch (bibliography.style) {
            case "APA":
                return APA(content, citation.sourceType);
            case "MLA":
                return MLA(content, citation.sourceType);
            case "Chicago":
                return Chicago(content, citation.sourceType);
            default:
                throw new Error(`Unknown citation style: ${bibliography.style}`);
        }
    }

    return (
        <div className="citation">
            {citation.referenceCompleted && !isEditModeVisible && (
                <>
                    <div style={{ fontFamily: font.family }} dangerouslySetInnerHTML={{ __html: citation.reference }} />

                    <ContextMenu
                        label="Options"
                        options={[
                            { label: "Copy to clipboard", method: handleCopy },
                            {
                                label: "Export to LaTeX",
                                method: () => LaTeX.exportToLaTeX(bibliography.title, citation),
                            },
                            { label: "Edit", method: toggleEditMode },
                            { label: "Duplicate", method: handleDuplicate },
                            content.url && { label: "Visit website", method: () => window.open(content.url, "_blank") },
                            { label: "Delete", method: handleDelete },
                        ]}
                    />
                </>
            )}

            {/* We are invoking the Component as a function instead of treating it as a React component.
            This is a common practice when you need to compute the component's output without rendering it.
            However, keep in mind that this approach disconnects the component from the React lifecycle,
            meaning it won't have access to lifecycle methods or state management features. So avoid using
            useState inside of them. For more details, refer to this article:
            https://dev.to/igor_bykov/react-calling-functional-components-as-functions-1d3l */}
            {(!citation.referenceCompleted || isEditModeVisible) && citationComponents[citation.sourceType]}
        </div>
    );
}
