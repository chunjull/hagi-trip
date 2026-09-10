const CLOCK_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

export type MinuteComparison = -1 | 0 | 1;

const assertMinutesSinceMidnight = (value: number, label: string): void => {
  if (!Number.isInteger(value) || value < 0 || value >= MINUTES_PER_DAY) {
    throw new RangeError(`${label} must be an integer between 0 and ${MINUTES_PER_DAY - 1}.`);
  }
};

/**
 * Converts a strict 24-hour HH:mm value into minutes since midnight.
 * Invalid input throws instead of being interpreted as a Date in the device time zone.
 */
export const parseClockTime = (value: string): number => {
  if (!CLOCK_TIME_PATTERN.test(value)) {
    throw new RangeError(`Invalid clock time "${value}"; expected HH:mm in the range 00:00-23:59.`);
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

/** Converts validated hour/minute parts into minutes since midnight. */
export const toMinutesSinceMidnight = (hours: number, minutes: number): number => {
  if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
    throw new RangeError("hours must be an integer between 0 and 23.");
  }
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new RangeError("minutes must be an integer between 0 and 59.");
  }

  return hours * MINUTES_PER_HOUR + minutes;
};

/** Compares two validated minute values and returns a stable three-way result. */
export const compareMinutes = (left: number, right: number): MinuteComparison => {
  assertMinutesSinceMidnight(left, "left");
  assertMinutesSinceMidnight(right, "right");

  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
};
