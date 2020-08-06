import * as Vorpal from 'vorpal'

export default class LocalStorage {

  readonly vorpal: Vorpal

  constructor(id: string, vorpal: Vorpal) {
    this.vorpal = vorpal
    vorpal.localStorage(id)
  }

  public getItem(key: string): any | undefined {
    // @ts-ignore
    const rawValue = this.vorpal.localStorage.getItem(key)
    if (rawValue) {
      if (rawValue.startsWith('{')) return JSON.parse(rawValue)
      else return rawValue
    }
    return rawValue
  }

  public setItem(key: string, value: any): any {
    const asString = (typeof value === 'string') ? value : JSON.stringify(value)
    // @ts-ignore
    return this.vorpal.localStorage.setItem(key, asString)
  }

  public removeItem(key: string): any {
    // @ts-ignore
    return this.vorpal.localStorage.removeItem(key)
  }

  public clear() {
    this.removeItem('payid')
    this.removeItem('identity-key')
    this.removeItem('server-key')
    this.removeItem('server-cert')
  }
}
