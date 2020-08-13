import { JWS } from 'jose'

import {
  Address,
  PaymentInformation,
  VerifiedAddress,
} from './verifiable-payid'

/**
 * Converts a GeneralJWS to a Verified Address. Both have the same JWS structure but for
 * PayID we use our own type so as not to be coupled too tightly to the underlying JOSE library.
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

/**
 * Converts JSON string to typed Address instance.
 *
 * @param json - JSON string.
 * @returns PaymentInformation instance.
 */
export function convertJsonToPaymentInformation(
  json: string,
): PaymentInformation {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- untyped JSON
  const {
    payId,
    addresses,
    verifiedAddresses,
  }: {
    payId: string
    addresses: Address[]
    verifiedAddresses: VerifiedAddress[]
  } = JSON.parse(json)
  return {
    payId,
    addresses,
    verifiedAddresses,
  }
}
