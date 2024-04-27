import { useEffect, useState } from "react";
import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "../css/LaTeX.css";

export default function LaTeXWindow(props) {
    const { checkedCitations, setLaTeXWindowVisible } = props;
    const [bibtexString, setBibtexString] = useState("");
    const [biblatexString, setBiblatexString] = useState("");
    const [displayedLatex, setDisplayedLatex] = useState(bibtexString);

    useEffect(() => {
        async function formatLaTeX() {
            let config = plugins.config.get("@bibtex");
            config.parse.strict = false; // When true, entries are checked for required fields.
            config.parse.sentenceCase = false; // Convert titles to sentence case when parsing.
            config.format.useIdAsLabel = false; // Use the entry ID as the label instead of generating one.

            const contentArray = checkedCitations.map((cit) => ({ ...cit.content }));
            let cite = await Cite.async(contentArray);

            const bibtexOutput = cite.format("bibtex");
            const biblatexOutput = cite.format("biblatex");

            setBibtexString(bibtexOutput);
            setBiblatexString(biblatexOutput);

            console.log(bibtexOutput);
        }
        formatLaTeX();
    }, [checkedCitations]);

    return (
        <div className="latex-window-overlay">
            <div className="latex-window">
                <div className="latex-window-header">
                    <div className="tabs-flex">
                        <button onClick={() => setDisplayedLatex(bibtexString)}>BibTex</button>
                        <button onClick={() => setDisplayedLatex(biblatexString)}>BibLaTeX</button>
                    </div>
                    <button onClick={() => setLaTeXWindowVisible(false)}>X</button>
                </div>

                <div className="displayed-latex">{displayedLatex || bibtexString}</div>
            </div>
        </div>
    );
}
