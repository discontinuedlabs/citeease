/**
 * Generates a unique identifier of a specified length.
 *
 * This function creates a unique ID by generating a sequence of characters from a predefined alphabet.
 * It uses a pool of random bytes to select characters from the alphabet, ensuring uniqueness.
 *
 * @param {number} length - The desired length of the unique ID.
 * @returns {string} A unique identifier of the specified length.
 */
export function uid(length: number = 20): string {
    const POOL_SIZE_MULTIPLIER = 128;
    const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

    let pool: Uint8Array | undefined;
    let poolOffset: number = 0;

    /**
     * Refills the random value pool with enough bytes to cover the requested length.
     * If the pool is not yet large enough, it is expanded.
     *
     * @param {number} byteCount - The minimum number of bytes required in the pool.
     */
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
 * Calculates the relative time from the given date to now.
 *
 * @param dateString - The date string to calculate the time difference from. This should be a valid ISO 8601 date string.
 * @returns A string representing the time elapsed since the given date in a human-readable format.
 */
export function timeAgo(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);

    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    let formattedTime: string;

    if (diffInSeconds < 60) {
        // Less than a minute
        formattedTime = "just now";
    } else if (diffInSeconds < 3600) {
        // Less than an hour
        formattedTime = `${Math.floor(diffInSeconds / 60)} ${
            Math.floor(diffInSeconds / 60) === 1 ? "minute" : "minutes"
        } ago`;
    } else if (diffInSeconds < 86400) {
        // Less than 24 hours
        formattedTime = `${Math.floor(diffInSeconds / 3600)} ${
            Math.floor(diffInSeconds / 3600) === 1 ? "hour" : "hours"
        } ago`;
    } else if (diffInSeconds < 604800) {
        // Less than a week
        formattedTime = `${Math.floor(diffInSeconds / 86400)} ${
            Math.floor(diffInSeconds / 86400) === 1 ? "day" : "days"
        } ago`;
    } else if (diffInSeconds < 1209600) {
        // More than a week but less than two weeks
        formattedTime = `${Math.floor(diffInSeconds / 604800)} ${
            Math.floor(diffInSeconds / 604800) === 1 ? "week" : "weeks"
        } ago`;
    } else if (diffInSeconds < 31536000) {
        // More than two weeks but less than a year
        formattedTime = `${then.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    } else {
        // More than a year
        formattedTime = `${then.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        })}`;
    }

    return formattedTime;
}
