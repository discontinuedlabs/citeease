import { forwardRef } from "react";
import { TextField } from "../ui/MaterialComponents";

// TODO: Make the month a select component that also includes seasons
const DateInput = forwardRef(function DateInput(props, ref) {
    const { value = [], onChange, name, className, ...rest } = props;

    function handleChange(type) {
        return (event) => {
            console.log(type);
            const newValue = [...value];
            const newVal = event.target.value ? parseInt(event.target.value, 10) : "";

            if (type === "year") {
                newValue[0] = newVal;
            } else if (type === "month") {
                newValue[1] = newVal;
            } else if (type === "day") {
                newValue[2] = newVal;
            }

            onChange(newValue);
        };
    }

    /* eslint-disable react/jsx-props-no-spreading */
    return (
        <div ref={ref} name={name} {...rest} className={`flex gap-1 ${className}`}>
            <TextField
                type="number"
                value={value?.[0] || ""}
                min="1"
                max={new Date().getFullYear()}
                name={`${name}-year`}
                label="Year"
                placeholder="YYYY"
                onChange={() => handleChange("year")}
            />
            <TextField
                type="number"
                value={value?.[1] || ""}
                min="1"
                max="12"
                name={`${name}-month`}
                label="Month"
                placeholder="MM"
                onChange={() => handleChange("month")}
            />
            <TextField
                type="number"
                value={value?.[2] || ""}
                min="1"
                max="31"
                label="Day"
                name={`${name}-day`}
                placeholder="DD"
                onChange={() => handleChange("day")}
            />
        </div>
    );
});

export default DateInput;
