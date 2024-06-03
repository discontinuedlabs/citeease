import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-bibtex";
import DOMPurify from "dompurify";
import CSL from "citeproc";

export async function formatBibliography(citations, bibStyle, savedCslFiles, updateSavedCslFiles, format = "html") {
    const cslFile = await getCslFile(bibStyle, savedCslFiles, updateSavedCslFiles);
    const contentArray = createContentArray(citations);

    let config = plugins.config.get("@csl");
    config.templates.add(bibStyle?.code, cslFile);

    if (!cslFile) return;

    let cite = await Cite.async(contentArray);
    let formattedCitations = cite.format("bibliography", {
        format,
        template: bibStyle?.code,
        lang: "en-US",
    });
    return format === "html" ? splitContentArray(formattedCitations) : formattedCitations;
}

export async function formatLaTeX(citations, latexFormat = "bibtex") {
    let config = plugins.config.get("@bibtex");
    config.parse.strict = false; // When true, entries are checked for required fields.
    config.parse.sentenceCase = false; // Convert titles to sentence case when parsing.
    config.format.useIdAsLabel = false; // Use the entry ID as the label instead of generating one.

    const contentArray = createContentArray(citations);
    let cite = await Cite.async(contentArray);

    return cite.format(latexFormat);
}

export async function formatIntextCitation(citationsArray, options, savedCslFiles, updateSavedCslFiles) {
    if (!citationsArray) return;
    const citations = citationsArray.map((cit) => cit.content);
    const citIds = citations.map((cit) => cit.id);

    const citeprocSys = {
        retrieveLocale: function (lang) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `${process.env.PUBLIC_URL}/locales/${lang}.xml`, false);
            xhr.send(null);
            return xhr.responseText;
        },
        retrieveItem: (id) => {
            return citations.find((cit) => id === cit.id);
        },
    };

    const cslFile = await getCslFile(options.bibStyle, savedCslFiles, updateSavedCslFiles);
    const citeproc = new CSL.Engine(citeprocSys, cslFile);
    citeproc.updateItems(citIds);
    const citation = {
        properties: {
            noteIndex: 0,
        },
        citationItems: citIds.map((id) => ({ id, locator: undefined, label: undefined })),
    };
    return citeproc.previewCitationCluster(citation, [], [], "html");
}

// TODO: It's better to also check if the cslFile is saved when the user adds a new bibliography and download if it doesn't exist
async function getCslFile(bibStyle, savedCslFiles, updateSavedCslFiles) {
    if (!bibStyle) return;
    if (savedCslFiles && typeof savedCslFiles === "object" && bibStyle?.code in savedCslFiles) {
        // Get CSL from the savedCslFiles object
        return savedCslFiles?.[bibStyle?.code];
    } else {
        if (navigator.onLine && bibStyle?.code) {
            // Get CSL file from citation-style-language/styles repository and save it to the savedCslFiles object
            const response = await fetch(
                `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibStyle?.code}.csl`
            );
            const data = await response.text();
            updateSavedCslFiles({ ...savedCslFiles, [bibStyle?.code]: data });
            return data;
        } else {
            console.error(
                `It seems like ${bibStyle?.name.long}'s rules haven't been saved on your device. Please connect to the internet and refresh the page to download ${bibStyle?.name.long}'s rules for offline use. Alternatively, you can switch to a citation style you've used before.`
            );
        }
    }
}

function createContentArray(citationsArray) {
    return citationsArray?.map((cit) => {
        return { ...cit?.content };
    });
}

function splitContentArray(formattedCitations) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(formattedCitations, "text/html");
    const divElements = doc.querySelectorAll(".csl-entry");
    const divArray = Array.from(divElements).map((div) => {
        const sanitizedOuterHTML = DOMPurify.sanitize(div.outerHTML);
        return sanitizedOuterHTML;
    });
    return divArray;
}
