import { v4 as uuid4 } from "uuid";

export function createDateObject(date) {
    const newDate = new Date(date);
    return {
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        day: newDate.getDate(),
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
