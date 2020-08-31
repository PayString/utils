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

## Legal

By using, reproducing, or distributing this code, you agree to the terms and conditions for use (including the Limitation of Liability) in the [Apache License 2.0](https://github.com/payid-org/payid/blob/master/LICENSE). If you do not agree, you may not use, reproduce, or distribute the code. **This code is not authorised for download in Australia. Any persons located in Australia are expressly prohibited from downloading, using, reproducing or distributing the code.** This code is not owned by, or associated with, NPP Australia Limited, and has no sponsorship, affiliation or other connection with the “Pay ID” service operated by NPP Australia Limited in Australia.

```

```
