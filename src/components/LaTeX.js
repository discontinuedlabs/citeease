import { useEffect, useState } from "react";
import * as citationEngine from "./citationEngine";
import "../css/LaTeX.css";

export default function LaTeXWindow(props) {
    const { citations, checkedCitations, setLaTeXWindowVisible, exportAll } = props;
    const [bibtexString, setBibtexString] = useState("");
    const [biblatexString, setBiblatexString] = useState("");
    const [bibTxtString, setBibTxtString] = useState("");
    const [displayedLatex, setDisplayedLatex] = useState(bibtexString);

    useEffect(() => {
        async function formatLaTeX() {
            setBibtexString(await citationEngine.formatLaTeX(exportAll ? citations : checkedCitations, "bibtex"));
            setBiblatexString(await citationEngine.formatLaTeX(exportAll ? citations : checkedCitations, "biblatex"));
            setBibTxtString(await citationEngine.formatLaTeX(exportAll ? citations : checkedCitations, "bibtxt"));
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
                        <button onClick={() => setDisplayedLatex(bibTxtString)}>BibTXT</button>
                    </div>
                    <button onClick={() => setLaTeXWindowVisible(false)}>X</button>
                </div>

                <div className="displayed-latex">{displayedLatex || bibtexString}</div>
            </div>
        </div>
    );
}
