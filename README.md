# `@payid-org/utils`

![NPM version badge](https://img.shields.io/npm/v/@payid-org/utils)

A TypeScript library providing PayID utility functions.

_This project is not associated with PayID operated by NPP Australia Ltd. People in Australia are prohibited from using this project. See below for more details._

## Usage

This library was designed to solve various pain points when implementing a PayID client or server.

```ts
import * as utils from '@payid-org/utils'

const payId = 'alice$example.com'

const payIdUrl = utils.convertPayIdToUrl(payId)

console.log(payIdUrl) // Logs 'example.com/alice'
```

### `parsePayId()`

Given an arbitrary input, return a string typed as a `PayId` if it is a valid PayID, and throw an error otherwise.

### `parsePayIdUrl()`

Given an arbitrary input, return a Node.js URL objet typed as a `PayIdUrl` if it is a valid PayID URL, and throw an error otherwise.

### `convertPayIdToUrl()`

Given an arbitrary string, return a PayID URL if the string was a valid PayID, and throw an error otherwise.

### `convertUrlToPayId()`

Given an arbitrary Node.js URL object or a string, return a PayID if the input was a valid PayID URL, and throw an error otherwise.

### `splitPayIdString()`

Given an arbitrary string, return the tuple of `[user, host]` of the PayID string.

```ts
const payId = 'alice$example.com'

splitPayIdString(payId)
// Returns ['alice', 'example.com']
```

## V.PayID

The [V.PayID RFC](https://github.com/payid-org/rfcs/blob/master/src/spec/self-sov-verifiable-payid-protocol.md]) defines
a method for signing and verifying PayID address mappings using cryptographic keys. The utils library provides several
functions related to V.PayID.

### `generateNewKey()`

Generates a new elliptic curve key in JWK format.

### `sign(key, address, signingParameters)`

Signs an address mapping using the provided key and signing parameters and returns a verified address object in
JWS format.

### `verify(paymentInfo)`

Verifies the signatures on `verifiedAddresses` in the provided `paymentInfo' object. Returns true if signatures
are valid, false if any are invalid.

### `verifySignedAddress(payId, verifiedAddress)`

Verifies that the signature on a specific `verifiedAddress` matches its PayID and embedded public key.

### `getJwkFromRecipient(signer)`

Gets the public JWK from a JWS recipient/signer on a verified address.

#### V.PayID Example

The following shows a complete example of using the utils library to generate a key, sign an address mapping
and construct a payment info object containing the verified/signed address, and lastly verifying the signature
of a signed PayId address.

```ts
import * as utils from '@payid-org/utils'

const payId = 'alice$payid.example'
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
const verifiedAddress = utils.sign(payId, address, signingParameters)

// build a PaymentInfo containing a verified address
const paymentInfo = {
  payId,
  verifiedAddresses: [verifiedAddress],
}

// pretty print the JSON representation.
// this is what the PayID server should return for PayID lookups.
console.log(JSON.stringify(paymentInfo, null, 2))

// verify signatures on all the verifiedAddresses in a PaymentInfo object.
utils.verifyPayId(paymentInfo)

// verify a specific verifiedAddress
utils.verifySignedAddress(payId, paymentInfo.verifiedAddresses[0])

// inspect the PaymentInfo for detail information on signatures
const inspector = new utils.PaymentInformationInspector()
inspector.inspect(paymentInfo)

// extract the public key for the first signature of the first verified address
utils.getJwkFromRecipient(paymentInfo.verifiedAddresses[0].signatures[0])
```

## Legal

By using, reproducing, or distributing this code, you agree to the terms and conditions for use (including the Limitation of Liability) in the [Apache License 2.0](https://github.com/payid-org/payid/blob/master/LICENSE). If you do not agree, you may not use, reproduce, or distribute the code. **This code is not authorised for download in Australia. Any persons located in Australia are expressly prohibited from downloading, using, reproducing or distributing the code.** This code is not owned by, or associated with, NPP Australia Limited, and has no sponsorship, affiliation or other connection with the “Pay ID” service operated by NPP Australia Limited in Australia.

```

```
