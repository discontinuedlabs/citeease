/**
 * Generates a unique identifier of a specified length.
 *
 * This function creates a unique ID by generating a sequence of characters from a predefined alphabet.
 * It uses a pool of random bytes to select characters from the alphabet, ensuring uniqueness.
 *
 * @param {number} [length=16] - The desired length of the unique ID.
 * @returns {string} A unique identifier of the specified length.
 */
export function uid(length: number = 16): string {
    const POOL_SIZE_MULTIPLIER = 128;
    const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

    let pool: Uint8Array | undefined;
    let poolOffset: number = 0;

    function refillRandomValuePool(byteCount: number): void {
        if (!pool || pool.length < byteCount) {
            pool = new Uint8Array(POOL_SIZE_MULTIPLIER * byteCount);
            window.crypto.getRandomValues(pool);
            poolOffset = 0;
        } else if (poolOffset + byteCount > pool.length) {
            window.crypto.getRandomValues(pool.subarray(poolOffset, poolOffset + byteCount));
            poolOffset = 0;
        }
        poolOffset += byteCount;
    }

    refillRandomValuePool(length);

    let uniqueId: string = "";
    for (let index = 0; index < length; index += 1) {
        if (!pool) {
            throw new Error("Pool is unexpectedly undefined.");
        }
        uniqueId += ALLOWED_CHARS[pool[index + poolOffset] % ALLOWED_CHARS.length];
    }
    return uniqueId;
}

/**
 * Returns a human-readable relative time string indicating how long ago (or in the future) a given date is,
 * compared to the current date and time.
 *
 * @param {string} dateString - The date in ISO string format or any parsable date format.
 * @param {Intl.RelativeTimeFormatStyle} [style="long"] - Optional. The style of the relative time format.
 *     Can be "long", "short", or "narrow". Defaults to "long".
 * @returns {string} - A human-readable string describing the relative time (e.g., "3 days ago", "in 2 months").
 *
 * @example
 * // Returns something like "3 days ago" or "in 2 months"
 * timeAgo("2023-09-01T12:00:00Z");
 *
 * @example
 * // With short style format: "3d ago"
 * timeAgo("2023-09-01T12:00:00Z", "short");
 */
export function timeAgo(dateString: string, style: Intl.RelativeTimeFormatStyle = "long"): string {
    const now = new Date();
    const then = new Date(dateString);

    const formatter = new Intl.RelativeTimeFormat(undefined, {
        numeric: "auto",
        style,
    });

    const DIVISIONS = [
        { amount: 60, name: "seconds" },
        { amount: 60, name: "minutes" },
        { amount: 24, name: "hours" },
        { amount: 7, name: "days" },
        { amount: 4.34524, name: "weeks" },
        { amount: 12, name: "months" },
        { amount: Number.POSITIVE_INFINITY, name: "years" },
    ];

    let duration = (then.getTime() - now.getTime()) / 1000;

    for (let i = 0; i < DIVISIONS.length; i += 1) {
        const division = DIVISIONS[i];
        if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.name as Intl.RelativeTimeFormatUnit);
        }
        duration /= division.amount;
    }

    return "now";
}

export function citationCount(citations) {
    if (citations.length === 0) {
        return "No sources added";
    }
    if (citations.length === 1) {
        return "1 source";
    }
    return `${citations.length} sources`;
}

/**
 * Parses a URL query string into an object where keys are the names of the query parameters and values are their corresponding values.
 *
 * @param {string} query - The query string to parse, e.g., "key=value&anotherKey=anotherValue".
 * @returns {Record<string, string>} An object representing the parsed query string, where each key-value pair corresponds to a query parameter and its value.
 */
export function parseQueryString(query: string): Record<string, string> {
    return query
        .replace(/^\?/, "")
        .split("&")
        .reduce(
            (acc: Record<string, string>, keyValue) => {
                const [key, value] = keyValue.split("=");
                acc[key] = value;
                return acc;
            },
            {} as Record<string, string>
        );
}
