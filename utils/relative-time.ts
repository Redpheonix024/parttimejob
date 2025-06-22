export function getRelativeTime(timestamp: any): string {
  try {
    if (!timestamp) return "Recently";

    let date: Date;

    // Handle different timestamp formats
    if (typeof timestamp === "object" && "toDate" in timestamp) {
      // Handle Firestore Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === "object" && "seconds" in timestamp) {
      // Handle timestamp with seconds
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === "string") {
      // Handle ISO string
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      // Handle Date object
      date = timestamp;
    } else {
      console.warn("Invalid timestamp format:", timestamp);
      return "Recently";
    }

    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", date);
      return "Recently";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return diffInSeconds < 10
        ? "Just now"
        : `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? "1 minute ago"
        : `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Recently";
  }
}

