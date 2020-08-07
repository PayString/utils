import 'mocha'

import { assert } from 'chai'
import { JWK, JWKECKey, JWKOctKey, JWKOKPKey, JWKRSAKey } from 'jose'

import IdentityKeySigningParams from '../../../src/verifiable/identity-key-signing-params'
import {
  getJwkFromFile,
  getSigningKeyFromFile,
} from '../../../src/verifiable/keys'
import ServerKeySigningParams from '../../../src/verifiable/server-key-signing-params'
import {
  certificateChainValidator,
  sign,
  signWithKeys,
  signWithServerKey,
  verifyPayId,
  verifySignedAddress,
} from '../../../src/verifiable/signatures'
import {
  Address,
  AddressDetailsType,
  CryptoAddressDetails,
} from '../../../src/verifiable/verifiable-payid'

import ECKey = JWK.ECKey
import RSAKey = JWK.RSAKey
import OctKey = JWK.OctKey
import OKPKey = JWK.OKPKey

describe('sign()', function () {
  const KEY_SIZE = 512
  const payId = 'alice$payid.example'
  const xrpAddress = 'rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6'
  const addressDetails: CryptoAddressDetails = {
    address: xrpAddress,
  }

  let address: Address

  beforeEach(function () {
    certificateChainValidator.addRootCertificateFile('test/certs/root.crt')
    address = {
      environment: 'TESTNET',
      paymentNetwork: 'XRPL',
      addressDetailsType: AddressDetailsType.CryptoAddress,
      addressDetails,
    }
  })

  it('Signed PayID returns JWS', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const params = new IdentityKeySigningParams(key, 'ES256K')
    const jws = sign(payId, address, params)

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('can be signed using using key from PEM with x5c', async function () {
    const certChain = await getJwkForCertChain()
    const privateKey = await getSigningKey()
    const jws = signWithServerKey(
      payId,
      address,
      new ServerKeySigningParams(privateKey, 'RS256', certChain),
    )

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'
    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('verification fails if server key and cert dont match', async function () {
    const certChain = await getJwkForCertChain()
    const fakeServerKey = await JWK.generate('RSA', KEY_SIZE)
    const jws = signWithServerKey(
      payId,
      address,
      new ServerKeySigningParams(fakeServerKey, 'RS256', certChain),
    )

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 1)
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('signs and verifies with using multiple signatures', async function () {
    const identityKey = await JWK.generate('EC', 'secp256k1')
    const x5c = await getJwkForCertChain()
    const serverKey = await getSigningKey()
    const jws = signWithKeys(payId, address, [
      new ServerKeySigningParams(serverKey, 'RS256', x5c),
      new IdentityKeySigningParams(identityKey, 'ES256K'),
    ])

    const expectedPayload =
      '{"payId":"alice$payid.example","payIdAddress":{"environment":"TESTNET","paymentNetwork":"XRPL","addressDetailsType":"CryptoAddressDetails","addressDetails":{"address":"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6"}}}'

    assert.equal(jws.payload, expectedPayload)
    assert.equal(jws.signatures.length, 2)
    assert.isTrue(verifySignedAddress(payId, jws))
  })

  it('cannot be verified if payload tampered with', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(
      payId,
      address,
      new IdentityKeySigningParams(key, 'ES256K'),
    )
    jws.payload = jws.payload.replace(xrpAddress, 'hackedXrpAdddress')
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('verification fails if payid does not match payload', async function () {
    const key = await JWK.generate('EC', 'secp256k1')
    const jws = sign(
      payId,
      address,
      new IdentityKeySigningParams(key, 'ES256K'),
    )
    assert.isFalse(verifySignedAddress('hacked$payid.example', jws))
  })

  it('verification fails for untrusted self-signed certificate', async function () {
    const jws = signWithServerKey(
      payId,
      address,
      new ServerKeySigningParams(
        await getSigningKeyFromFile('test/certs/self-signed.key'),
        'RS256',
        await getJwkFromFile('test/certs/self-signed.cert'),
      ),
    )
    // should validate if certificate chain validation is skipped
    assert.isTrue(verifySignedAddress(payId, jws, false))
    assert.isFalse(verifySignedAddress(payId, jws))
  })

  it('verifySignedAddress - verifies jws with multiple x5c', async function () {
    const jws = `{"payload":"{\\"payId\\":\\"alice$payid.example\\",\\"payIdAddress\\":{\\"environment\\":\\"TESTNET\\",\\"paymentNetwork\\":\\"XRPL\\",\\"addressDetailsType\\":\\"CryptoAddressDetails\\",\\"addressDetails\\":{\\"address\\":\\"rP3t3JStqWPYd8H88WfBYh3v84qqYzbHQ6\\"}}}","signatures":[{"protected":"eyJuYW1lIjoic2VydmVyS2V5IiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdLCJqd2siOnsiZSI6IkFRQUIiLCJuIjoieVFDU0FwdVRCX3BSclJyT1h6aVVTcElvZ0JlckZjM09ZTzVWR0tsYXFJWFBpQkt1LW0tT3lPZEJCclh6eHdCR1lJSWZIbnhjdVFlN3REU3FzY1p4M2w5NklPSFJUU3p3NXdaV0tlVjdfZzAydlJWNEtBS1Z2TkpiUlBON05tSjdiQkNsUWgyZEZkRmZNRlZtUk5NN3A2SlVGeGt0VHhhREEtY0ZkWVNxTDlBYXd5N0RXTUNXT1pGYjR4SXNHbDF3MGs0Z2tEQThYWHE4UHVQYURkXzRxRFVRdjExdWZxQU9kQU1YWDdudy1LV3k4QURGRWVtWnZVcHo5RkVaMk9hWUM3UFJ0NVMzNmR4aS1JajJpOTZuVE5xVmlrbXhrN24zWkE2NlVSbXRHc3RKSFNtRS1oZWs0YzU4Y0ZJbXZSSl9FaFN1QjlHWVRFajBKS2dOaHlKWnlRIiwia3R5IjoiUlNBIiwia2lkIjoiNmNuRDY1NURnXzRLZkphRVY1N3ZGYTV6UkEyT0FuWHBNQXlVbmpuaEpJcyIsIng1YyI6WyJNSUlGU0RDQ0JEQ2dBd0lCQWdJU0JFLzRzVlJSYTBkNVJYM0c1ZUFOUWhoQU1BMEdDU3FHU0liM0RRRUJDd1VBTUVveEN6QUpCZ05WQkFZVEFsVlRNUll3RkFZRFZRUUtFdzFNWlhRbmN5QkZibU55ZVhCME1TTXdJUVlEVlFRREV4cE1aWFFuY3lCRmJtTnllWEIwSUVGMWRHaHZjbWwwZVNCWU16QWVGdzB5TURBM01qQXlNVEEyTUROYUZ3MHlNREV3TVRneU1UQTJNRE5hTUJNeEVUQVBCZ05WQkFNVENIQmhlV2xrTG0xc01JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVFDU0FwdVRCL3BSclJyT1h6aVVTcElvZ0JlckZjM09ZTzVWR0tsYXFJWFBpQkt1K20rT3lPZEJCclh6eHdCR1lJSWZIbnhjdVFlN3REU3FzY1p4M2w5NklPSFJUU3p3NXdaV0tlVjcvZzAydlJWNEtBS1Z2TkpiUlBON05tSjdiQkNsUWgyZEZkRmZNRlZtUk5NN3A2SlVGeGt0VHhhREErY0ZkWVNxTDlBYXd5N0RXTUNXT1pGYjR4SXNHbDF3MGs0Z2tEQThYWHE4UHVQYURkLzRxRFVRdjExdWZxQU9kQU1YWDdudytLV3k4QURGRWVtWnZVcHo5RkVaMk9hWUM3UFJ0NVMzNmR4aStJajJpOTZuVE5xVmlrbXhrN24zWkE2NlVSbXRHc3RKSFNtRStoZWs0YzU4Y0ZJbXZSSi9FaFN1QjlHWVRFajBKS2dOaHlKWnlRSURBUUFCbzRJQ1hUQ0NBbGt3RGdZRFZSMFBBUUgvQkFRREFnV2dNQjBHQTFVZEpRUVdNQlFHQ0NzR0FRVUZCd01CQmdnckJnRUZCUWNEQWpBTUJnTlZIUk1CQWY4RUFqQUFNQjBHQTFVZERnUVdCQlJxMlNza3FiRVVtRG5Hc0ZmekdjMms1c3hSRFRBZkJnTlZIU01FR0RBV2dCU29TbXBqQkgzZHV1YlJPYmVtUldYdjg2anNvVEJ2QmdnckJnRUZCUWNCQVFSak1HRXdMZ1lJS3dZQkJRVUhNQUdHSW1oMGRIQTZMeTl2WTNOd0xtbHVkQzE0TXk1c1pYUnpaVzVqY25sd2RDNXZjbWN3THdZSUt3WUJCUVVITUFLR0kyaDBkSEE2THk5alpYSjBMbWx1ZEMxNE15NXNaWFJ6Wlc1amNubHdkQzV2Y21jdk1CTUdBMVVkRVFRTU1BcUNDSEJoZVdsa0xtMXNNRXdHQTFVZElBUkZNRU13Q0FZR1o0RU1BUUlCTURjR0N5c0dBUVFCZ3Q4VEFRRUJNQ2d3SmdZSUt3WUJCUVVIQWdFV0dtaDBkSEE2THk5amNITXViR1YwYzJWdVkzSjVjSFF1YjNKbk1JSUJCQVlLS3dZQkJBSFdlUUlFQWdTQjlRU0I4Z0R3QUhZQTV4THlzRGQrR21MN2pza01ZWVR4Nm5zM3kxWWRFU1piOCtEelMvSkJWRzRBQUFGemJrTXlMQUFBQkFNQVJ6QkZBaUIzVllqM2ExZThYQkJUa3QyREx3dG8rZWFGNGFYaWR3MnlIblpTY3NRRXhRSWhBSjZkMDRPV0ljaEdYRjdEdzBCcUxEVXFlWWpFQ3pPOTJ6STdqWHlsdkh2Q0FIWUFCN2RjRytWOWFQL3hzTVlkSXhYSHV1WlhmRmVVdDJydXZHRTZHbW5Ub2h3QUFBRnpia015VmdBQUJBTUFSekJGQWlFQXhFbC85b012S2x6WWFWMTQwWDJjUHhRd2h2WDJpOGs3MVZ4M29kZXdCSzRDSURzYVQrWFVxdU5xdS90SDVwRFBrMEVRSGViSUVScXpiVXVKMW9rTXVVZU5NQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUFqNUk3ZnZ0RkRhNnpsRHFMajJwYVVLMUpzYW9WSzFIMlJNVzY5YXdPbTNQV1laVG83RFF4cmNrenc0bjBlaElRb1V2UlpGT09BNmJKQmFKU1owaU9JY0hsNlhvVm1KZ0lEL2FHMDNDUHJYMWoreEkwMzdmMlBhOSs3QVpQNUE1Q1BrSWx2dnZQb1Z6cGM3eEZMRitWZHk1QThva1VlOTRobDhYKy80WjN6QXYyL0JaY3dENUxZWGxDK0YzQ09Yci9QNWFRVHFqOTlvWXU3ZlMzSHp2RENzOTlnM0dPQ28xWGgzWFg2UTVqZ1FtSTR0S1F0K1JPN0Z3cnhVTnFKWDg3WnNwNTF0azBGUS92NEEydE9kTHlnTzh2V2drR3J2NU1VZFprdUUvbm5SYWZYeTY3VWZWNFhYZ2F5YXAxTWRoeUcwaXh1SURWaXExTmk2eGpjeXVBZCIsIk1JSUVrakNDQTNxZ0F3SUJBZ0lRQ2dGQlFnQUFBVk9GYzJvTGhleW5DREFOQmdrcWhraUc5dzBCQVFzRkFEQS9NU1F3SWdZRFZRUUtFeHRFYVdkcGRHRnNJRk5wWjI1aGRIVnlaU0JVY25WemRDQkRieTR4RnpBVkJnTlZCQU1URGtSVFZDQlNiMjkwSUVOQklGZ3pNQjRYRFRFMk1ETXhOekUyTkRBME5sb1hEVEl4TURNeE56RTJOREEwTmxvd1NqRUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFV4bGRDZHpJRVZ1WTNKNWNIUXhJekFoQmdOVkJBTVRHa3hsZENkeklFVnVZM0o1Y0hRZ1FYVjBhRzl5YVhSNUlGZ3pNSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW5OTU04RnJsTGtlM2NsMDNnN05vWXpEcTF6VW1HU1hodmI0MThYQ1NMN2U0UzBFRnE2bWVOUWhZN0xFcXhHaUhDNlBqZGVUbTg2ZGljYnA1Z1dBZjE1R2FuL1BRZUdkeHlHa09sWkhQL3VhWjZXQThTTXgreWsxM0VpU2RSeHRhNjduc0hqY0FISnlzZTZjRjZzNUs2NzFCNVRhWXVjdjliVHlXYU44aktrS1FESVowWjhoL3BacTRVbUVVRXo5bDZZS0h5OXY2RGxiMmhvbnpoVCtYaHErdzNCcnZhdzJWRm4zRUs2QmxzcGtFTm5XQWE2eEs4eHVRU1hndm9wWlBLaUFsS1FUR2RNRFFNYzJQTVRpVkZycW9NN2hEOGJFZnd6Qi9vbmt4RXowdE52amovUEl6YXJrNU1jV3Z4STBOSFdRV002cjZoQ20yMUF2QTJIM0Rrd0lEQVFBQm80SUJmVENDQVhrd0VnWURWUjBUQVFIL0JBZ3dCZ0VCL3dJQkFEQU9CZ05WSFE4QkFmOEVCQU1DQVlZd2Z3WUlLd1lCQlFVSEFRRUVjekJ4TURJR0NDc0dBUVVGQnpBQmhpWm9kSFJ3T2k4dmFYTnlaeTUwY25WemRHbGtMbTlqYzNBdWFXUmxiblJ5ZFhOMExtTnZiVEE3QmdnckJnRUZCUWN3QW9ZdmFIUjBjRG92TDJGd2NITXVhV1JsYm5SeWRYTjBMbU52YlM5eWIyOTBjeTlrYzNSeWIyOTBZMkY0TXk1d04yTXdId1lEVlIwakJCZ3dGb0FVeEtleHBIc3NjZnJiNFV1UWRmL0VGV0NGaVJBd1ZBWURWUjBnQkUwd1N6QUlCZ1puZ1F3QkFnRXdQd1lMS3dZQkJBR0MzeE1CQVFFd01EQXVCZ2dyQmdFRkJRY0NBUllpYUhSMGNEb3ZMMk53Y3k1eWIyOTBMWGd4TG14bGRITmxibU55ZVhCMExtOXlaekE4QmdOVkhSOEVOVEF6TURHZ0w2QXRoaXRvZEhSd09pOHZZM0pzTG1sa1pXNTBjblZ6ZEM1amIyMHZSRk5VVWs5UFZFTkJXRE5EVWt3dVkzSnNNQjBHQTFVZERnUVdCQlNvU21wakJIM2R1dWJST2JlbVJXWHY4Nmpzb1RBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQTNUUFhFZk5qV0RqZEdCWDdDVlcrZGxhNWNFaWxhVWNuZThJa0NKTHhXaDlLRWlrM0pIUlJIR0pvdU0yVmNHZmw5NlM4VGloUnpadm9yb2VkNnRpNldxRUJtdHp3M1dvZGF0ZytWeU9lcGg0RVlwci8xd1hLdHg4L3dBcEl2SlN3dG1WaTRNRlU1YU1xclNERTZlYTczTWoydGNNeW81ak1kNmptZVdVSEs4c28vam9XVW9IT1Vnd3VYNFBvMVFZeiszZHN6a0RxTXA0ZmtseEJ3WFJzVzEwS1h6UE1UWitzT1BBdmV5eGluZG1qa1c4bEd5K1FzUmxHUGZaK0c2WjZoN21qZW0wWStpV2xrWWNWNFBJV0wxaXdCaThzYUNiR1M1ak4ycDhNK1grUTdVTktFa1JPYjNONktPcWtxbTU3VEgySDNlREpBa1NuaDYvRE5GdTBRZz09Il0sIng1dCI6Ino3QUpKOXNUUERvNEJ0Q3ZsN1U4T25pM3JPdyIsIng1dCNTMjU2IjoiVlVXQmNNRVltejU1Um9oWWxFYXpnemIxaFllRTVYVTc0cUJQR2cxZ0JhcyJ9fQ","signature":"c2N2Qe-iYnqsP5cr4f6Whx8Vc1wi1D6KgIawQk9m5-a0XCI_tXHzsxGyc01z2OCoH-P7apAxzEVpo11QBiPXaI3uHmHIS9nypQLqH61bVjH6P5cZXC-A_hWwNij65CrZKpwkUUPAOB1gVbbnS3yAyXyiXezvlHj_AMEKjvhXn4Okp3B2E0k_YgChlInvHw11x9DHxKouV_hb1bZT_pJKc74v4Z0l5i94bK4u8U22lZ6C25tBwH-BSg41bwdKiT29D9CDOhgUNc2saREo5T-BvwVvS_-92t_UBP5tso9c9sWpe871ShUaMK4jT1HT3NqHSTWde1q8MWIxIFBN3rVeow"}]}`

    assert.isTrue(verifySignedAddress('alice$payid.example', jws))
  })

  it('PayID with verifiedAddresses can be verified if valid', async function () {
    const json = `    
{
  "payId": "alice$foo",
  "addresses": [],
  "verifiedAddresses": [
    {
      "signatures" : [ 
        {
          "protected" : "eyJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdLCJraWQiOiJkMGFlNTllNi1iZDIwLTQ3NzYtOGMwMi0zYTYzMDYwYjU0NjkiLCJuYW1lIjoiaWRlbnRpdHlLZXkiLCJ0eXAiOiJKT1NFK0pTT04iLCJhbGciOiJFUzI1NksiLCJqd2siOnsia3R5IjoiRUMiLCJ1c2UiOiJzaWciLCJjcnYiOiJzZWNwMjU2azEiLCJraWQiOiJkMGFlNTllNi1iZDIwLTQ3NzYtOGMwMi0zYTYzMDYwYjU0NjkiLCJ4IjoiWkMzZDdzRS1BdDE2cEpBMUZ0bFg4dXJ3UWx3LWlUYW43M3RrazluZFo0VSIsInkiOiJBaUlab2tyU05qd2tYZ0FVNmJCY3Nrbnd1WFAyNGkycUdvU3EwZmU5Z09vIiwiYWxnIjoiRVMyNTZLIn19",
          "signature" : "AxpRFkNnymCFrOLPGsVBtJ3Re7oMhDKHEWLTlYyre0HKpfGJdEDzFDGKtud3dJUOL67A-IyKZMKT8MQSzDUeeg"
        } 
      ],
      "payload" : "{\\"payId\\":\\"alice$foo\\",\\"payIdAddress\\":{\\"paymentNetwork\\":\\"XRPL\\",\\"environment\\":\\"TESTNET\\",\\"addressDetailsType\\":\\"CryptoAddressDetails\\",\\"addressDetails\\":{\\"address\\":\\"123\\",\\"tag\\":\\"\\"}}}"
    }
  ]  
}`
    assert.isTrue(verifyPayId(json))
  })

  /**
   * Reads the default private key from the test pem file.
   *
   * @returns The JWK key for the private pem.
   */
  async function getSigningKey(): Promise<RSAKey | ECKey | OKPKey | OctKey> {
    return getSigningKeyFromFile('test/certs/server.key')
  }

  /**
   * Reads the default public key from the test cert file.
   *
   * @returns The JWK key for the public cert.
   */
  async function getJwkForCertChain(): Promise<
    JWKRSAKey | JWKECKey | JWKOKPKey | JWKOctKey
  > {
    return getJwkFromFile('test/certs/server.fullchain.crt')
  }
})
