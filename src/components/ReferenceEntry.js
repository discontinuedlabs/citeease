import { Cite, plugins as cslPlugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "../css/ReferenceEntry.css";
import { useEffect, useState } from "react";

export default function ReferenceEntry(props) {
    const { citation, handleReferenceEntryCheck, bibStyle, savedCslFiles, setSavedCslFiles } = props;
    const [reference, setReference] = useState("");
    const [cslFile, setCslFile] = useState();

    useEffect(() => {
        function getCslFile() {
            if (bibStyle.builtIn) {
                // Get CSL file from the public folder
                fetch(`${process.env.PUBLIC_URL}/cslFiles/${bibStyle.code}.csl`)
                    .then((response) => response.text())
                    .then((data) => {
                        setCslFile(data);
                    })
                    .catch((error) => console.error("Error fetching CSL file:", error));
            } else {
                if (typeof savedCslFiles === "object" && bibStyle.code in savedCslFiles) {
                    // Get CSL from the savedCslFiles object
                    setCslFile(savedCslFiles[bibStyle.code]);
                    return;
                } else {
                    // Get CSL file from raw.githubusercontent.com and save it to the savedCslFiles object
                    fetch(
                        `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibStyle.code}.csl`
                    )
                        .then((response) => response.text())
                        .then((data) => {
                            setCslFile(data);
                            setSavedCslFiles((prevSavedCslFiles) => {
                                return { ...prevSavedCslFiles, [bibStyle.code]: data };
                            });
                        })
                        .catch((error) => console.error("Error fetching CSL file:", error));
                }
            }
        }
        getCslFile();
    }, [bibStyle]);

    useEffect(() => {
        async function formatCitation(newContent) {
            if (!cslFile) return;
            let config = cslPlugins.config.get("@csl");
            config.templates.add(bibStyle.code, cslFile);

            try {
                let cite = await Cite.async(newContent);
                let formattedCitation = cite.format("bibliography", {
                    format: "html",
                    template: bibStyle.code,
                    lang: "en-US",
                });
                setReference(formattedCitation);
            } catch (error) {
                console.error("Error formatting citation:", error);
            }
        }
        formatCitation(citation.content);
    }, [citation, bibStyle, cslFile]);

    return (
        <div className="reference-entry">
            <input
                type="checkbox"
                name="reference-entry-checkbox"
                checked={citation?.isChecked}
                onChange={() => handleReferenceEntryCheck(citation.id)}
            />
            <div dangerouslySetInnerHTML={{ __html: reference }}></div>
        </div>
    );
}
