import 'mocha'
import { assert } from 'chai'

import { convertPayIdToUrl } from '../../src/convert'
import type { PayIdUrl } from '../../src/types'

describe('convertPayIdToUrl()', function (): void {
  it('Returns a PayID URL given a valid PayID', function () {
    // GIVEN a valid PayID
    const potentialPayId = 'alice$example.com'
    // AND our expected PayID URL
    const expectedPayIdUrl = new URL('https://example.com/alice')

    // WHEN we attempt to convert that PayID to a URL
    const payIdUrl = convertPayIdToUrl(potentialPayId)

    // THEN we get back our expected PayID URL
    assert.deepStrictEqual(payIdUrl, expectedPayIdUrl)
  })

  it('Throws an error for an invalid PayID', function () {
    // GIVEN an invalid PayID
    const potentialPayId = 'alice@example.com'

    // WHEN we attempt to convert that PayID to a URL
    const invalidParsePayIdUrl = (): PayIdUrl =>
      convertPayIdToUrl(potentialPayId)

    // THEN we throw an Error
    assert.throws(invalidParsePayIdUrl, Error)
  })
})
