import 'mocha'
import { assert } from 'chai'

import { isValidUrl } from '../../../src/utils'

describe('isValidUrl()', function (): void {
  it('Returns true for a string that is a valid URL', function () {
    // GIVEN a valid URL string
    const validUrl = 'https://example.com'

    // WHEN we see if the URL string is a valid URL
    const isUrlValid = isValidUrl(validUrl)

    // THEN we expect to get true back
    assert.strictEqual(isUrlValid, true)
  })

  it('Returns false for a URL without a protocol', async function () {
    // GIVEN an URL without a protocol
    const invalidUrl = 'example.com'

    // WHEN we see if the string is a valid URL
    const isUrlValid = isValidUrl(invalidUrl)

    // THEN we expect to get false back
    assert.strictEqual(isUrlValid, false)
  })

  it('Returns false for a URL without a TLD', async function () {
    // GIVEN an URL without a TLD
    const invalidUrl = 'https://example'

    // WHEN we see if the string is a valid URL
    const isUrlValid = isValidUrl(invalidUrl)

    // THEN we expect to get false back
    assert.strictEqual(isUrlValid, false)
  })
})
