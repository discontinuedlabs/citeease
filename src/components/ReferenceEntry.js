import "../css/ReferenceEntry.css";

export default function ReferenceEntry(props) {
    const { citation, font } = props;
    return (
        <div>
            <input type="checkbox" name="reference-entry-checkbox" checked={citation?.isChecked} onChange={() => ""} />
            <div
                className="reference-entry"
                style={{ fontFamily: font.family }}
                dangerouslySetInnerHTML={{ __html: citation?.reference }}
            ></div>
        </div>
    );
}
