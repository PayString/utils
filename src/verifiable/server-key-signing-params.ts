import { JWK } from 'jose'

import { SigningParams } from './verifiable-payid'

import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import OctKey = JWK.OctKey
import OKPKey = JWK.OKPKey

/**
 * Represents the properties needed to sign a PayID using a server key.
 */
export default class ServerKeySigningParams implements SigningParams {
  public readonly keyType = 'serverKey'
  public readonly key: ECKey | RSAKey | OctKey | OKPKey
  public readonly alg: string
  public readonly x5c: ECKey | RSAKey | OctKey | OKPKey

  /**
   * Default constructor.
   *
   * @param key - The private key to sign with.
   * @param alg - The signing algorithm.
   * @param x5c - The public x509 certificate.
   */
  public constructor(
    key: ECKey | RSAKey | OctKey | OKPKey,
    alg: string,
    x5c: ECKey | RSAKey | OctKey | OKPKey,
  ) {
    this.key = key
    this.alg = alg
    this.x5c = x5c
  }
}
