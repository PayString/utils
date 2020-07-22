import 'mocha'
import { assert } from 'chai'

import { parsePayIdUrl } from '../../src/parse'
import type { PayIdUrl } from '../../src/types'

describe('parsePayIdUrl()', function (): void {
  it('Returns a URL object given a valid HTTPS URL string', function () {
    // GIVEN a valid HTTPS URL string
    const potentialUrl = 'https://example.com/alice'

    // WHEN we attempt to parse that URL as a PayID URL
    const payIdUrl = parsePayIdUrl(potentialUrl)

    // THEN we get back a URL object
    assert.instanceOf(payIdUrl, URL)
  })

  it('Returns a URL object given a valid HTTP URL string', function () {
    // GIVEN a valid HTTPS URL string
    const potentialUrl = 'http://example.com/alice'

    // WHEN we attempt to parse that URL as a PayID URL
    const payIdUrl = parsePayIdUrl(potentialUrl)

    // THEN we get back a URL object
    assert.instanceOf(payIdUrl, URL)
  })

  it('Returns a URL object given a valid HTTPS URL', function () {
    // GIVEN a valid HTTPS URL
    const potentialUrl = new URL('https://example.com/alice')

    // WHEN we attempt to parse that URL as a PayID URL
    const payIdUrl = parsePayIdUrl(potentialUrl)

    // THEN we get back a URL object
    assert.instanceOf(payIdUrl, URL)
  })

  it('Throws an error for an input that is not a string or URL', function () {
    // GIVEN a null value URL
    const potentialUrl = null

    // WHEN we attempt to parse that URL as a PayID URL
    const invalidParsePayIdUrl = (): PayIdUrl => parsePayIdUrl(potentialUrl)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayIdUrl,
      Error,
      'PayID URLs must be either URL strings or URL objects.',
    )
  })

  it('Throws an error for an input with a non HTTP(S) protocol', function () {
    // GIVEN an FTP URL
    const potentialUrl = 'ftp://example.com'

    // WHEN we attempt to parse that URL as a PayID URL
    const invalidParsePayIdUrl = (): PayIdUrl => parsePayIdUrl(potentialUrl)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayIdUrl,
      Error,
      'Invalid URL protocol: "ftp:". PayID URLs must be HTTP/HTTPS.',
    )
  })

  it('Throws an error for an input with an invalid hostname', function () {
    // GIVEN an FTP URL
    const potentialUrl = 'http://example'

    // WHEN we attempt to parse that URL as a PayID URL
    const invalidParsePayIdUrl = (): PayIdUrl => parsePayIdUrl(potentialUrl)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayIdUrl,
      Error,
      'Hostname "example" is not a valid hostname.',
    )
  })
})
