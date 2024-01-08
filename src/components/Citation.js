import Journal from "./sourceTypes/Journal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid4 } from "uuid";

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

    function deleteCitation() {
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

    // TODO: Needs the rule of more than 20 authors
    function formatAuthorsForReference(authors) {
        const formattedAuthors = authors.map((author, index) => {
            if (author.firstName && author.lastName) {
                let lastNames = author.lastName.split(/\s+/g);
                const lastName = lastNames.pop();
                lastNames.unshift(author.firstName);
                const initials = lastNames.map((name) => name[0].toUpperCase()).join(". ");

                if (authors.length > 1 && index === authors.length - 1) {
                    return `& ${lastName}, ${initials}.`;
                }
                return `${lastName}, ${initials}.`;
            } else if (author.firstName) return `${author.firstName}`;
            else return "";
        });

        return formattedAuthors.join(", ");
    }

    function formatAuthorsForLaTeX(authors) {
        if (!Array.isArray(authors)) {
            return "";
        }
        const formattedAuthors = authors.map((author) => {
            const fullName = `${author.firstName} ${author.lastName}`;
            return fullName.trim();
        });
        return formattedAuthors.join(" and ");
    }

    function generateLaTeXCitation(content) {
        let latexCitation = "";

        if (citation.sourceType === "Webpage") {
            latexCitation += `@online{${content.id},\n`;
            latexCitation += content.title && `\ttitle={${content.title}},\n`;
            latexCitation +=
                content.authors &&
                content.authors[0].firstName &&
                `\tauthor={${formatAuthorsForLaTeX(content.authors)}},\n`;
            latexCitation +=
                content.publishDate && `\tyear={${new Date(content.publishDate).getFullYear()}},\n`;
            latexCitation += content.url && `\thowpublished={${content.url}}\n`;
            latexCitation += `}\n\n`;
        }

        if (citation.sourceType === "Journal") {
            latexCitation += `@article{${content.id},\n`;
            latexCitation += content.title && `\ttitle={${content.title}},\n`;
            latexCitation +=
                content.authors &&
                content.authors[0].firstName &&
                `\tauthor={${formatAuthorsForLaTeX(content.authors)}},\n`;
            latexCitation +=
                content.publishDate && `\tyear={${new Date(content.publishDate).getFullYear()}},\n`;
            latexCitation += content.journal && `\tjournal={${content.journal}},\n`;
            latexCitation += content.volume && `\tvolume={${content.volume}},\n`;
            latexCitation += content.number && `\tnumber={${content.number}},\n`;
            latexCitation += content.pages && `\tpages={${content.pages}}\n`;
            latexCitation += `}\n\n`;
        }

        if (citation.sourceType === "Book") {
            latexCitation += `@book{${content.id},\n`;
            latexCitation += content.title && `\ttitle={${content.title}},\n`;
            latexCitation +=
                content.authors &&
                content.authors[0].firstName &&
                `\tauthor={${formatAuthorsForLaTeX(content.authors)}},\n`;
            latexCitation +=
                content.publishDate && `\tyear={${new Date(content.publishDate).getFullYear()}},\n`;
            latexCitation += content.publisher && `\tpublisher={${content.publisher}}\n`;
            latexCitation += `}\n\n`;
        }

        return latexCitation;
    }

    function exportToLaTeX() {
        const latexCitation = generateLaTeXCitation(content);
        const blob = new Blob([latexCitation], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${bibliography.title}.tex`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                if (authors && authors.length > 0 && authors[0].firstName) {
                    newReference = `${formatAuthorsForReference(authors)} (${publishDate}). ${
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
                newReference = `${formatAuthorsForReference(
                    authors
                )}. (${publishDate}). ${title}. *${source}*, ${volume}(${issue}), ${pages}. DOI: ${
                    doi || ""
                }`;
            } else if (citation.sourceType === "Book") {
                newReference = `${formatAuthorsForReference(
                    authors
                )}. (${publishDate}). ${title}. ${source}. ${place || ""}: ${publisher || ""}${
                    editor ? ", Edited by " + editor : ""
                }${edition ? ", " + edition + " ed." : ""}. ${
                    url || doi ? `Retrieved from ${url || doi}` : ""
                } on ${retrievalDate || "n.d."}`;
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
                </>
            )}

            <div className="context-menu">
                <button className="option-button" onClick={handleCopy}>
                    Copy to clipboard
                </button>
                <button className="option-button" onClick={exportToLaTeX}>
                    Export to LaTeX
                </button>
                <button className="option-button" onClick={toggleEditMode}>
                    Edit
                </button>
                <button className="option-button" onClick={handleDuplicate}>
                    Duplicate
                </button>
                {content.url && (
                    <button
                        className="option-button"
                        onClick={() => window.open(content.url, "_blank")}
                    >
                        Visit website
                    </button>
                )}
                <button className="option-button" onClick={deleteCitation}>
                    Delete
                </button>
            </div>

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
