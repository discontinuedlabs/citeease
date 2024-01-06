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

    const args = { content, setContent };
    const sourceTypes = {
        Journal: Journal(args),
        Book: Book(args),
        Webpage: Webpage(args),
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
            return prevBibliographies.map((b) =>
                b.id === bibliographyId
                    ? {
                          ...b,
                          citations: b.citations.map((c) => (c.id === citation.id ? citation : c)),
                      }
                    : b
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
        const newReference = getReference(content);
        setCitation((prevCitation) => ({
            ...prevCitation,
            reference: newReference,
            content: content,
        }));
    }, [content]);

    function formatAuthors(arr) {
        if (!arr || arr.length === 0) return "";

        const formattedAuthors = arr.map((author, index) => {
            if (/\s/g.test(author)) return; // TODO: this whole function should adapt to different number of names in one author
            const names = author.split(" ");
            const lastName = names.pop();
            const initials = names.map((name) => name[0]).join(". ");

            if (arr.length > 1 && index === arr.length - 1) {
                return `& ${lastName}, ${initials}.`;
            }
            return `${lastName}, ${initials}.`;
        });

        return formattedAuthors.join(", ");
    }

    function getReference(content) {
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
            <p>{citation.reference}</p>
            {sourceTypes[citation.sourceType]}
        </div>
    );
}
