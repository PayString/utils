import { JWS } from 'jose'

import { Address, VerifiedAddress } from './verifiable-payid'

/**
 * Converts a GeneralJWS to a Verified Address.
 *
 * @param jws - The JWS to convert.
 * @returns The address.
 * @throws Error if the JWS does not have the required properties.
 */
export function convertToVerifiedAddress(jws: JWS.GeneralJWS): VerifiedAddress {
  const verified: VerifiedAddress = {
    payload: jws.payload,
    signatures: jws.signatures.map((value) => {
      if (value.protected) {
        return {
          protected: value.protected,
          signature: value.signature,
        }
      }
      throw Error('missing protected property')
    }),
  }
  return verified
}

/**
 * Converts JSON string to typed Address instance.
 *
 * @param json - JSON string.
 * @returns Address instance.
 */
export function convertJsonToVerifiedAddress(json: string): Address {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- untyped JSON
  const { payIdAddress }: { payIdAddress: Address } = JSON.parse(json)
  return payIdAddress
}
