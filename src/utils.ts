/**
 * Validate if the input is ASCII based text.
 *
 * Shamelessly taken from:
 * https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only.
 *
 * @param input - The input to check.
 *
 * @returns A boolean indicating the result.
 */
export function isAscii(input: string): boolean {
  // eslint-disable-next-line no-control-regex -- The ASCII regex uses control characters
  return /^[\x00-\x7F]*$/u.test(input)
}

/**
 * Validate if the given input is a valid URL.
 *
 * @param input - A string that may or may not be a valid URL.
 *
 * @returns A boolean indicating whether or not the input string was a valid URL.
 */
export function isValidUrl(input: string): boolean {
  // Check that there is at least the possibility of a TLD existing
  if (!input.includes('.')) {
    return false
  }

  try {
    // eslint-disable-next-line no-new -- Explicitly using new URL to see if a TypeError is thrown.
    new URL(input)
  } catch {
    return false
  }

  return true
}
