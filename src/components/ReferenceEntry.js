import { Cite } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "../css/ReferenceEntry.css";
import { useEffect, useState } from "react";
import { plugins as cslPlugins } from "@citation-js/core";

export default function ReferenceEntry(props) {
    const { citation, handleReferenceCheckbox, bibStyle } = props;
    const [reference, setReference] = useState("");
    const [cslFile, setCslFile] = useState();

    useEffect(() => {
        console.log("called getcslFile");
        function getCslFile() {
            fetch(`${process.env.PUBLIC_URL}/cslFiles/${bibStyle.code}.csl`)
                .then((response) => response.text())
                .then((data) => {
                    console.log(data);
                    setCslFile(data);
                })
                .catch((error) => console.error("Error fetching CSL file:", error));
        }
        getCslFile();
    }, [bibStyle]);

    useEffect(() => {
        console.log("called registerNewCsl");
        function registerNewCsl() {
            if (!cslFile) return;
            let config = cslPlugins.config.get("@csl");
            config.templates.add(bibStyle.code, cslFile);
        }
        registerNewCsl();
    }, [cslFile, bibStyle]);

    useEffect(() => {
        console.log("called formatCitation");
        async function formatCitation(newContent) {
            let cite = await Cite.async(newContent);
            let formattedCitation = cite.format("bibliography", {
                format: "html",
                template: bibStyle.code,
                lang: "en-US",
            });
            console.log(formattedCitation);
            setReference(formattedCitation);
        }
        formatCitation(citation.content);
    }, [citation, bibStyle, cslFile]);

    return (
        <div className="reference-entry">
            <input
                type="checkbox"
                name="reference-entry-checkbox"
                checked={citation?.isChecked}
                onChange={(event) => handleReferenceCheckbox(event, citation.id)}
            />
            <div dangerouslySetInnerHTML={{ __html: reference }}></div>
        </div>
    );
}
