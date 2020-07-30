import 'mocha'
import { assert } from 'chai'

import { parsePayId } from '../../src/parse'
import type { PayId } from '../../src/types'

describe('parsePayId()', function (): void {
  it('Returns a string given a valid PayID', function () {
    // GIVEN a valid PayID
    const potentialPayId = 'alice$example.com'

    // WHEN we attempt to parse that as a PayID
    const payId = parsePayId(potentialPayId)

    // THEN we get back our original input
    assert.strictEqual(payId, potentialPayId)
  })

  it('Returns a lowercased PayID given an uppercased PayID', function () {
    // GIVEN a PayID in UPPERCASE
    const potentialPayId = 'ALICE$EXAMPLE.COM'

    // WHEN we attempt to parse that as a PayID
    const payId = parsePayId(potentialPayId)

    // THEN we get back our original input
    assert.strictEqual(payId, potentialPayId.toLowerCase())
  })

  it('Handles a PayID with an embedded PayID', function () {
    // GIVEN a PayID with an embedded PayID
    const potentialPayId = 'alice$example.com$example.org'

    // WHEN we attempt to parse that as a PayID
    const payId = parsePayId(potentialPayId)

    // THEN we get back our original input
    assert.strictEqual(payId, potentialPayId)
  })

  it('Throws an error for an input that is not a string or URL', function () {
    // GIVEN a null value PayID
    const potentialPayId = null

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(invalidParsePayId, Error, 'PayIDs must be a string.')
  })

  it('Throws an error for a malformed PayID without a user', function () {
    // GIVEN a PayID without a user
    const potentialPayId = '$example.com'

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayId,
      Error,
      'A PayID must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  })

  it('Throws an error for a malformed PayID without a host', function () {
    // GIVEN a PayID without a host
    const potentialPayId = 'alice$'

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayId,
      Error,
      'A PayID must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  })

  it('Throws an error for a malformed PayID without a $', function () {
    // GIVEN a PayID without a $ indicating the distinction between user and host
    const potentialPayId = 'alice@example.com'

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayId,
      Error,
      'A PayID must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  })

  it('Throws an error for a malformed PayID with a path in the user', function () {
    // GIVEN a malformed PayID with a path in the user
    const potentialPayId = 'users/alice$example.com'

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayId,
      Error,
      'A PayID string representation cannot include paths.',
    )
  })

  it('Throws an error for a malformed PayID with a path in the host', function () {
    // GIVEN a malformed PayID with a path in the host
    const potentialPayId = 'alice$example.com/users'

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayId,
      Error,
      'A PayID string representation cannot include paths.',
    )
  })

  it('Throws an error for a malformed PayID with an invalid host', function () {
    // GIVEN a malformed PayID with an invalid host
    const potentialPayId = 'alice$example'

    // WHEN we attempt to parse that as a PayID
    const invalidParsePayId = (): PayId => parsePayId(potentialPayId)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayId,
      Error,
      'Hostname "example" is not a valid hostname.',
    )
  })
})
