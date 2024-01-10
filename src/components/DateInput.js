import { useState, useEffect } from "react";

export default function DateInput(props) {
    const { content, setContent, dateKey } = props;

    const handleYearChange = (event) => {
        const month = new Date(content[dateKey]).getMonth();
        const day = new Date(content[dateKey]).getDate();
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(event.target.value, month, day),
        }));
    };

    const handleMonthChange = (event) => {
        const year = new Date(content[dateKey]).getFullYear();
        const day = new Date(content[dateKey]).getDate();
        setContent((prevContent) => ({
            ...prevContent,
            [dateKey]: new Date(year, event.target.value - 1, day),
        }));
    };

    const handleDayChange = (event) => {
        const year = new Date(content[dateKey]).getFullYear();
        const month = new Date(content[dateKey]).getMonth();
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
    }

    return (
        <div className="date-inputs-container">
            <input
                type="number"
                value={new Date(content[dateKey]).getFullYear()}
                max={new Date().getFullYear()}
                placeholder="YYYY"
                onChange={handleYearChange}
            />
            <input
                type="number"
                value={new Date(content[dateKey]).getMonth() + 1}
                min="1"
                max="12"
                placeholder="MM"
                onChange={handleMonthChange}
            />
            <input
                type="number"
                value={new Date(content[dateKey]).getDate()}
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
