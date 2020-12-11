/* eslint-disable @typescript-eslint/consistent-type-assertions --
 * We use type assertions in these functions
 * to illustrate that things have been successfully parsed.
 */

import { splitPayString } from './helpers'
import type { PayString, PayStringUrl } from './types'

declare const isValidPayString: unique symbol

/**
 * Parse an unknown value to a PayString.
 *
 * @param input - An input which may or may not be a valid PayString.
 *
 * @returns A valid PayString string typed as a PayString.
 *
 * @throws An error if the input is an invalid PayString.
 */
export function parsePayString(input: unknown): PayString {
  if (typeof input !== 'string') {
    throw new Error('PayStrings must be a string.')
  }

  const [user, host] = splitPayString(input)

  if (user.includes('/') || host.includes('/')) {
    throw new Error('A PayString string representation cannot include paths.')
  }

  // Throws an error if this would be an invalid PayString URL
  parsePayStringUrl(`https://${host}/${user}`)

  // PayStrings are canonically all lowercase
  return input.toLowerCase() as PayString
}

/**
 * Parse the URL to see if it can be converted to a PayString.
 *
 * @param input - The URL string to be converted to a PayString URL.
 *
 * @returns A URL object.
 *
 * @throws A custom ParseError when the PayString URL is invalid.
 */
export function parsePayStringUrl(input: unknown): PayStringUrl {
  if (typeof input !== 'string' && !(input instanceof URL)) {
    throw new Error('PayString URLs must be either URL strings or URL objects.')
  }
  const url = input instanceof URL ? input : new URL(input)

  // Make sure the protocol isn't something wild like an FTP request
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      `Invalid URL protocol: "${url.protocol}". PayString URLs must be HTTP/HTTPS.`,
    )
  }

  // Disallow namespace paths
  if (!url.hostname.includes('.')) {
    throw new Error(
      `Hostname "${url.hostname}" is not a valid hostname. Needs a dot-separated TLD.`,
    )
  }

  return url as PayStringUrl
}
