/**
 * Date validation and formatting utilities
 * Handles dd-mm-yy format validation and parsing
 */

/**
 * Validates a date string in dd-mm-yy format
 * @param dateString - Date string in dd-mm-yy format
 * @param errorMessages - Object with error messages for different validation failures
 * @returns Error message string or null if valid
 */
export function validateDateString(
  dateString: string,
  errorMessages: {
    invalidDate: string;
    dateInFuture: string;
  }
): string | null {
  if (!dateString.trim()) {
    return null; // Empty is handled separately
  }

  const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return errorMessages.invalidDate;
  }

  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Validate day (1-31)
  if (day < 1 || day > 31) {
    return errorMessages.invalidDate;
  }

  // Validate month (1-12)
  if (month < 1 || month > 12) {
    return errorMessages.invalidDate;
  }

  // Convert 2-digit year to 4-digit year
  // Assume years 00-30 are 2000-2030, years 31-99 are 1931-1999
  let fullYear = year;
  if (year < 100) {
    fullYear = year <= 30 ? 2000 + year : 1900 + year;
  }

  // Create date object (month is 0-indexed in JS Date)
  const date = new Date(fullYear, month - 1, day);

  // Validate date (check if date is valid, e.g., not 31-02)
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== fullYear
  ) {
    return errorMessages.invalidDate;
  }

  // Check if date is in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to compare dates only
  const inputDate = new Date(fullYear, month - 1, day);
  if (inputDate > now) {
    return errorMessages.dateInFuture;
  }

  return null; // Valid date
}

/**
 * Formats date input as user types (dd-mm-yy format)
 * @param value - Raw input value
 * @returns Formatted date string
 */
export function formatDateInput(value: string): string {
  // Remove all non-digits
  let digits = value.replace(/\D/g, "");

  // Limit to 6 digits (ddmmyy)
  if (digits.length > 6) {
    digits = digits.slice(0, 6);
  }

  // Format with dashes
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  }
}

/**
 * Validates date input during typing to prevent invalid dates
 * @param value - Raw input value
 * @returns true if input should be allowed, false otherwise
 */
export function validateDateInput(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) {
    return true;
  }

  const firstDigit = parseInt(digits[0], 10);

  // Day validation: first digit can't be > 3
  if (digits.length === 1 && firstDigit > 3) {
    return false;
  }

  // Day validation: if first digit is 3, second can't be > 1
  if (digits.length === 2) {
    const day = parseInt(digits.slice(0, 2), 10);
    if (day > 31 || day < 1) {
      return false;
    }
  }

  // Month validation: first digit can't be > 1
  if (digits.length === 3) {
    const monthFirstDigit = parseInt(digits[2], 10);
    if (monthFirstDigit > 1) {
      return false;
    }
  }

  // Month validation: if first digit is 1, second can't be > 2
  if (digits.length === 4) {
    const month = parseInt(digits.slice(2, 4), 10);
    if (month > 12 || month < 1) {
      return false;
    }
  }

  return true;
}

/**
 * Parses date from dd-mm-yy format to Date object
 * @param dateString - Date string in dd-mm-yy format
 * @returns Date object
 * @throws Error if date is invalid
 */
export function parseDateString(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Expected dd-mm-yy");
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  let year = parseInt(parts[2], 10);

  // Convert 2-digit year to 4-digit year
  // Assume years 00-30 are 2000-2030, years 31-99 are 1931-1999
  if (year < 100) {
    year = year <= 30 ? 2000 + year : 1900 + year;
  }

  const date = new Date(year, month, day);

  // Validate date
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    throw new Error("Invalid date");
  }

  // Check if date is not in the future
  if (date > new Date()) {
    throw new Error("Birth date cannot be in the future");
  }

  return date;
}

/**
 * Formats Date object as YYYY-MM-DD string
 * @param date - Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForAI(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

