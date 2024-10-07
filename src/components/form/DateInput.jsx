import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { OutlinedIconButton, Select, TextField } from "../ui/MaterialComponents";
import * as citationUtils from "../../utils/citationUtils.ts";

// FIXME: Why does "value" become undefined before it changes to another value?
const DateInput = forwardRef(function DateInput(props, parentRef) {
    const { value: passedValue, name, label, onChange, className, ...rest } = props;
    const [value, setValue] = useState(passedValue);
    const [year, month, day] = value?.["date-parts"][0] || [];
    const [maxDaysInMonth, setMaxDaysInMonth] = useState(31);
    const selectRef = useRef();
    const localRef = useRef();

    const monthOptions = [
        { headline: "", value: "" },
        { headline: "January", value: 1 },
        { headline: "February", value: 2 },
        { headline: "March", value: 3 },
        { headline: "April", value: 4 },
        { headline: "May", value: 5 },
        { headline: "June", value: 6 },
        { headline: "July", value: 7 },
        { headline: "August", value: 8 },
        { headline: "September", value: 9 },
        { headline: "October", value: 10 },
        { headline: "November", value: 11 },
        { headline: "December", value: 12 },
        { headline: "Spring", value: "season-01" },
        { headline: "Summer", value: "season-02" },
        { headline: "Autumn", value: "season-03" },
        { headline: "Winter", value: "season-04" },
    ];

    useImperativeHandle(parentRef, () => localRef?.current, []);

    useEffect(() => {
        const syntheticEvent = {
            target: { ...localRef.current, value, name },
        };

        onChange(syntheticEvent);
    }, [value]);

    useEffect(() => {
        if (year && month) {
            setMaxDaysInMonth(new Date(year, month, 0).getDate());
        }
    }, [year, month]);

    function handleChange(event) {
        const match = event.target.name.match(/(year|month|day)$/);
        const type = match ? match[0] : "";
        let newValue;

        const targetValue = event.target.value;

        if (type === "year") {
            newValue = citationUtils.createDateObject(targetValue, month, day);
        } else if (type === "month") {
            newValue = citationUtils.createDateObject(year, targetValue, day);
        } else if (type === "day") {
            newValue = citationUtils.createDateObject(year, month, targetValue);
        }

        setValue(newValue);
    }

    function setToToday() {
        const today = citationUtils.createDateObject(new Date());
        setValue(today);
    }

    /* eslint-disable react/jsx-props-no-spreading */
    return (
        <div ref={localRef} name={name} className={className} {...rest}>
            <h4 className="m-2">{label}</h4>
            <div className="flex items-center gap-2">
                <TextField
                    className="flex-1"
                    type="number"
                    value={year || ""}
                    min={-200000}
                    max={200000}
                    name={`${name}-year`}
                    label="Year"
                    placeholder="YYYY"
                    onChange={handleChange}
                />
                <Select
                    className="flex-1"
                    ref={selectRef}
                    options={monthOptions}
                    name={`${name}-month`}
                    value={month || ""}
                    label="Month"
                    onChange={handleChange}
                    disabled={!year}
                />
                <TextField
                    className="flex-1"
                    type="number"
                    value={day || ""}
                    min={1}
                    max={maxDaysInMonth || 31}
                    label="Day"
                    name={`${name}-day`}
                    placeholder="DD"
                    onChange={handleChange}
                    disabled={!year || !month}
                />
                <OutlinedIconButton name="today" onClick={setToToday} />
            </div>
        </div>
    );
});

export default DateInput;
