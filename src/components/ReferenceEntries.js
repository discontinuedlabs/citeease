import { Cite, plugins as cslPlugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "../css/ReferenceEntries.css";
import { useEffect, useState } from "react";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

export default function ReferenceEntries(props) {
    const { bibliography, dispatch, ACTIONS, handleReferenceEntryCheck, savedCslFiles, setSavedCslFiles } = props;
    const [references, setReferences] = useState([]);
    const [cslFile, setCslFile] = useState();
    const [masterCheckboxState, setMasterCheckboxState] = useState(MASTER_CHECKBOX_STATES.UNCHECKED);

    useEffect(() => {
        function updateMasterCheckboxState() {
            let checkedCount = 0;
            bibliography.citations.forEach((cit) => {
                if (cit.isChecked) {
                    checkedCount++;
                }
            });

            if (checkedCount === bibliography.citations.length) {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.CHECKED);
            } else if (checkedCount === 0) {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.UNCHECKED);
            } else {
                setMasterCheckboxState(MASTER_CHECKBOX_STATES.INDETERMINATE);
            }
        }
        updateMasterCheckboxState();
    }, [bibliography.citations]);

    useEffect(() => {
        function getCslFile() {
            if (bibliography.style.builtIn) {
                // Get CSL file from the public folder
                fetch(`${process.env.PUBLIC_URL}/cslFiles/${bibliography.style.code}.csl`)
                    .then((response) => response.text())
                    .then((data) => {
                        setCslFile(data);
                    })
                    .catch((error) => console.error("Error fetching CSL file:", error));
            } else {
                if (bibliography.style.code in savedCslFiles) {
                    // Get CSL from the savedCslFiles object
                    setCslFile(savedCslFiles[bibliography.style.code]);
                    return;
                } else {
                    // Get CSL file from raw.githubusercontent.com and save it to the savedCslFiles object
                    fetch(
                        `https://raw.githubusercontent.com/citation-style-language/styles/master/${bibliography.style.code}.csl`
                    )
                        .then((response) => response.text())
                        .then((data) => {
                            setCslFile(data);
                            setSavedCslFiles((prevSavedCslFiles) => {
                                return { ...prevSavedCslFiles, [bibliography.style.code]: data };
                            });
                        })
                        .catch((error) => console.error("Error fetching CSL file:", error));
                }
            }
        }
        getCslFile();
    }, [bibliography.style]);

    useEffect(() => {
        async function formatCitations() {
            const contentArray = createContentArray();

            if (!cslFile) return;
            let config = cslPlugins.config.get("@csl");
            config.templates.add(bibliography.style.code, cslFile);

            try {
                let cite = await Cite.async(contentArray);
                let formattedCitations = cite.format("bibliography", {
                    format: "html",
                    template: bibliography.style.code,
                    lang: "en-US",
                });
                const splitContent = splitContentArray(formattedCitations);
                setReferences(splitContent);
            } catch (error) {
                console.error("Error formatting citation:", error);
            }
        }
        formatCitations();
    }, [bibliography.citations, bibliography.style, cslFile]);

    function createContentArray() {
        return bibliography.citations.map((cit) => {
            return { ...cit.content };
        });
    }

    function splitContentArray(formattedCitations) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(formattedCitations, "text/html");
        const divElements = doc.querySelectorAll(".csl-entry");
        const divArray = Array.from(divElements).map((div) => div.outerHTML);
        return divArray;
    }

    function handleMasterCheck() {
        dispatch({
            type: ACTIONS.HANDLE_MASTER_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliography.id },
        });
    }

    return (
        <div className="reference-entries-container">
            {bibliography.citations.length !== 0 && (
                <input
                    type="checkbox"
                    className="master-checkbox"
                    checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                    onChange={handleMasterCheck}
                />
            )}
            {bibliography.citations.map((cit, index) => {
                return (
                    <div className="reference-entry" key={cit.id}>
                        <input
                            type="checkbox"
                            className="reference-entry-checkbox"
                            checked={cit.isChecked}
                            onChange={() => handleReferenceEntryCheck(cit.id)}
                        />
                        <div
                            className="reference-entry-text"
                            dangerouslySetInnerHTML={{ __html: references[index] }}
                        ></div>
                    </div>
                );
            })}
        </div>
    );
}
