import 'mocha'
import { assert } from 'chai'

import { parsePayStringUrl } from '../../src/parse'
import type { PayStringUrl } from '../../src/types'

describe('parsePayStringUrl()', function (): void {
  it('Returns a URL object given a valid HTTPS URL string', function () {
    // GIVEN a valid HTTPS URL string
    const potentialUrl = 'https://example.com/alice'

    // WHEN we attempt to parse that URL as a PayString URL
    const payStringUrl = parsePayStringUrl(potentialUrl)

    // THEN we get back a URL object
    assert.instanceOf(payStringUrl, URL)
  })

  it('Returns a URL object given a valid HTTP URL string', function () {
    // GIVEN a valid HTTPS URL string
    const potentialUrl = 'http://example.com/alice'

    // WHEN we attempt to parse that URL as a PayString URL
    const payStringUrl = parsePayStringUrl(potentialUrl)

    // THEN we get back a URL object
    assert.instanceOf(payStringUrl, URL)
  })

  it('Returns a URL object given a valid HTTPS URL', function () {
    // GIVEN a valid HTTPS URL
    const potentialUrl = new URL('https://example.com/alice')

    // WHEN we attempt to parse that URL as a PayString URL
    const payStringUrl = parsePayStringUrl(potentialUrl)

    // THEN we get back a URL object
    assert.instanceOf(payStringUrl, URL)
  })

  it('Throws an error for an input that is not a string or URL', function () {
    // GIVEN a null value URL
    const potentialUrl = null

    // WHEN we attempt to parse that URL as a PayString URL
    const invalidParsePayStringUrl = (): PayStringUrl =>
      parsePayStringUrl(potentialUrl)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayStringUrl,
      Error,
      'PayString URLs must be either URL strings or URL objects.',
    )
  })

  it('Throws an error for an input with a non HTTP(S) protocol', function () {
    // GIVEN an FTP URL
    const potentialUrl = 'ftp://example.com'

    // WHEN we attempt to parse that URL as a PayString URL
    const invalidParsePayStringUrl = (): PayStringUrl =>
      parsePayStringUrl(potentialUrl)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayStringUrl,
      Error,
      'Invalid URL protocol: "ftp:". PayString URLs must be HTTP/HTTPS.',
    )
  })

  it('Throws an error for an input with an invalid hostname', function () {
    // GIVEN an FTP URL
    const potentialUrl = 'http://example'

    // WHEN we attempt to parse that URL as a PayString URL
    const invalidParsePayStringUrl = (): PayStringUrl =>
      parsePayStringUrl(potentialUrl)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayStringUrl,
      Error,
      'Hostname "example" is not a valid hostname.',
    )
  })
})
