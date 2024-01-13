export function formatAuthorsforLaTeX(authors) {
    if (!Array.isArray(authors)) {
        return "";
    }
    const formattedAuthors = authors.map((author) => {
        const fullName = `${author.firstName || ""} ${author.lastName || ""}`;
        return fullName.trim();
    });
    return formattedAuthors.join(" and ");
}

export function generateLaTeXCitation(citation) {
    const { id, content, sourceType } = citation;
    let LaTeXCitation = "";

    if (sourceType === "Webpage") {
        LaTeXCitation += `@online{${id},\n`;
        LaTeXCitation += content.title && `\ttitle={${content.title}},\n`;
        LaTeXCitation +=
            content.authors && content.authors[0] && content.authors[0].firstName
                ? `\tauthor={${formatAuthorsforLaTeX(content.authors)}},\n`
                : "";
        LaTeXCitation += content.publicationDate && `\tyear={${new Date(content.publicationDate).getFullYear()}},\n`;
        LaTeXCitation += content.url && `\thowpublished={${content.url}}\n`;
        LaTeXCitation += `}\n\n`;
    }

    if (sourceType === "Journal") {
        LaTeXCitation += `@article{${id},\n`;
        LaTeXCitation += content.title && `\ttitle={${content.title}},\n`;
        LaTeXCitation +=
            content.authors && content.authors[0] && content.authors[0].firstName
                ? `\tauthor={${formatAuthorsforLaTeX(content.authors)}},\n`
                : "";
        LaTeXCitation += content.publicationDate && `\tyear={${new Date(content.publicationDate).getFullYear()}},\n`;
        LaTeXCitation += content.journal && `\tjournal={${content.journal}},\n`;
        LaTeXCitation += content.volume && `\tvolume={${content.volume}},\n`;
        LaTeXCitation += content.issue && `\tnumber={${content.issue}},\n`;
        LaTeXCitation += content.pages && `\tpages={${content.pages}}\n`;
        LaTeXCitation += `}\n\n`;
    }

    if (sourceType === "Book") {
        LaTeXCitation += `@book{${id},\n`;
        LaTeXCitation += content.title && `\ttitle={${content.title}},\n`;
        LaTeXCitation +=
            content.authors && content.authors[0] && content.authors[0].firstName
                ? `\tauthor={${formatAuthorsforLaTeX(content.authors)}},\n`
                : "";
        LaTeXCitation += content.publicationDate && `\tyear={${new Date(content.publicationDate).getFullYear()}},\n`;
        LaTeXCitation += content.publisher && `\tpublisher={${content.publisher}}\n`;
        LaTeXCitation += `}\n\n`;
    }

    return LaTeXCitation;
}

export function exportToLaTeX(title, citation) {
    const newCitation = generateLaTeXCitation(citation);
    const blob = new Blob([newCitation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
