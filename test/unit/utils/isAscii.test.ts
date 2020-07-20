import 'mocha'
import { assert } from 'chai'

import { isAscii } from '../../../src/utils'

describe('isAscii()', function (): void {
  it('Returns true for a string that is all ASCII', function () {
    // GIVEN an ASCII string
    const asciiString = 'johndoe'

    // WHEN the string is determined to be ASCII
    const isStringAscii = isAscii(asciiString)

    // THEN we expect to get true back
    assert.strictEqual(isStringAscii, true)
  })

  it('Returns false for a string that contains non-ASCII characters', function () {
    // GIVEN an non-ASCII string
    const nonAsciiString = 'example.网络'

    // WHEN we see if the string is ASCII
    const isStringAscii = isAscii(nonAsciiString)

    // THEN we expect to get false back
    assert.strictEqual(isStringAscii, false)
  })
})
