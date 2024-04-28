import "../css/ReferenceEntries.css";
import { useEffect, useState } from "react";
import * as citationEngine from "./citationEngine.js";

const MASTER_CHECKBOX_STATES = {
    CHECKED: "checked", // All reference entries are checked
    UNCHECKED: "unchecked", // All reference entries are unchecked
    INDETERMINATE: "indeterminate", // Some reference entries are checked
};

export default function ReferenceEntries(props) {
    const { bibliography, dispatch, ACTIONS, handleReferenceEntryCheck, savedCslFiles, setSavedCslFiles } = props;
    const [references, setReferences] = useState([]);
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
        async function formatCitations() {
            const formattedCitations = await citationEngine.formatCitations(
                bibliography.citations,
                bibliography.style,
                savedCslFiles,
                setSavedCslFiles
            );
            setReferences(formattedCitations);
        }
        formatCitations();
    }, [bibliography.citations, bibliography.style]);

    function handleMasterCheck() {
        dispatch({
            type: ACTIONS.HANDLE_MASTER_REFERENCE_ENTRY_CHECKBOX,
            payload: { bibliographyId: bibliography.id },
        });
    }

    return (
        <div className="reference-entries-component">
            <div className="reference-entries-header">
                {bibliography.citations.length !== 0 && (
                    <input
                        type="checkbox"
                        className="master-checkbox"
                        checked={masterCheckboxState === MASTER_CHECKBOX_STATES.CHECKED}
                        onChange={handleMasterCheck}
                    />
                )}
            </div>

            <div className="reference-entries-container">
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
        </div>
    );
}
