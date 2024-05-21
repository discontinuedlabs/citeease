import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-doi";
import "@citation-js/plugin-isbn";
import "@citation-js/plugin-pubmed";
import "@citation-js/plugin-wikidata";
import "@citation-js/plugin-software-formats";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-bibtex";
import axios from "axios";
import * as cheerio from "cheerio";
import * as citationUtils from "./citationUtils";

export async function formatCitations(citations, bibStyle, savedCslFiles, setSavedCslFiles, formateType = "html") {
    const cslFile = await getCslFile(bibStyle, savedCslFiles, setSavedCslFiles);
    const contentArray = createContentArray(citations);

    let config = plugins.config.get("@csl");
    config.templates.add(bibStyle?.code, cslFile);

    if (!cslFile) return;
    let cite = await Cite.async(contentArray);
    let formattedCitations = cite.format("bibliography", {
        format: formateType,
        template: bibStyle?.code,
        lang: "en-US",
    });
    return formateType === "html" ? splitContentArray(formattedCitations) : formattedCitations;
}

// FIXME: This function should check each value type in the array and try to create the citation.content object for each one
export async function citeWithIdentifier(
    uniqueIdentifers,
    bibStyle,
    savedCslFiles,
    setSavedCslFiles,
    formateType = "html"
) {
    const cslFile = await getCslFile(bibStyle, savedCslFiles, setSavedCslFiles);

    let config = plugins.config.get("@csl");
    config.templates.add(bibStyle?.code, cslFile);

    plugins.add("@doi");
    plugins.add("@isbn");
    plugins.add("@pubmed");
    plugins.add("@wikidata");
    plugins.add("@software-formats");

    for (let i = 0; i < uniqueIdentifers.length; i++) {
        if (/(https?:\/\/[^\s]+)/g.test(uniqueIdentifers[i])) {
            const url = uniqueIdentifers[i];
            const website = encodeURIComponent(url);
            const response = await axios.get(`https://corsproxy.io/?${website}`);
            const $ = cheerio.load(response.data);
            const urlContent = citationUtils.retrieveContentFromWebsite($, url);
            uniqueIdentifers[i] = urlContent;
        }
    }

    if (!cslFile) return;
    let cite = await Cite.async(uniqueIdentifers);
    let formattedCitations = cite.format("bibliography", {
        format: formateType,
        template: bibStyle?.code,
        lang: "en-US",
    });

    return formateType === "html" ? splitContentArray(formattedCitations) : formattedCitations;
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

// TODO: It's better to also check if the cslFile is saved when the user adds a new bibliography and download if it doesn't exist
async function getCslFile(bibStyle, savedCslFiles, setSavedCslFiles) {
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
            setSavedCslFiles((prevSavedCslFiles) => {
                return { ...prevSavedCslFiles, [bibStyle?.code]: data };
            });
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
    const divArray = Array.from(divElements).map((div) => div.outerHTML);
    return divArray;
}
