export default function BibliographyCard(props) {
    const { bibliography } = props;
    const dateOptions = {
        weekday: "short",
        year: "2-digit",
        month: "short",
        day: "numeric",
    };

    const allDateOptions = {
        weekday: "narrow" | "short" | "long",
        era: "narrow" | "short" | "long",
        year: "numeric" | "2-digit",
        month: "numeric" | "2-digit" | "narrow" | "short" | "long",
        day: "numeric" | "2-digit",
        hour: "numeric" | "2-digit",
        minute: "numeric" | "2-digit",
        second: "numeric" | "2-digit",
        timeZoneName: "short" | "long",

        // Time zone to express it in
        timeZone: "Asia/Shanghai",
        // Force 12-hour or 24-hour
        hour12: true | false,

        // Rarely-used options
        hourCycle: "h11" | "h12" | "h23" | "h24",
        formatMatcher: "basic" | "best fit",
    };

    return (
        <div className="bibliography-card">
            <h3 className="bibliography-card-title">{bibliography.title}</h3>
            <p className="bibliography-card-style">{bibliography.style.name.short || bibliography.style.name.long}</p>
            <p>{new Date(bibliography.dateCreated).toLocaleDateString(undefined, dateOptions)}</p>
            {/* {new Date(bibliography.dateCreated) !== new Date(bibliography.dateModified) && (
                <p>{new Date(bibliography.dateModified).toLocaleDateString(undefined, dateOptions)}</p>
            )} */}
            <p>
                {bibliography.citations.length === 0
                    ? "No sources added"
                    : bibliography.citations.length === 1
                    ? "1 source"
                    : `${bibliography.citations.length} sources`}
            </p>
        </div>
    );
}
