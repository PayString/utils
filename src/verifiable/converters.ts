import { GeneralJWSInput, GeneralJWS } from 'jose/webcrypto/types'

import {
  Address,
  PaymentInformation,
  VerifiedAddress,
} from './verifiable-paystring'

/**
 * Converts JSON to a Verified Address. Both have the same JWS structure but for
 * PayString we use our own type so as not to be coupled too tightly to the underlying JOSE library.
 *
 * @param json - The json to convert.
 * @returns The address.
 * @throws Error if the json does not have the required properties.
 */
export function convertToVerifiedAddress(json: string): VerifiedAddress {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- untyped JSON
  const { address }: { address: VerifiedAddress } = JSON.parse(json)
  return address
}

/**
 * Converts JWS to a Verified Address. Both have the same JWS structure but for
 * PayString we use our own type so as not to be coupled too tightly to the underlying JOSE library.
 *
 * @param payload - The payload.
 * @param jws - The JWS signatures.
 * @returns The address.
 * @throws Error if the json does not have the required properties.
 */
export function convertGeneralJwsToVerifiedAddress(
  payload: string,
  jws: GeneralJWS,
): VerifiedAddress {
  return {
    payload,
    signatures: jws.signatures.map((recipient) => {
      if (recipient.protected === undefined) {
        throw new Error('missing protected property')
      }
      return {
        protected: recipient.protected,
        signature: recipient.signature,
      }
    }),
  }
}

/**
 * Converts JSON string to typed Address instance.
 *
 * @param json - JSON string.
 * @returns Address instance.
 */
export function convertJsonToAddress(json: string): Address {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- untyped JSON
  const { payIdAddress }: { payIdAddress: Address } = JSON.parse(json)
  return payIdAddress
}

/**
 * Converts a VerifiedAddress to a JOSE GeneralJWSInput.
 *
 * @param verifiedAddress - Address to convert.
 * @returns Address instance.
 */
export async function convertToGeneralJWSInput(
  verifiedAddress: VerifiedAddress,
): Promise<GeneralJWSInput> {
  return {
    payload: verifiedAddress.payload,
    signatures: verifiedAddress.signatures.map((value) => {
      return {
        signature: value.signature,
        protected: value.protected,
      }
    }),
  }
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
