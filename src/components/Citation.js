import Journal from "./sourceTypes/Journal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Citation(props) {
    const { id: bibliographyId } = useParams();
    const { id, bibliographies, setBibliographies } = props;
    const bibliography = bibliographies.find((b) => b.id === bibliographyId);

    const [citation, setCitation] = useState(bibliography.citations.find((c) => c.id === id));
    const [reference, setReference] = useState(citation.reference);
    const [content, setContent] = useState(citation.content);
    const [isEditModeVisible, setIsEditModeVisible] = useState(false);

    const citationControlProps = { content, setContent, toggleEditMode };
    const citationComponents = {
        Journal: Journal(citationControlProps),
        Book: Book(citationControlProps),
        Webpage: Webpage(citationControlProps),
    };
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    useEffect(() => {
        setBibliographies((prevBibliographies) => {
            return prevBibliographies.map((biblio) =>
                biblio.id === bibliographyId
                    ? {
                          ...biblio,
                          citations: biblio.citations.map((c) =>
                              c.id === citation.id ? citation : c
                          ),
                      }
                    : biblio
            );
        });
    }, [citation]);

    useEffect(() => {
        setCitation((prevCitation) => ({
            ...prevCitation,
            reference: reference,
        }));
    }, [reference]);

    useEffect(() => {
        const newReference = generateCitationReference(content);
        setCitation((prevCitation) => ({
            ...prevCitation,
            reference: newReference,
            content: content,
        }));
    }, [content]);

    function toggleEditMode() {
        setIsEditModeVisible((prevEditMode) => !prevEditMode);
    }

    function formatAuthors(authors) {
        if (!authors || authors.length === 0) return "";

        const validAuthors = authors.filter((author) => author.firstName && author.lastName);
        const formattedAuthors = validAuthors.map((author, index) => {
            let lastNames = author.lastName.split(/\s+/g);
            const lastName = lastNames.pop();
            lastNames.unshift(author.firstName);
            const initials = lastNames.map((name) => name[0].toUpperCase()).join(". ");

            if (validAuthors.length > 1 && index === validAuthors.length - 1) {
                return `& ${lastName}, ${initials}.`;
            }
            return `${lastName}, ${initials}.`;
        });

        return formattedAuthors.join(", ");
    }

    // TODO: Add error handling for unexpected behaviors, and add more comments
    function generateCitationReference(content) {
        let {
            authors,
            publishDate,
            retrievalDate,
            title,
            url,
            volume,
            issue,
            pages,
            publisher,
            editor,
            edition,
            website,
            doi,
            place,
            source,
        } = content;

        const todaysDate = new Date();
        publishDate = publishDate ? new Date(publishDate) : "";
        publishDate = publishDate
            ? `${publishDate.getFullYear()}, ${
                  monthNames[publishDate.getMonth()]
              } ${publishDate.getDate()}`
            : todaysDate.getFullYear();

        retrievalDate =
            retrievalDate ??
            `${
                monthNames[todaysDate.getMonth()]
            } ${todaysDate.getDate()}, ${todaysDate.getFullYear()}`;

        function APA() {
            let newReference;

            if (citation.sourceType === "Webpage") {
                if (authors && authors.length > 0) {
                    newReference = `${formatAuthors(authors)} (${publishDate}). ${
                        title ? `${title}.` : ""
                    } ${website ? `${website}.` : ""} ${
                        publisher ? `Publisher: ${publisher}.` : ""
                    } Retrieved from ${url} on ${retrievalDate || "n.d."}`;
                } else {
                    newReference = `${title} (${publishDate}). ${website ? `${website}.` : ""} ${
                        publisher ? `Publisher: ${publisher}.` : ""
                    } Retrieved from ${url} on ${retrievalDate || "n.d."}`;
                }
            } else if (citation.sourceType === "Journal") {
                newReference = `${formatAuthors(
                    authors
                )}. (${publishDate}). ${title}. *${source}*, ${volume}(${issue}), ${pages}. DOI: ${
                    doi || ""
                }`;
            } else if (citation.sourceType === "Book") {
                newReference = `${formatAuthors(authors)}. (${publishDate}). ${title}. ${source}. ${
                    place || ""
                }: ${publisher || ""}${editor ? ", Edited by " + editor : ""}${
                    edition ? ", " + edition + " ed." : ""
                }. ${url || doi ? `Retrieved from ${url || doi}` : ""} on ${
                    retrievalDate || "n.d."
                }`;
            }
            return newReference;
        }

        function MLA() {
            let newReference;
            return newReference;
        }

        function Chicago() {
            let newReference;
            return newReference;
        }

        switch (bibliography.style) {
            case "APA":
                return APA(content);
            case "MLA":
                return MLA(content);
            case "Chicago":
                return Chicago(content);
            default:
                throw new Error(`Unknown citation style: ${bibliography.style}`);
        }
    }

    return (
        <div className="citation-box">
            {!isEditModeVisible && (
                <>
                    <p>{citation.reference}</p>
                    <button onClick={toggleEditMode}>Edit</button>
                </>
            )}

            {/* We are invoking the Component as a function instead of treating it as a React component.
            This is a common practice when you need to compute the component's output without rendering it.
            However, keep in mind that this approach disconnects the component from the React lifecycle,
            meaning it won't have access to lifecycle methods or state management features. So avoid using
            useState inside of them. For more details, refer to this article:
            https://dev.to/igor_bykov/react-calling-functional-components-as-functions-1d3l */}
            {isEditModeVisible && citationComponents[citation.sourceType]}
        </div>
    );
}
