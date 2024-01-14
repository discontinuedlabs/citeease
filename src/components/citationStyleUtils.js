export const monthNames = [
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

export function formatDoi(doi) {
    doi = doi.replace(/^https?:\/\//i, "").replace(/dx\.doi\.org/, "doi.org");

    if (!doi.startsWith("doi.org/")) {
        return `https://doi.org/${doi}`;
    }

    return `https://${doi}`;
}

export function formatEdition(edition) {
    const lastDigit = edition % 10;
    const suffix =
        edition % 100 === 11 || edition % 100 === 12 || edition % 100 === 13
            ? "th"
            : lastDigit === 1
            ? "st"
            : lastDigit === 2
            ? "nd"
            : lastDigit === 3
            ? "rd"
            : "th";

    return edition + suffix;
}
