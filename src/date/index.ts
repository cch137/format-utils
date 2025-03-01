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
export default function formatDate(
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
