import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-bibtex";
import DOMPurify from "dompurify";
import CSL from "citeproc";
import db from "../data/db/dexie/dexie";

export function formatBibliography(citations, bibStyle, format = "html") {
    return new Promise(async (resolve, reject) => {
        try {
            const cslFile = await getCslFile(bibStyle);
            const contentArray = createContentArray(citations);

            let config = plugins.config.get("@csl");
            config.templates.add(bibStyle?.code, cslFile);

            if (!cslFile) {
                resolve(null);
                return;
            }

            let cite = await Cite.async(contentArray);
            let formattedCitations = cite.format("bibliography", {
                format,
                template: bibStyle?.code,
                lang: "en-US",
            });

            resolve(format === "html" ? splitContentArray(formattedCitations) : formattedCitations);
        } catch (error) {
            reject(error);
        }
    });
}

export function formatLaTeX(citations, latexFormat = "bibtex") {
    let config = plugins.config.get("@bibtex");
    config.parse.strict = false; // When true, entries are checked for required fields.
    config.parse.sentenceCase = false; // Convert titles to sentence case when parsing.
    config.format.useIdAsLabel = false; // Use the entry ID as the label instead of generating one.

    return new Promise(async (resolve, reject) => {
        try {
            const contentArray = createContentArray(citations);
            let cite = await Cite.async(contentArray);

            resolve(cite.format(latexFormat));
        } catch (error) {
            reject(error);
        }
    });
}

export function formatIntextCitation(citations, bibStyle, format = "html") {
    if (!citations) return null;

    return new Promise(async (resolve, reject) => {
        try {
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
            resolve(citeproc.previewCitationCluster(citation, [], [], format));
        } catch (error) {
            reject(error);
        }
    });
}

function getCslFile(bibStyle) {
    if (!bibStyle) return;
    return new Promise(async (resolve, reject) => {
        try {
            const savedCSLFiles = await loadLocalSCLFiles();
            if (savedCSLFiles && bibStyle?.code in savedCSLFiles) {
                // Get CSL from the savedCSLFiles object
                resolve(savedCSLFiles?.[bibStyle?.code]);
            } else {
                if (navigator.onLine && bibStyle?.code) {
                    // Get CSL file from citation-style-language/styles repository and save it to the savedCSLFiles object
                    const response = await fetch(
                        `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibStyle?.code}.csl`
                    );
                    const data = await response.text();
                    saveLocalSCLFiles({ ...savedCSLFiles, [bibStyle?.code]: data });
                    resolve(data);
                } else {
                    console.error(
                        `It seems like ${bibStyle?.name.long}'s rules haven't been saved on your device. Please connect to the internet and refresh the page to download ${bibStyle?.name.long}'s rules for offline use. Alternatively, you can switch to a citation style you've used before.`
                    );
                }
            }
        } catch (error) {
            reject(error);
        }
    });
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

function loadLocalSCLFiles() {
    return new Promise(async (resolve, reject) => {
        try {
            const loadedLocalCSLFiles = await db.items.get("savedCSLFiles");
            if (loadedLocalCSLFiles) {
                const parsedLocalCSLFiles = await JSON.parse(loadedLocalCSLFiles.value);
                resolve(parsedLocalCSLFiles);
            }
            resolve(null);
        } catch (error) {
            reject(error);
        }
    });
}

function saveLocalSCLFiles(CSLFiles) {
    const serializedFiles = JSON.stringify(CSLFiles);
    db.items.put({ id: "savedCSLFiles", value: serializedFiles });
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
