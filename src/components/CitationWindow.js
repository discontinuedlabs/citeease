import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";

// Source types
import Journal from "./sourceTypes/Journal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

export default function CitationWindow(props) {
    const { id: bibliographyId } = useParams();
    const {
        id: citationId,
        bibliographies,
        setBibliographies,
        sourceType,
        setCitationWindowVisible,
        showAcceptDialog,
    } = props;
    const bibliography = bibliographyId ? bibliographies.find((bib) => bib.id === bibliographyId) : undefined;

    const [citation, setCitation] = useState(bibliography.citations.find((cit) => cit.id === citationId));
    const [cslFile, setCslFile] = useState();
    const [content, setContent] = useState(citation ? citation.content : {});

    const citationControlProps = {
        citation,
        content,
        setContent,
        setCitationWindowVisible,
        showAcceptDialog,
    };

    const CITATION_COMPONENTS = {
        Journal: Journal(citationControlProps),
        Book: Book(citationControlProps),
        Webpage: Webpage(citationControlProps),
    };

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/cslFiles/${bibliography.style.code}.csl`)
            .then((response) => response.text())
            .then((data) => {
                setCslFile(data);
            })
            .catch((error) => console.error("Error fetching CSL file:", error));
    }, [bibliography.style]);

    useEffect(() => {
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((bib) => {
                if (bib.id === bibliographyId) {
                    return {
                        ...bib,
                        citations: bib.citations.map((cit) => {
                            if (cit.id === citationId) {
                                return citation;
                            }
                            return cit;
                        }),
                    };
                }
                return bib;
            });
        });
    }, [citation]);

    useEffect(() => {
        async function formatCitation() {
            if (!cslFile) return;

            let config = plugins.config.get("@csl");
            config.templates.add(bibliography.style.code, cslFile);

            let cite = await Cite.async(content);

            let formattedCitation = cite.format("bibliography", {
                format: "html",
                template: bibliography.style.code,
                lang: "en-US",
            });

            updateReference(formattedCitation);
        }
        formatCitation();
    }, [content, cslFile, bibliography.style.code]);

    function updateReference(newReference) {
        setCitation((prevCitation) => {
            return { ...prevCitation, reference: newReference };
        });
    }

    return CITATION_COMPONENTS[sourceType];
}
