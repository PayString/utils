import { splitPayString } from './helpers'
import { parsePayString, parsePayStringUrl } from './parse'
import type { PayStringUrl, PayString } from './types'

/**
 * Convert a PayString string to a PayStringUrl.
 *
 * @param potentialPayString - A string that might be a valid PayString.
 *
 * @returns A URL object typed as a PayStringUrl.
 *
 * @throws An error if the PayString given as an input  is invalid.
 */
export function convertPayStringToUrl(
  potentialPayString: string,
): PayStringUrl {
  const payString = parsePayString(potentialPayString)

  const [user, host] = splitPayString(payString)

  // TODO:(hbergren) If PayString Discovery becomes real,
  // this might need to make a fetch() request to determine how to build the PayString URL.
  return parsePayStringUrl(`https://${host}/${user}`)
}

/**
 * Convert a PayString URL as a string or URL object to a PayString string representation.
 *
 * @param potentialPayStringUrl - A string or URL that might be a valid PayString URL.
 *
 * @returns A valid PayString string typed as a PayString.
 *
 * @throws An error if the PayString URL given as an input is invalid.
 */
export function convertUrlToPayString(
  potentialPayStringUrl: string | URL,
): PayString {
  const payStringUrl = parsePayStringUrl(potentialPayStringUrl)

  // Remove the leading '/' from the path.
  //
  // TODO:(hbergren) If PayString Discovery becomes real,
  // this might need to make a fetch() request to determine how to parse the PayString URL.
  const user = payStringUrl.pathname.slice(1)

  const payString = `${user}$${payStringUrl.hostname}`

  return parsePayString(payString)
}
