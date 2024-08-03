import * as sourceTypeUtils from "../../utils/citationUtils.ts";

export default function DateInput(props) {
    const { content, setContent, dateKey, ariaLabelledby } = props;

    function handleDateChange(key, value) {
        const newDate = {
            year: content[dateKey]?.["date-parts"][0][0],
            month: content[dateKey]?.["date-parts"][0][1],
            day: content[dateKey]?.["date-parts"][0][2],
        };
        newDate[key] = value;
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: sourceTypeUtils.createDateObject(newDate.year, newDate.month, newDate.day),
        }));
    }

    function setToToday() {
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: sourceTypeUtils.createDateObject(new Date()),
        }));
    }

    return (
        <div className="date-inputs-container" aria-labelledby={ariaLabelledby}>
            <input
                type="number"
                value={content[dateKey]?.["date-parts"]?.[0]?.[0] || ""}
                min="1"
                max={new Date().getFullYear()}
                placeholder="YYYY"
                onChange={(event) => handleDateChange("year", event.target.value)}
            />
            <input
                type="number"
                value={content[dateKey]?.["date-parts"]?.[0]?.[1] || ""}
                min="1"
                max="12"
                placeholder="MM"
                onChange={(event) => handleDateChange("month", event.target.value)}
            />
            <input
                type="number"
                value={content[dateKey]?.["date-parts"]?.[0]?.[2] || ""}
                min="1"
                max="31"
                placeholder="DD"
                onChange={(event) => handleDateChange("day", event.target.value)}
            />
            <button type="button" onClick={setToToday}>
                Today
            </button>
        </div>
    );
}
