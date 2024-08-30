import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-bibtex";
import CSL from "citeproc";
import DOMPurify from "./purify";
import db from "../data/db/dexie/dexie";

function saveLocalSCLFiles(CslFiles) {
    const serializedFiles = JSON.stringify(CslFiles);
    db.items.put({ id: "savedCslFiles", value: serializedFiles });
}

async function loadLocalSCLFiles() {
    try {
        const loadedLocalCslFiles = await db.items.get("savedCslFiles");
        if (loadedLocalCslFiles) {
            const parsedLocalCSLFiles = await JSON.parse(loadedLocalCslFiles.value);
            return parsedLocalCSLFiles;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getCslFile(bibStyle) {
    if (!bibStyle) return null;
    try {
        const savedCslFiles = await loadLocalSCLFiles();
        if (savedCslFiles && bibStyle?.code in savedCslFiles) {
            // Get CSL from the savedCSLFiles object
            return savedCslFiles?.[bibStyle?.code];
        }
        if (navigator.onLine && bibStyle?.code) {
            // Get CSL file from citation-style-language/styles repository and save it to the savedCSLFiles object
            const response = await fetch(
                `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibStyle?.code}.csl`
            );
            const data = await response.text();
            saveLocalSCLFiles({ ...savedCslFiles, [bibStyle?.code]: data });
            return data;
        }
        console.error(
            `It seems like ${bibStyle?.name.long}'s rules haven't been saved on your device. Please connect to the internet and refresh the page to download ${bibStyle?.name.long}'s rules for offline use. Alternatively, you can switch to a citation style you've used before.`
        );
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Downloads the CSL file immediately when a new bibliography is added with a style that hasn't been used before
export async function updateCslFiles(bibStyle) {
    if (!bibStyle) return;
    const savedCslFiles = await loadLocalSCLFiles();
    if (!savedCslFiles || !(bibStyle?.code in savedCslFiles)) {
        const response = await fetch(
            `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibStyle?.code}.csl`
        );
        const data = await response.text();
        saveLocalSCLFiles({ ...savedCslFiles, [bibStyle?.code]: data });
    }
}

function createContentArray(citationsArray) {
    return citationsArray?.map((cit) => ({ ...cit?.content }));
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

function retreiveLocale(lang) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${import.meta.env.VITE_PUBLIC_URL}/locales/${lang}.xml`, false);
    xhr.send(null);
    return xhr.responseText;
}

export async function formatBibliography(citations, bibStyle, format = "html", lang = "en-US") {
    try {
        const cslFile = await getCslFile(bibStyle);
        const locale = retreiveLocale(lang);
        const contentArray = createContentArray(citations);

        const config = plugins.config.get("@csl");
        config.templates.add(bibStyle?.code, cslFile);
        config.locales.add("ar", locale);

        if (!cslFile) {
            return null;
        }

        const cite = await Cite.async(contentArray);
        let formattedCitations = cite.format("bibliography", {
            format,
            template: bibStyle?.code,
            lang,
        });

        const textDirection = /^(ar|he|fa|ur)/.test(lang) ? "rtl" : "ltr";

        if (format === "html") {
            formattedCitations = formattedCitations.replace(
                /class="csl-entry"/g,
                `class="csl-entry" dir="${textDirection}"`
            );
        }

        return format === "html" ? splitContentArray(formattedCitations) : formattedCitations;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function formatLaTeX(citations, latexFormat = "bibtex") {
    const config = plugins.config.get("@bibtex");
    config.parse.strict = false; // When true, entries are checked for required fields.
    config.parse.sentenceCase = false; // Convert titles to sentence case when parsing.
    config.format.useIdAsLabel = false; // Use the entry ID as the label instead of generating one.

    try {
        const cite = await Cite.async(citations);
        return cite.format(latexFormat);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function formatIntextCitation(citations, bibStyle, format = "html", lang = "en-US") {
    if (!citations) return null;

    try {
        const citIds = citations.map((cit) => cit.id);

        const citeprocSys = {
            retrieveLocale() {
                return retreiveLocale(lang);
            },
            retrieveItem: (id) => citations.find((cit) => id === cit.id),
        };

        const cslFile = await getCslFile(bibStyle);
        const citeproc = new CSL.Engine(citeprocSys, cslFile);
        citeproc.updateItems(citIds);
        const citation = {
            properties: {
                noteIndex: 0,
            },
            citationItems: citIds.map((id) => {
                const targetCitation = citations.find((cit) => cit.id === id);
                return {
                    id,
                    locator: targetCitation.locator,
                    label: targetCitation.label,
                };
            }),
        };
        return citeproc.previewCitationCluster(citation, [], [], format);
    } catch (error) {
        console.error(error);
        return null;
    }
}
