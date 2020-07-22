declare const isValidPayId: unique symbol

/**
 * A type alias for a string that has been verified as a valid PayID.
 */
export type PayId = string & {
  [isValidPayId]: true
}

/**
 * A type alias for a URL that has been verified as a valid PayID URL.
 */
export type PayIdUrl = URL & {
  [isValidPayId]: true
}

// export class PayId {
//   pub
// }
