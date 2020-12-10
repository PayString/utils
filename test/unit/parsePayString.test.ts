import 'mocha'
import { assert } from 'chai'

import { parsePayString } from '../../src/parse'
import type { PayString } from '../../src/types'

describe('parsePayString()', function (): void {
  it('Returns a string given a valid PayString', function () {
    // GIVEN a valid PayString
    const potentialPayString = 'alice$example.com'

    // WHEN we attempt to parse that as a PayString
    const payString = parsePayString(potentialPayString)

    // THEN we get back our original input
    assert.strictEqual(payString, potentialPayString)
  })

  it('Returns a lowercased PayString given an uppercased PayString', function () {
    // GIVEN a PayString in UPPERCASE
    const potentialPayString = 'ALICE$EXAMPLE.COM'

    // WHEN we attempt to parse that as a PayString
    const payString = parsePayString(potentialPayString)

    // THEN we get back our original input
    assert.strictEqual(payString, potentialPayString.toLowerCase())
  })

  it('Handles a PayString with an embedded PayString', function () {
    // GIVEN a PayString with an embedded PayString
    const potentialPayString = 'alice$example.com$example.org'

    // WHEN we attempt to parse that as a PayString
    const payString = parsePayString(potentialPayString)

    // THEN we get back our original input
    assert.strictEqual(payString, potentialPayString)
  })

  it('Throws an error for an input that is not a string or URL', function () {
    // GIVEN a null value PayString
    const potentialPayString = null

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(invalidParsePayString, Error, 'PayStrings must be a string.')
  })

  it('Throws an error for a malformed PayString without a user', function () {
    // GIVEN a PayString without a user
    const potentialPayString = '$example.com'

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayString,
      Error,
      'A PayString must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  })

  it('Throws an error for a malformed PayString without a host', function () {
    // GIVEN a PayString without a host
    const potentialPayString = 'alice$'

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayString,
      Error,
      'A PayString must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  })

  it('Throws an error for a malformed PayString without a $', function () {
    // GIVEN a PayString without a $ indicating the distinction between user and host
    const potentialPayString = 'alice@example.com'

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayString,
      Error,
      'A PayString must have a user and a host, divided by a $ (e.g. alice$example.com).',
    )
  })

  it('Throws an error for a malformed PayString with a path in the user', function () {
    // GIVEN a malformed PayString with a path in the user
    const potentialPayString = 'users/alice$example.com'

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayString,
      Error,
      'A PayString string representation cannot include paths.',
    )
  })

  it('Throws an error for a malformed PayString with a path in the host', function () {
    // GIVEN a malformed PayString with a path in the host
    const potentialPayString = 'alice$example.com/users'

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayString,
      Error,
      'A PayString string representation cannot include paths.',
    )
  })

  it('Throws an error for a malformed PayString with an invalid host', function () {
    // GIVEN a malformed PayString with an invalid host
    const potentialPayString = 'alice$example'

    // WHEN we attempt to parse that as a PayString
    const invalidParsePayString = (): PayString =>
      parsePayString(potentialPayString)

    // THEN we throw an Error
    assert.throws(
      invalidParsePayString,
      Error,
      'Hostname "example" is not a valid hostname.',
    )
  })
})
