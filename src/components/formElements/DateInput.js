import { useEffect, useState } from "react";
import * as sourceTypeUtils from "../sourceTypeUtils";

export default function DateInput(props) {
    const { content = {}, setContent, dateKey } = props;
    const [year, setYear] = useState(content[dateKey]?.["date-parts"][0][0]);
    const [month, setMonth] = useState(content[dateKey]?.["date-parts"][0][1]);
    const [day, setDay] = useState(content[dateKey]?.["date-parts"][0][2]);

    useEffect(() => {
        setYear(content[dateKey]?.["date-parts"][0][0]);
        setMonth(content[dateKey]?.["date-parts"][0][1]);
        setDay(content[dateKey]?.["date-parts"][0][2]);
    }, [content]);

    function handleDateChange(key, value) {
        const newDate = { year: year, month: month, day: day };
        newDate[key] = value;
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: sourceTypeUtils.createDateObject(new Date(newDate.year, newDate.month, newDate.day)),
        }));
    }

    function setToToday() {
        setContent((prevContent) => {
            return { ...prevContent, [dateKey]: sourceTypeUtils.createDateObject(new Date()) };
        });
    }

    return (
        <div className="date-inputs-container">
            <input
                type="number"
                value={year}
                placeholder="YYYY"
                onChange={(event) => handleDateChange("year", event.target.value)}
            />
            <input
                type="number"
                value={month + 1 !== 0 ? month + 1 : ""} // Allow the field for an empty state instead of displaying 0 when no value is received
                min="1"
                max="12"
                placeholder="MM"
                onChange={(event) => handleDateChange("month", event.target.value - 1)}
            />
            <input
                type="number"
                value={day}
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
