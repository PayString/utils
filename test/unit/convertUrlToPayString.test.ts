import 'mocha'
import { assert } from 'chai'

import { convertUrlToPayString } from '../../src/convert'
import type { PayString } from '../../src/types'

describe('convertUrlToPayString()', function (): void {
  it('Returns a PayString string given a PayString URL string', function () {
    // GIVEN a valid HTTPS URL string
    const potentialUrl = 'https://example.com/alice'
    // AND our expected PayString
    const expectedPayString = 'alice$example.com'

    // WHEN we attempt to convert that URL to a PayString
    const payString = convertUrlToPayString(potentialUrl)

    // THEN we get back our expected PayString
    assert.strictEqual(payString, expectedPayString)
  })

  it('Returns a PayString string given a PayString URL object', function () {
    // GIVEN a valid HTTPS URL object
    const potentialUrl = new URL('https://example.com/alice')
    // AND our expected PayString
    const expectedPayString = 'alice$example.com'

    // WHEN we attempt to convert that URL to a PayString
    const payString = convertUrlToPayString(potentialUrl)

    // THEN we get back our expected PayString
    assert.strictEqual(payString, expectedPayString)
  })

  it('Throws an error for an invalid PayString URL', function () {
    // GIVEN an invalid PayString URL
    const potentialUrl = 'ftp://example'

    // WHEN we attempt to convert that URL to a PayString
    const invalidParsePayStringUrl = (): PayString =>
      convertUrlToPayString(potentialUrl)

    // THEN we throw an Error
    assert.throws(invalidParsePayStringUrl, Error)
  })
})
