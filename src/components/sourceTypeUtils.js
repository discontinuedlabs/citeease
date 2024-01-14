export function createDateObject(date) {
    const newDate = new Date(date);
    return {
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        day: newDate.getDate(),
    };
}
