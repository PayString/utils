/* eslint-disable @typescript-eslint/consistent-type-assertions --
 * We use type assertions in these functions
 * to illustrate that things have been successfully parsed.
 */

import type { PayId, PayIdUrl } from './types'

declare const isValidPayId: unique symbol

/**
 * Parse an unknown value to a PayID.
 *
 * @param input - An input which may or may not be a valid PayID.
 *
 * @returns A valid PayID string typed as a PayId.
 *
 * @throws An error if the input is an invalid PayID.
 */
// eslint-disable-next-line max-statements -- The limit is 10 and we have 11.
export function parsePayId(input: unknown): PayId {
  if (typeof input !== 'string') {
    throw new Error('PayIDs must be a string.')
  }

  const lastDollarIndex = input.lastIndexOf('$')
  const user = input.slice(0, lastDollarIndex)
  const host = input.slice(lastDollarIndex + 1)

  if (lastDollarIndex === -1 || user.length === 0 || host.length === 0) {
    throw new Error('A PayID must have a user and a host, divided by a $.')
  }

  if (user.includes('/') || host.includes('/')) {
    throw new Error('A PayID string representation cannot include paths.')
  }

  // Throws an error if this would be an invalid PayID URL
  parsePayIdUrl(`https://${host}/${user}`)

  // PayIDs are canonically all lowercase
  return input.toLowerCase() as PayId
}

/**
 * Parse the URL to see if it can be converted to a PayID.
 *
 * @param input - The URL string to be converted to a PayID URL.
 *
 * @returns A URL object.
 *
 * @throws A custom ParseError when the PayID URL is invalid.
 */
export function parsePayIdUrl(input: unknown): PayIdUrl {
  if (typeof input !== 'string' && !(input instanceof URL)) {
    throw new Error('PayID URLs must be either URL strings or URL objects.')
  }
  const url = input instanceof URL ? input : new URL(input)

  // Make sure the protocol isn't something wild like an FTP request
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      `Invalid URL protocol: "${url.protocol}". PayID URLs must be HTTP/HTTPS.`,
    )
  }

  // Disallow namespace paths
  if (!url.hostname.includes('.')) {
    throw new Error(`Hostname "${url.hostname}" is not a valid hostname.`)
  }

  return url as PayIdUrl
}
