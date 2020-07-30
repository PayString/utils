/* eslint-disable import/prefer-default-export -- TODO: Just disable this rule from Xpring ESLint */
/**
 * Takes a string representation of a PayID and splits it into a [user, host] tuple.
 *
 * @param payId - A string representation of a PayID, like 'alice$example.com'.
 *
 * @returns A tuple of the [user, host] pair, like ['alice', 'example.com'].
 *
 * @throws An error when the PayID does not have a user or a host. (like '$example.com', or 'alice.
 */
export function splitPayIdString(payId: string): [string, string] {
  const lastDollarIndex = payId.lastIndexOf('$')
  const user = payId.slice(0, lastDollarIndex)
  const host = payId.slice(lastDollarIndex + 1)

  if (lastDollarIndex === -1 || user.length === 0 || host.length === 0) {
    throw new Error(
      'A PayID must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  }

  return [user, host]
}
