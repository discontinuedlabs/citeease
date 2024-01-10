import { useEffect, useState } from "react";

export default function DateInput(props) {
    const { content, setContent, dateKey } = props;
    const date = content && dateKey in content ? new Date(content[dateKey]) : null;
    const [year, setYear] = useState(() => (date ? date.getFullYear() : new Date().getFullYear()));
    const [month, setMonth] = useState(() => (date ? date.getMonth() : 0));
    const [day, setDay] = useState(() => (date ? date.getDate() : 1));

    useEffect(() => {
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(year, month, day),
        }));
    }, [year, month, day]);

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
