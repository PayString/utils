import { JWKECKey, JWKOctKey, JWKOKPKey, JWKRSAKey } from 'jose'
import * as Vorpal from 'vorpal'

import { PaymentInformation } from '../verifiable'

/**
 * Facade layer for the Vorpal localstorage object. Provides typed methods for accessing things in
 * local storage like signing keys and PayID PaymentInformation. Objects in local storage are
 * stored as JSON strings.
 */
export default class LocalStorage {
  private readonly localStorage: VorpalLocalStorage

  /**
   * Constructs the facade and initializes the localstorage instance.
   *
   * @param id - The id for this local storage.
   * @param vorpal - The vorpal instance to use.
   */
  public constructor(id: string, vorpal: Vorpal) {
    // initializes the local storage instance
    vorpal.localStorage(id)
    // The Vorpal API for local storage is really poorly defined and the type defs do not match the actual API.
    // see https://github.com/dthree/vorpal/wiki/API-%7C-vorpal#vorpallocalstorageid
    // So many things that make typescript linter upset that it's easiest to just disable all rules for this one line.
    /* eslint-disable eslint-comments/no-unlimited-disable -- to many rules to disable */
    /* eslint-disable -- the linter hates this import */
    this.localStorage = (vorpal.localStorage as unknown) as VorpalLocalStorage
    /* eslint-enable */
  }

  /**
   * Gets the PaymentInformation instance from local storage.
   *
   * @returns The instance or undefined if none exists.
   */
  public getPaymentInfo(): PaymentInformation | undefined {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guaranteed by setPaymentInfo
    return this.getItem('payid') as PaymentInformation
  }

  /**
   * Updates the PaymentInformation in local storage.
   *
   * @param info - The value to store.
   */
  public setPaymentInfo(info: PaymentInformation): void {
    this.setItem('payid', JSON.stringify(info))
  }

  /**
   * Gets a named signing key from local storage.
   *
   * @param name - The name of the key.
   * @returns The key or null.
   */
  public getSigningKey(
    name: string,
  ): JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey | undefined {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- guaranteed by setSigningKey
    return this.getItem(name) as JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey
  }

  /**
   * Sets value for a named signing key from local storage.
   *
   * @param name - The name of the key.
   * @param key - The key to store.
   */
  public setSigningKey(
    name: string,
    key: JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey,
  ): void {
    this.setItem(name, JSON.stringify(key))
  }

  /**
   * Removes an item from localstorage.
   *
   * @param name - The name of the item to remove.
   */
  public removeItem(name: string): void {
    this.localStorage.removeItem(name)
  }

  /**
   * Gets item from localstorage. If value exists, also parses JSON value.
   *
   * @param name - The name of the item to get.
   * @returns The object or undefined if not in localstore.
   */
  private getItem(
    name: string,
  ):
    | JWKRSAKey
    | JWKECKey
    | JWKOKPKey
    | JWKOctKey
    | PaymentInformation
    | undefined {
    const rawValue = this.localStorage.getItem(name)
    if (rawValue && typeof rawValue === 'string') {
      if (rawValue.startsWith('{')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- because JSON
        return JSON.parse(rawValue)
      }
    }
    return undefined
  }

  /**
   * Sets the value of a item in localstorage.
   *
   * @param name - The name of the item.
   * @param value - The value to store.
   */
  private setItem(name: string, value: string): void {
    this.localStorage.setItem(name, value)
  }
}

interface VorpalLocalStorage {
  getItem: (key: string) => string | unknown
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}
