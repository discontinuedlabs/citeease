import Journal from "./sourceTypes/Journal";
import Webpage from "./sourceTypes/Webpage";
import Book from "./sourceTypes/Book";

function withProps(WrappedComponent, props) {
    return (additionalProps) => <WrappedComponent {...props} {...additionalProps} />;
}

export default function Citation(props) {
    const { sourceType, style } = props;
    const args = { getCitation };
    const sources = {
        Journal: withProps(Journal, args),
        Book: withProps(Book, args),
        Webpage: withProps(Webpage, args),
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

    function formatAuthors(arr) {
        if (!arr || arr.length === 0) return "";

        const formattedAuthors = arr.map((author, index) => {
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

    function getCitation(content) {
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
        publishDate = new Date(publishDate);
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
            let citation;

            if (sourceType === "Webpage") {
                if (authors && authors.length > 0) {
                    citation = `${formatAuthors(authors)} (${publishDate}). ${title}. ${
                        website || ""
                    }. ${publisher ? `Publisher: ${publisher}.` : ""} Retrieved from ${url} on ${
                        retrievalDate || "n.d."
                    }`;
                } else {
                    citation = `${title} (${publishDate}). ${website || ""}. ${
                        publisher ? `Publisher: ${publisher}.` : ""
                    } Retrieved from ${url} on ${retrievalDate || "n.d."}`;
                }
            } else if (sourceType === "Journal") {
                citation = `${formatAuthors(
                    authors
                )}. (${publishDate}). ${title}. *${source}*, ${volume}(${issue}), ${pages}. DOI: ${
                    doi || ""
                }`;
            } else if (sourceType === "Book") {
                citation = `${formatAuthors(authors)}. (${publishDate}). ${title}. ${source}. ${
                    place || ""
                }: ${publisher || ""}${editor ? ", Edited by " + editor : ""}${
                    edition ? ", " + edition + " ed." : ""
                }. ${url || doi ? `Retrieved from ${url || doi}` : ""} on ${
                    retrievalDate || "n.d."
                }`;
            }
            return citation;
        }

        function MLA() {
            let citation;
            return citation;
        }

        function Chicago() {
            let citation;
            return citation;
        }

        switch (style) {
            case "APA":
                return APA(content);
            case "MLA":
                return MLA(content);
            case "Chicago":
                return Chicago(content);
            default:
                throw new Error(`Unknown citation style: ${style}`);
        }
    }

    const Component = sources[sourceType];
    return <div className="citation">{Component && <Component />}</div>;
}
