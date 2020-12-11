declare const isValidPayString: unique symbol

/**
 * A type alias for a string that has been verified as a valid PayString.
 */
export type PayString = string & {
  [isValidPayString]: true
}

/**
 * A type alias for a URL that has been verified as a valid PayString URL.
 */
export type PayStringUrl = URL & {
  [isValidPayString]: true
}
