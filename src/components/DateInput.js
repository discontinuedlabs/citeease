import { useState, useEffect } from "react";

export default function DateInput(props) {
    const { content, setContent, dateKey } = props;
    const [year, setYear] = useState(new Date(content[dateKey]).getFullYear());
    const [month, setMonth] = useState(new Date(content[dateKey]).getMonth());
    const [day, setDay] = useState(new Date(content[dateKey]).getDate());

    useEffect(() => {
        setYear(new Date(content[dateKey]).getFullYear());
        setMonth(new Date(content[dateKey]).getMonth());
        setDay(new Date(content[dateKey]).getDate());
    }, [content]);

    const handleYearChange = (event) => {
        setYear(event.target.value);
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(event.target.value, month, day),
        }));
    };

    const handleMonthChange = (event) => {
        setMonth(event.target.value - 1);
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(year, event.target.value - 1, day),
        }));
    };

    const handleDayChange = (event) => {
        setDay(event.target.value);
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(year, month, event.target.value),
        }));
    };

    function setToToday() {
        const today = new Date();
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(today),
        }));
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
                onChange={handleYearChange}
            />
            <input
                type="number"
                value={month + 1}
                min="1"
                max="12"
                placeholder="MM"
                onChange={handleMonthChange}
            />
            <input
                type="number"
                value={day}
                min="1"
                max="31"
                placeholder="DD"
                onChange={handleDayChange}
            />
            <button type="button" onClick={setToToday}>
                Today
            </button>
        </div>
    );
}
