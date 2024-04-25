import { v4 as uuid4 } from "uuid";

export function createDateObject(yearOrDate, month = undefined, day = undefined) {
    if (yearOrDate === undefined) return;
    let year, adjustedMonth, adjustedDay;

    if (yearOrDate instanceof Date) {
        year = yearOrDate.getFullYear();
        adjustedMonth = yearOrDate.getMonth();
        adjustedDay = yearOrDate.getDate();
    } else {
        year = yearOrDate;
        adjustedMonth = month !== undefined ? month : 0;
        adjustedDay = day !== undefined ? day : 1;
    }

    let dateParts = [year];
    if (adjustedMonth !== undefined) {
        dateParts.push(adjustedMonth);
        if (adjustedDay !== undefined) {
            dateParts.push(adjustedDay);
        }
    }

    // const newDate = new Date(year, adjustedMonth, adjustedDay);

    return {
        "date-parts": [dateParts],
        // "date-time": newDate.toISOString() || undefined,
        // timestamp: newDate.getTime() || undefined,
    };
}

export function createAuthorsArray(authors) {
    const result = authors.map((author) => {
        const names = author.split(/\s+/);
        const given = names.shift() || "";
        const family = names.join(" ");
        return { given, family, id: uuid4() };
    });

    return result;
}
