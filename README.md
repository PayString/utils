# `@paystring/utils`

![NPM version badge](https://img.shields.io/npm/v/@paystring/utils)

A TypeScript library providing PayString utility functions.

## Usage

This library was designed to solve various pain points when implementing a PayString client or server.

```ts
import * as utils from '@paystring/utils'

const payString = 'alice$example.com'

const payStringUrl = utils.convertPayStringToUrl(payString)

console.log(payStringUrl) // Logs 'example.com/alice'
```

### `parsePayString()`

Given an arbitrary input, return a string typed as a `PayString` if it is a valid PayString, and throw an error otherwise.

### `parsePayStringUrl()`

Given an arbitrary input, return a Node.js URL objet typed as a `PayStringUrl` if it is a valid PayString URL, and throw an error otherwise.

### `convertPayStringToUrl()`

Given an arbitrary string, return a PayString URL if the string was a valid PayString, and throw an error otherwise.

### `convertUrlToPayString()`

Given an arbitrary Node.js URL object or a string, return a PayString if the input was a valid PayString URL, and throw an error otherwise.

### `splitPayString()`

Given an arbitrary string, return the tuple of `[user, host]` of the PayString string.

```ts
const payString = 'alice$example.com'

splitPayString(payString)
// Returns ['alice', 'example.com']
```

## V.PayString

The [V.PayString RFC](https://github.com/PayString/rfcs/blob/master/src/spec/self-sov-verifiable-payid-protocol.md]) defines
a method for signing and verifying PayString address mappings using cryptographic keys. The utils library provides several
functions related to V.PayString.

### `generateNewKey()`

Generates a new elliptic curve key in JWK format.

### `sign(key, address, signingParameters)`

Signs an address mapping using the provided key and signing parameters and returns a verified address object in
JWS format.

### `verify(paymentInfo)`

Verifies the signatures on `verifiedAddresses` in the provided `paymentInfo' object. Returns true if signatures
are valid, false if any are invalid.

### `verifySignedAddress(payString, verifiedAddress)`

Verifies that the signature on a specific `verifiedAddress` matches its PayString and embedded public key.

### `getJwkFromRecipient(signer)`

Gets the public JWK from a JWS recipient/signer on a verified address.

#### V.PayString Example

The following shows a complete example of using the utils library to generate a key, sign an address mapping
and construct a payment info object containing the verified/signed address, and lastly verifying the signature
of a signed PayString address.

```ts
import * as utils from '@paystring/utils'

const payString = 'alice$payString.example'
const address = {
  environment: 'TESTNET',
  paymentNetwork: 'XRPL',
  addressDetailsType: {
    address: 'rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6',
  },
}

// create a signing key
const key = await utils.generateNewKey()

const signingParameters = new utils.IdentityKeySigningParams(
  key,
  utils.getDefaultAlgorithm(key),
)

// generate a signed/verified address using the signing key
const verifiedAddress = utils.sign(payString, address, signingParameters)

// build a PaymentInfo containing a verified address
const paymentInfo = {
  payString,
  verifiedAddresses: [verifiedAddress],
}

// pretty print the JSON representation.
// this is what the PayString server should return for PayString lookups.
console.log(JSON.stringify(paymentInfo, null, 2))

// verify signatures on all the verifiedAddresses in a PaymentInfo object.
utils.verifyPayString(paymentInfo)

// verify a specific verifiedAddress
utils.verifySignedAddress(payString, paymentInfo.verifiedAddresses[0])

// inspect the PaymentInfo for detail information on signatures
const inspector = new utils.PaymentInformationInspector()
inspector.inspect(paymentInfo)

// extract the public key for the first signature of the first verified address
utils.getJwkFromRecipient(paymentInfo.verifiedAddresses[0].signatures[0])
```

## Legal

By using, reproducing, or distributing this code, you agree to the terms and conditions for use (including the Limitation of Liability) in the [Apache License 2.0](https://github.com/PayString/payString/blob/master/LICENSE). If you do not agree, you may not use, reproduce, or distribute the code. **This code is not authorised for download in Australia. Any persons located in Australia are expressly prohibited from downloading, using, reproducing or distributing the code.**

```

```
