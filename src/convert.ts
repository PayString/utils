import { parsePayId, parsePayIdUrl } from './parse'
import type { PayIdUrl, PayId } from './types'

/**
 * Convert a PayID string to a PayIdUrl.
 *
 * @param potentialPayId - A string that might be a valid PayID.
 *
 * @returns A URL object typed as a PayIdUrl.
 *
 * @throws An error if the PayID given as an input  is invalid.
 */
export function convertPayIdToUrl(potentialPayId: string): PayIdUrl {
  const payId = parsePayId(potentialPayId)

  const lastDollarIndex = payId.lastIndexOf('$')
  const user = payId.slice(0, lastDollarIndex)
  const host = payId.slice(lastDollarIndex + 1)

  // TODO:(hbergren) If PayID Discovery becomes real,
  // this might need to make a fetch() request to determine how to build the PayID URL.
  return parsePayIdUrl(`https://${host}/${user}`)
}

/**
 * Convert a PayID URL as a string or URL object to a PayID string representation.
 *
 * @param potentialPayIdUrl - A string or URL that might be a valid PayID URL.
 *
 * @returns A valid PayID string typed as a PayId.
 *
 * @throws An error if the PayID URL given as an input is invalid.
 */
export function convertUrlToPayId(potentialPayIdUrl: string | URL): PayId {
  const payIdUrl = parsePayIdUrl(potentialPayIdUrl)

  // Remove the leading '/' from the path
  const user = payIdUrl.pathname.slice(1)

  const payId = `${user}$${payIdUrl.hostname}`
  return parsePayId(payId)
}
