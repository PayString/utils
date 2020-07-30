import 'mocha'
import { assert } from 'chai'

import { convertUrlToPayId } from '../../src/convert'
import type { PayId } from '../../src/types'

describe('convertUrlToPayId()', function (): void {
  it('Returns a PayID string given a PayID URL string', function () {
    // GIVEN a valid HTTPS URL string
    const potentialUrl = 'https://example.com/alice'
    // AND our expected PayID
    const expectedPayId = 'alice$example.com'

    // WHEN we attempt to convert that URL to a PayID
    const payId = convertUrlToPayId(potentialUrl)

    // THEN we get back our expected PayID
    assert.strictEqual(payId, expectedPayId)
  })

  it('Returns a PayID string given a PayID URL object', function () {
    // GIVEN a valid HTTPS URL object
    const potentialUrl = new URL('https://example.com/alice')
    // AND our expected PayID
    const expectedPayId = 'alice$example.com'

    // WHEN we attempt to convert that URL to a PayID
    const payId = convertUrlToPayId(potentialUrl)

    // THEN we get back our expected PayID
    assert.strictEqual(payId, expectedPayId)
  })

  it('Throws an error for an invalid PayID URL', function () {
    // GIVEN an invalid PayID URL
    const potentialUrl = 'ftp://example'

    // WHEN we attempt to convert that URL to a PayID
    const invalidParsePayIdUrl = (): PayId => convertUrlToPayId(potentialUrl)

    // THEN we throw an Error
    assert.throws(invalidParsePayIdUrl, Error)
  })
})
