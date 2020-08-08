import { JWKECKey, JWKOctKey, JWKOKPKey, JWKRSAKey } from 'jose'
import * as Vorpal from 'vorpal'

import { PaymentInformation } from '../verifiable'

export default class LocalStorage {
  private readonly localStorage: VorpalLocalStorage

  public constructor(id: string, vorpal: Vorpal) {
    vorpal.localStorage(id)
    // eslint-disable-next-line @typescript-eslint/unbound-method -- vorpal doesn't provide proper type defs for this
    this.localStorage = (vorpal.localStorage as unknown) as VorpalLocalStorage
  }

  public getPaymentInfo(): PaymentInformation | undefined {
    return this.getItem('payid') as PaymentInformation
  }

  public setPaymentInfo(info: PaymentInformation): void {
    this.setItem('payid', JSON.stringify(info))
  }

  public getSigningKey(
    name: string,
  ): JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey | undefined {
    return this.getItem(name) as JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey
  }

  public setJsonWebKey(
    name: string,
    key: JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey,
  ): void {
    return this.setItem(name, JSON.stringify(key))
  }

  public removeItem(key: string): void {
    this.localStorage.removeItem(key)
  }

  private getItem(
    key: string,
  ):
    | JWKRSAKey
    | JWKECKey
    | JWKOKPKey
    | JWKOctKey
    | PaymentInformation
    | undefined {
    const rawValue = this.localStorage.getItem(key)
    if (rawValue && typeof rawValue === 'string') {
      if (rawValue.startsWith('{')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- because JSON
        return JSON.parse(rawValue)
      }
    }
    return undefined
  }

  private setItem(key: string, value: string): void {
    this.localStorage.setItem(key, value)
  }
}

interface VorpalLocalStorage {
  getItem: (key: string) => string | unknown
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}
