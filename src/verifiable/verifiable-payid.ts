/**
 * Type of payment address in PaymentInformation.
 */
import { JWK } from 'jose'

import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import OctKey = JWK.OctKey
import OKPKey = JWK.OKPKey

export enum AddressDetailsType {
  CryptoAddress = 'CryptoAddressDetails',
  AchAddress = 'AchAddressDetails',
}

/**
 * Matching schema for AddressDetailsType.CryptoAddress.
 */
export interface CryptoAddressDetails {
  readonly address: string
  readonly tag?: string
}

/**
 * Address information included inside of a PaymentInformation object.
 */
export interface Address {
  readonly paymentNetwork: string
  readonly environment?: string
  readonly addressDetailsType: AddressDetailsType
  readonly addressDetails: CryptoAddressDetails
}

export interface SigningParams {
  readonly key: ECKey | RSAKey | OctKey | OKPKey
  readonly alg: string
  keyType: string
}
