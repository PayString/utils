/* eslint-disable import/prefer-default-export -- TODO: Just disable this rule from Xpring ESLint */
/**
 * Takes a string representation of a PayString and splits it into a [user, host] tuple.
 *
 * @param payString - A string representation of a PayString, like 'alice$example.com'.
 *
 * @returns A tuple of the [user, host] pair, like ['alice', 'example.com'].
 *
 * @throws An error when the PayString does not have a user or a host. (like '$example.com', or 'alice.
 */
export function splitPayString(payString: string): [string, string] {
  const lastDollarIndex = payString.lastIndexOf('$')
  const user = payString.slice(0, lastDollarIndex)
  const host = payString.slice(lastDollarIndex + 1)

  if (lastDollarIndex === -1 || user.length === 0 || host.length === 0) {
    throw new Error(
      'A PayString must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  }

  return [user, host]
}
