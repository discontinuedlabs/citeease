import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";

export async function formatCitations(citations, bibStyle, savedCslFiles, setSavedCslFiles, formateType = "html") {
    const cslFile = await getCslFile(bibStyle, savedCslFiles, setSavedCslFiles);
    const contentArray = citations.map((cit) => {
        return { ...cit.content };
    });

    let config = plugins.config.get("@csl");
    config.templates.add(bibStyle.code, cslFile);

    if (!cslFile) return;
    let cite = await Cite.async(contentArray);
    let formattedCitations = cite.format("bibliography", {
        format: formateType,
        template: bibStyle.code,
        lang: "en-US",
    });
    return formateType === "html" ? splitContentArray(formattedCitations) : formattedCitations;
}

async function getCslFile(bibStyle, savedCslFiles, setSavedCslFiles) {
    if (typeof savedCslFiles === Object && bibStyle.code in savedCslFiles) {
        // Get CSL from the savedCslFiles object
        return savedCslFiles[bibStyle.code];
    } else {
        // Get CSL file from raw.githubusercontent.com and save it to the savedCslFiles object
        const response = await fetch(
            `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibStyle.code}.csl`
        );
        const data = await response.text();
        setSavedCslFiles((prevSavedCslFiles) => {
            return { ...prevSavedCslFiles, [bibStyle.code]: data };
        });
        return data;
    }
}

function splitContentArray(formattedCitations) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(formattedCitations, "text/html");
    const divElements = doc.querySelectorAll(".csl-entry");
    const divArray = Array.from(divElements).map((div) => div.outerHTML);
    return divArray;
}
