export function formatAuthors(authors) {
    if (!Array.isArray(authors)) {
        return "";
    }
    const formattedAuthors = authors.map((author) => {
        const fullName = `${author.firstName || ""} ${author.lastName || ""}`;
        return fullName.trim();
    });
    return formattedAuthors.join(" and ");
}

export function generateCitation(citation) {
    const { id, content, sourceType } = citation;
    let newCitation = "";

    if (sourceType === "Webpage") {
        newCitation += `@online{${id},\n`;
        newCitation += content.title && `\ttitle={${content.title}},\n`;
        newCitation +=
            content.authors && content.authors[0] && content.authors[0].firstName
                ? `\tauthor={${formatAuthors(content.authors)}},\n`
                : "";
        newCitation += content.publicationDate && `\tyear={${new Date(content.publicationDate).getFullYear()}},\n`;
        newCitation += content.url && `\thowpublished={${content.url}}\n`;
        newCitation += `}\n\n`;
    }

    if (sourceType === "Journal") {
        newCitation += `@article{${id},\n`;
        newCitation += content.title && `\ttitle={${content.title}},\n`;
        newCitation +=
            content.authors && content.authors[0] && content.authors[0].firstName
                ? `\tauthor={${formatAuthors(content.authors)}},\n`
                : "";
        newCitation += content.publicationDate && `\tyear={${new Date(content.publicationDate).getFullYear()}},\n`;
        newCitation += content.journal && `\tjournal={${content.journal}},\n`;
        newCitation += content.volume && `\tvolume={${content.volume}},\n`;
        newCitation += content.issue && `\tnumber={${content.issue}},\n`;
        newCitation += content.pages && `\tpages={${content.pages}}\n`;
        newCitation += `}\n\n`;
    }

    if (sourceType === "Book") {
        newCitation += `@book{${id},\n`;
        newCitation += content.title && `\ttitle={${content.title}},\n`;
        newCitation +=
            content.authors && content.authors[0] && content.authors[0].firstName
                ? `\tauthor={${formatAuthors(content.authors)}},\n`
                : "";
        newCitation += content.publicationDate && `\tyear={${new Date(content.publicationDate).getFullYear()}},\n`;
        newCitation += content.publisher && `\tpublisher={${content.publisher}}\n`;
        newCitation += `}\n\n`;
    }

    return newCitation;
}

export function generateAndExport(title, citation) {
    const newCitation = generateCitation(citation);
    const blob = new Blob([newCitation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
