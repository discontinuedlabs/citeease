import { Cite } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "../css/ReferenceEntry.css";
import { useEffect, useState } from "react";

export default function ReferenceEntry(props) {
    const { citation, handleReferenceCheckbox, bibStyle } = props;
    const [reference, setReference] = useState("");
    // console.log(citation);

    useEffect(() => {
        async function formatCitation(newContent) {
            let cite = await Cite.async(newContent);

            let formattedCitation = cite.format("bibliography", {
                format: "html",
                template: bibStyle.code,
                lang: "en-US",
            });
            setReference(formattedCitation);
        }

        formatCitation(citation.content);
    }, [citation, bibStyle]);

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
