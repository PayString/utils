import { JWK } from 'jose/webcrypto/types'

import { SigningParams } from './verifiable-paystring'

/**
 * Represents the properties needed to sign a PayString using an identity key.
 */
export default class IdentityKeySigningParams implements SigningParams {
  public readonly keyType = 'identityKey'
  public readonly key: JWK
  public readonly alg: string

  /**
   * Default constructor.
   *
   * @param key - The private key to sign with.
   * @param alg - The signing algorithm.
   */
  public constructor(key: JWK, alg: string) {
    this.key = key
    this.alg = alg
  }
}
