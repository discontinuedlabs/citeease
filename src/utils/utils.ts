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
