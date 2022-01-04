# node-red-contrib-smartcontracttx

<a href="https://stromdao.de/" target="_blank" title="STROMDAO - Digital Energy Infrastructure"><img src="./static/stromdao.png" align="right" height="85px" hspace="30px" vspace="30px"></a>

**Allows to run transactions on Ethereum based blockchains from within Node RED**

Call methods or run transactions using rpcUrl and ABI of existing contract. Allows OffChain DID/VP signing and verification.

[![npm](https://img.shields.io/npm/dt/node-red-contrib-smartcontracttx.svg)](https://www.npmjs.com/package/node-red-contrib-smartcontracttx)
[![npm](https://img.shields.io/npm/v/node-red-contrib-smartcontracttx.svg)](https://www.npmjs.com/package/node-red-contrib-smartcontracttx)
[![CO2Offset](https://api.corrently.io/v2.0/ghgmanage/statusimg?host=node-red-contrib-smartcontracttx&svg=1)](https://co2offset.io/badge.html?host=node-red-contrib-smartcontracttx)[![Code Quality](https://api.codiga.io/project/30556/score/svg)](https://app.codiga.io/public/project/30556/node-red-contrib-smartcontracttx/dashboard)[![CircleCI](https://circleci.com/gh/energychain/node-red-contrib-smartcontracttx/tree/main.svg?style=svg)](https://circleci.com/gh/energychain/node-red-contrib-smartcontracttx/tree/main)

## Installation

Install using Node-RED Package Manager (Palett).

## Input - msg.payload

### OnChain - Transaction/Retrieve

In order to call a method of a SmartContract specify a JSON in `msg.payload` containing the method name as `method` and all required arguments in an array as `args`.

```javascript
{
  "method":"transfer",
  "args":["0x6B342cE1cb8671DDeeC57B62D78EB9333898d7da",20]
}
```

### OffChain - Present

To present a set of information (Object) signed to another party DID-VPs are used. In this case `msg.payload` must contain `presentTo` with the recipients publicKey (not address - [see here](https://ethereum.stackexchange.com/questions/13778/get-public-key-of-any-ethereum-account/79174) ) and `presentation` with the Data to crypt and sign.

```javascript
{
  "presentTo":"0x02eb74c1b28754e079ac138f0d1d73c0b9d82ba2a14ea3146f7f540e841ee43679",
  "presentation":{
    'Hello':'World',
    'TimeStamp': 1641166171599
  }
}
```

If `presentTo` is not specified the presentation itself will just be signed and not encrypted.

### Injection of unsecure values

If configuration option `Allow Insecure Inject` is set additional values might be specified in input `msg.payload` and will overwrite configured values:

```javascript
{
  ...
  "privateKey":"0x12356....",
  "contract":"0x123456...",
  "abi": [...],
  "rpcUrl": "https://integration.corrently.io/",
  ...
}
```

In case no privateKey is specified in either input msg.payload or configuration, a new privateKey gets generated.

## Output - msg.payload

For background compatibility all results are returned on `Output[0]`

`Output[1]` - OnChain Output. Returns results from method calls or transactions.

`Output[2]` - OffChain Output (JWT). Encrypted DID to be forwarded to other recipient.

`Output[3]` - OffChain Output. Presentations received and decoded.

## Cloudwallet support

Implementation allows to use [CloudWallet](https://rapidapi.com/stromdao-stromdao-default/api/cloudwallet) to persist received presentations/credentials or digital IDs via https://www.npmjs.com/package/cloudwallet

## Tutorials / Usecases

- [Call Method on SmartContract - ERC20 totalSupply](https://github.com/energychain/node-red-contrib-smartcontracttx/blob/main/docs/UC1_Call_Method.md)
- [Issue Transaction](https://github.com/energychain/node-red-contrib-smartcontracttx/blob/main/docs/UC2_Transact_SC.md)
- [Basic Verifiable Presentation](https://github.com/energychain/node-red-contrib-smartcontracttx/blob/main/docs/UC3_VP_Offchain.md)
- [Digital Freddy - Digital Heritage](https://github.com/energychain/node-red-contrib-smartcontracttx/blob/main/docs/UC4_VP_DigitalFreddy.md)

## Maintainer / Imprint

<addr>
STROMDAO GmbH  <br/>
Gerhard Weiser Ring 29  <br/>
69256 Mauer  <br/>
Germany  <br/>
  <br/>
+49 6226 968 009 0  <br/>
  <br/>
kontakt@stromdao.com  <br/>
  <br/>
Handelsregister: HRB 728691 (Amtsgericht Mannheim)
</addr>

Project Website: https://co2offset.io/

## LICENSE
[Apache-2.0](./LICENSE)
