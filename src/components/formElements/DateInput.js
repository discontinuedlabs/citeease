import { useEffect, useState } from "react";
import * as sourceTypeUtils from "../sourceTypeUtils";

export default function DateInput(props) {
    const { content = {}, setContent, dateKey } = props;
    const [year, setYear] = useState(content[dateKey]?.[0]?.[0] || "");
    const [month, setMonth] = useState(content[dateKey]?.[0]?.[1] || "");
    const [day, setDay] = useState(content[dateKey]?.[0]?.[2] || "");

    useEffect(() => {
        if (setContent) {
            setContent((prevContent) => ({
                ...prevContent,
                [dateKey]: sourceTypeUtils.createDateObject(new Date(year, month, day)),
            }));
        }
    }, [year, month, day, setContent, dateKey]);

    useEffect(() => {
        const newYear = content[dateKey]?.[0]?.[0];
        const newMonth = content[dateKey]?.[0]?.[1];
        const newDay = content[dateKey]?.[0]?.[2];

        if (year !== newYear || month !== newMonth || day !== newDay) {
            setYear(newYear || "");
            setMonth(newMonth || "");
            setDay(newDay || "");
        }
    }, [content, dateKey]);

    function setToToday() {
        const today = new Date();
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setDay(today.getDate());
    }

    return (
        <div className="date-inputs-container">
            <input
                type="number"
                value={year}
                max={new Date().getFullYear()}
                placeholder="YYYY"
                onChange={(event) => setYear(event.target.value)}
            />
            <input
                type="number"
                value={month + 1}
                min="1"
                max="12"
                placeholder="MM"
                onChange={(event) => setMonth(event.target.value - 1)}
            />
            <input
                type="number"
                value={day}
                min="1"
                max="31"
                placeholder="DD"
                onChange={(event) => setDay(event.target.value)}
            />
            <button type="button" onClick={setToToday}>
                Today
            </button>
        </div>
    );
}
