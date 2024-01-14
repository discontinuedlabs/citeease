import * as citationStyleUtils from "../citationStyleUtils";

function formatAuthorsForReference(authors) {
    let formattedAuthors = authors.map((author, index) => {
        if (author.firstName && author.lastName) {
            const splitNames = (author.firstName + " " + author.lastName).replace(/\.+/g, "").split(/\s+/g);
            const allNames = [...splitNames].filter((name) => name.trim() !== "");
            const lastName = allNames.pop();
            const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
            const initials = allNames.map((name) => name[0].toUpperCase()).join(". ");

            if (authors.length > 1 && index === authors.length - 1) {
                return `& ${capitalizedLastName}, ${initials}.`;
            }
            return `${capitalizedLastName}, ${initials}.`;
        } else if (author.firstName) return `${author.firstName}`;
        else return "";
    });

    if (formattedAuthors.length >= 21) {
        formattedAuthors.splice(20, formattedAuthors.length - 21);
        formattedAuthors[formattedAuthors.length - 1] = formattedAuthors[formattedAuthors.length - 1].replace(
            "&",
            "..."
        );
    }

    return formattedAuthors.join(", ");
}

function formatAccessDate(accessDate) {
    let formattedAccessDate;
    if (accessDate && accessDate.year && accessDate.month >= 0 && accessDate.day) {
        formattedAccessDate = `${citationStyleUtils.monthNames[accessDate.month]} ${accessDate.day}, ${
            accessDate.year
        }`;
    }
    return formattedAccessDate;
}

function formatPublicationDate(publicationDate) {
    let formattedpublicationDate;
    if (publicationDate && publicationDate.year && publicationDate.month >= 0 && publicationDate.day) {
        formattedpublicationDate = `${publicationDate.year}, ${citationStyleUtils.monthNames[publicationDate.month]} ${
            publicationDate.day
        }`;
    } else if (publicationDate && publicationDate.year) {
        formattedpublicationDate = publicationDate.year;
    }
    return formattedpublicationDate;
}

export default function APA(content, sourceType) {
    let {
        authors,
        publicationDate,
        accessDate,
        title,
        url,
        volume,
        volumeTitle,
        issue,
        pages,
        publisher,
        editor,
        edition,
        website,
        journal,
        doi,
        city,
        article,
        year,
        originalPublished,
    } = content;

    let newReference;

    if (sourceType === "Webpage") {
        if (authors && authors.length > 0 && authors[0].firstName) {
            newReference = `${formatAuthorsForReference(authors)} (${
                formatPublicationDate(publicationDate) || "n.d."
            }). ${title ? `<i>${title}</i>.` : ""} ${website ? `${website}.` : ""} ${
                publisher ? `Publisher: ${publisher}.` : ""
            } ${
                formatAccessDate(accessDate)
                    ? `Retrieved ${formatAccessDate(accessDate)}${
                          url ? `, from <a href="${url}" target="_blank">${url}</a>` : ""
                      }`
                    : ""
            }`;
        } else {
            newReference = `<i>${title}</i> (${formatPublicationDate(publicationDate) || "n.d."}). ${
                website ? `${website}.` : ""
            } ${publisher ? `Publisher: ${publisher}.` : ""} ${
                formatAccessDate(accessDate)
                    ? `Retrieved ${formatAccessDate(accessDate)}, from <a href="${url}" target="_blank">${url}</a>`
                    : url
            }`;
        }
    } else if (sourceType === "Journal") {
        newReference = `${formatAuthorsForReference(authors)} (${publicationDate?.year || "n.d."}). ${
            title ? `${title}. ` : ""
        }${
            journal
                ? `<i>${journal}</i>, ${volume ? `<i>${volume}</i>` : ""}${issue ? `(${issue})` : ""}${
                      pages ? `, ${pages}` : article ? `, Article ${article}` : ""
                  }. `
                : ""
        }<a href="${url}" target="_blank">${doi ? `${citationStyleUtils.formatDoi(doi)}` : url ? `${url}` : ""}</a>`;
    } else if (sourceType === "Book") {
        if (authors && authors.length > 0 && authors[0].firstName) {
            newReference = `${formatAuthorsForReference(authors)} (${year || "n.d."}). <i>${getProperTitle()}</i>. ${
                edition ? `(${citationStyleUtils.formatEdition(edition)} ed.).` : ""
            } ${city + ":" || ""} ${publisher || ""}${editor ? ", Edited by " + editor : ""}. ${
                url || doi
                    ? ` Retrieved from <a href="${url || doi}" target="_blank">${url || doi}</a> on ${formatAccessDate(
                          accessDate
                      )}`
                    : ""
            } ${
                originalPublished && originalPublished !== year ? `(Original work published ${originalPublished})` : ""
            }`;
        } else {
            newReference = `<i>${title}</i> (${year || "n.d."}). ${
                edition ? `(${citationStyleUtils.formatEdition(edition)} ed.).` : ""
            } ${city + ":" || ""} ${publisher || ""}${editor ? ", Edited by " + editor : ""}. ${
                url || doi
                    ? ` Retrieved from <a href="${url || doi}" target="_blank">${url || doi}</a> on ${formatAccessDate(
                          accessDate
                      )}`
                    : ""
            } ${
                originalPublished && originalPublished !== year ? `(Original work published ${originalPublished})` : ""
            }`;
        }

        function getProperTitle() {
            let newTitle;
            if (volumeTitle && !volume) {
                newTitle = volumeTitle;
            } else {
                newTitle = `${title}${volume ? `: Vol. ${volume}.${volumeTitle ? ` ${volumeTitle}.` : ""}` : ""}`;
            }
            return newTitle;
        }
    }

    return newReference;
}
