import { timeAgo, uid } from "../../utils/utils.ts";
import Tag from "./Tag";
import { Icon } from "./MaterialComponents";

export default function BibliographyCard(props) {
    const { bibliography } = props;
    // const dateOptions = {
    //     weekday: "short",
    //     year: "2-digit",
    //     month: "short",
    //     day: "numeric",
    // };

    // const allDateOptions = {
    //     weekday: "narrow" | "short" | "long",
    //     era: "narrow" | "short" | "long",
    //     year: "numeric" | "2-digit",
    //     month: "numeric" | "2-digit" | "narrow" | "short" | "long",
    //     day: "numeric" | "2-digit",
    //     hour: "numeric" | "2-digit",
    //     minute: "numeric" | "2-digit",
    //     second: "numeric" | "2-digit",
    //     timeZoneName: "short" | "long",

    //     // Time zone to express it in
    //     timeZone: "Asia/Shanghai",
    //     // Force 12-hour or 24-hour
    //     hour12: true | false,

    //     // Rarely-used options
    //     hourCycle: "h11" | "h12" | "h23" | "h24",
    //     formatMatcher: "basic" | "best fit",
    // };

    function renderCitationCount(citations) {
        if (citations.length === 0) {
            return "No sources added";
        }
        if (citations.length === 1) {
            return "1 source";
        }
        return `${citations.length} sources`;
    }

    return (
        <div className="grid items-center rounded-lg border-2 border-solid border-neutral-gray bg-white p-4 shadow-md transition duration-150 ease-in-out hover:bg-neutral-transparentGray">
            <div className="w-full gap-2 text-neutral-black sm:flex sm:justify-between">
                <div className="flex gap-1">
                    <h3 className="mb-0">
                        {bibliography?.collab?.open && <Icon className="text-neutral-lightGray" name="group" />}{" "}
                        {bibliography?.title}
                    </h3>
                </div>
                <p className="mb-0">
                    {`${bibliography?.style?.name?.short || bibliography?.style?.name?.long.replace(/\((.*?)\)/g, "")} • 
                        ${renderCitationCount(bibliography?.citations)} • ${timeAgo(bibliography?.dateModified)}`}
                </p>
            </div>
            <div
                className="flex flex-wrap gap-1"
                style={{ marginTop: bibliography?.tags?.length === 0 ? "0" : "0.5rem" }}
            >
                {bibliography?.tags?.map((tag) => (
                    <Tag key={uid()} tagProps={tag} />
                ))}
            </div>
        </div>
    );
}
