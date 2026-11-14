/**
 * Date formatting for ISO "YYYY-MM-DD" strings. Everything is read and shown in
 * UTC, so a date never shifts by a day in time zones behind or ahead of UTC.
 */

function toUtcDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

function format(isoDate: string, options: Intl.DateTimeFormatOptions): string {
  return toUtcDate(isoDate).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}

/** "12 Mar" */
export function formatShortDate(isoDate: string): string {
  return format(isoDate, { day: "numeric", month: "short" });
}

/** "Friday 12 Mar" */
export function formatDay(isoDate: string): string {
  return format(isoDate, { weekday: "long", day: "numeric", month: "short" });
}

/** "Fri" */
export function formatWeekday(isoDate: string): string {
  return format(isoDate, { weekday: "short" });
}

/** Day of the month, e.g. "12". */
export function formatDayNumber(isoDate: string): string {
  return format(isoDate, { day: "numeric" });
}

/** "12 Mar – 15 Mar", with the year added when asked: "12 Mar – 15 Mar 2027". */
export function formatDateRange(startDate: string, endDate: string, withYear = false): string {
  const range = `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
  return withYear ? `${range} ${toUtcDate(endDate).getUTCFullYear()}` : range;
}

/** Number of days a trip covers, counting both the first and last day. */
export function tripLength(startDate: string, endDate: string): number {
  const ms = toUtcDate(endDate).getTime() - toUtcDate(startDate).getTime();
  return Math.max(Math.round(ms / 86_400_000) + 1, 0);
}
