const tokenConverterMap = (() => {
  const fullMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ] as const;

  const abbvMonthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const;

  const fullDayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;

  const abbvDayNames = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ] as const;

  const padStart = (val: number | string, len = 2) =>
    String(val).padStart(len, "0");

  const getY = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCFullYear() : date.getFullYear();

  const getH24 = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCHours() : date.getHours();

  const getH12 = (date: Date, isUTC: boolean) =>
    (isUTC ? date.getUTCHours() : date.getHours()) % 12;

  const getMin = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCMinutes() : date.getMinutes();

  const getSec = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCSeconds() : date.getSeconds();

  const getF = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCMilliseconds() : date.getMilliseconds();

  const getDay = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCDay() : date.getDay();

  const getDate = (date: Date, isUTC: boolean) =>
    isUTC ? date.getUTCDate() : date.getDate();

  const getMonth = (date: Date, isUTC: boolean) =>
    (isUTC ? date.getUTCMonth() : date.getMonth()) + 1;

  const returnString =
    (f: (date: Date, isUTC: boolean) => number) =>
    (date: Date, isUTC: boolean) =>
      String(f(date, isUTC));

  return [
    ["yyyy", (d, u) => padStart(getY(d, u), 4)],
    ["yy", (d, u) => padStart(getY(d, u))],
    ["y", returnString(getY)],
    ["HH", (d, u) => padStart(getH24(d, u))],
    ["H", returnString(getH24)],
    ["hh", (d, u) => padStart(getH12(d, u))],
    ["h", returnString(getH12)],
    ["mm", (d, u) => padStart(getMin(d, u))],
    ["m", returnString(getMin)],
    ["ss", (d, u) => padStart(getSec(d, u))],
    ["s", returnString(getSec)],
    ["fff", (d, u) => padStart(getF(d, u), 3)],
    ["ff", (d, u) => padStart(Math.round(getF(d, u) / 10))],
    ["f", (d, u) => String(Math.round(getF(d, u) / 100))],
    ["tt", (d, u) => (getH24(d, u) < 12 ? "am" : "pm")],
    ["t", (d, u) => (getH24(d, u) < 12 ? "a" : "p")],
    ["TT", (d, u) => (getH24(d, u) < 12 ? "AM" : "PM")],
    ["T", (d, u) => (getH24(d, u) < 12 ? "A" : "P")],
    ["dddd", (d, u) => fullDayNames[getDay(d, u)]],
    ["DDD", (d, u) => abbvDayNames[getDay(d, u)].toUpperCase()],
    ["ddd", (d, u) => abbvDayNames[getDay(d, u)]],
    ["dd", (d, u) => padStart(getDate(d, u))],
    ["d", returnString(getDate)],
    ["MMMM", (d, u) => fullMonthNames[getMonth(d, u) - 1]],
    ["MMM", (d, u) => abbvMonthNames[getMonth(d, u) - 1].toUpperCase()],
    ["mmm", (d, u) => abbvMonthNames[getMonth(d, u) - 1]],
    ["MM", (d, u) => padStart(getMonth(d, u))],
    ["M", returnString(getMonth)],
  ] as [string, (date: Date, isUTC: boolean) => string][];
})();

/** Default format: `yyyy-MM-dd HH:mm:ss` */
export function formatDate(
  date: Date,
  format = "yyyy-MM-dd HH:mm:ss",
  isUTC = false
) {
  const parts: string[] = [];

  while (format.length > 0) {
    const matched = tokenConverterMap.find(([token]) =>
      format.startsWith(token)
    );
    if (!matched) {
      parts.push(format[0]);
      format = format.substring(1);
      continue;
    }
    const [token, converter] = matched;
    parts.push(converter(date, isUTC));
    format = format.substring(token.length);
  }

  return parts.join("");
}

export default formatDate;

/**
 * Formats a Date object as relative time (e.g., "2 minutes ago", "yesterday", "3 days ago")
 * for dates within 15 days. For dates beyond 15 days, displays formatted date (e.g., "2023-01-10").
 * Displays "just now" if the time difference is 1 second or less.
 * Optimized to prioritize diffDays > 15 and defer rtf creation.
 * @param date - Input Date object.
 * @param locale - Locale for formatting (e.g., 'en', 'zh-CN'). Defaults to 'en'.
 * @param dateFormatOptions - Options for formatting dates beyond 15 days.
 * @returns Relative time or formatted date string.
 * @throws Error if the input date is invalid.
 */
export function formatRelativeDate(
  date: Date,
  locale: string = "en",
  dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
): string {
  // Validate input date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  // Calculate days difference first
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Prioritize diffDays > 15
  if (diffDays > 15) {
    const dtf = new Intl.DateTimeFormat(locale, dateFormatOptions);
    return dtf.format(date); // e.g., "01/10/2023" (en) or "2023-01-10" (zh-CN)
  }

  // Calculate finer-grained differences only if needed
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  // Initialize Intl.RelativeTimeFormat only for relative time cases
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "long",
  });

  // Handle relative time cases
  if (diffDays >= 2) {
    return rtf.format(-diffDays, "day"); // "n days ago"
  } else if (diffDays === 1) {
    return rtf.format(-1, "day"); // "yesterday"
  } else if (diffHours >= 1) {
    return rtf.format(-diffHours, "hour"); // "n hours ago"
  } else if (diffMinutes >= 1) {
    return rtf.format(-diffMinutes, "minute"); // "n minutes ago"
  } else if (diffSeconds <= 1) {
    return "just now"; // 0 or 1 second
  } else {
    return rtf.format(-diffSeconds, "second"); // "n seconds ago"
  }
}

// Example usage:
/*
const now = new Date();
console.log(formatRelativeTimeOrDate(now)); // "just now"
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 1000))); // "just now" (1 second)
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 5 * 1000))); // "5 seconds ago"
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 2 * 60 * 1000))); // "2 minutes ago"
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 3 * 60 * 60 * 1000))); // "3 hours ago"
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))); // "yesterday"
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000))); // "5 days ago"
console.log(formatRelativeTimeOrDate(new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000))); // "04/19/2025" (en)
console.log(formatRelativeTimeOrDate(new Date('2023-01-10'), 'zh-CN')); // "2023-01-10" (zh-CN)

// TypeScript type checking prevents invalid inputs:
// formatRelativeTimeOrDate('2023-01-10'); // TS error: Argument of type 'string' is not assignable to parameter of type 'Date'
// formatRelativeTimeOrDate(new Date('invalid')); // Throws Error: Invalid date
*/
