function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function parseDateInput(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function toDateInputValue(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
}

export function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  });
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;

  return `${normalizedHour}:${pad(minutes)} ${suffix}`;
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;
}
