import 'mocha'
import { assert } from 'chai'

import { convertPayStringToUrl } from '../../src/convert'
import type { PayStringUrl } from '../../src/types'

describe('convertPayStringToUrl()', function (): void {
  it('Returns a PayString URL given a valid PayString', function () {
    // GIVEN a valid PayString
    const potentialPayString = 'alice$example.com'
    // AND our expected PayString URL
    const expectedPayStringUrl = new URL('https://example.com/alice')

    // WHEN we attempt to convert that PayString to a URL
    const payStringUrl = convertPayStringToUrl(potentialPayString)

    // THEN we get back our expected PayString URL
    assert.deepStrictEqual(payStringUrl, expectedPayStringUrl)
  })

  it('Throws an error for an invalid PayString', function () {
    // GIVEN an invalid PayString
    const potentialPayString = 'alice@example.com'

    // WHEN we attempt to convert that PayString to a URL
    const invalidParsePayStringUrl = (): PayStringUrl =>
      convertPayStringToUrl(potentialPayString)

    // THEN we throw an Error
    assert.throws(invalidParsePayStringUrl, Error)
  })
})
