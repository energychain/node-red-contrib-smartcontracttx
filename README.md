# node-red-contrib-smartcontracttx

<a href="https://stromdao.de/" target="_blank" title="STROMDAO - Digital Energy Infrastructure"><img src="./static/stromdao.png" align="right" height="85px" hspace="30px" vspace="30px"></a>

**Allows to run transactions on Ethereum based blockchains from within Node RED**

Call methods or run transactions using rpcUrl and ABI.

[![npm](https://img.shields.io/npm/dt/node-red-contrib-smartcontracttx.svg)](https://www.npmjs.com/package/node-red-contrib-smartcontracttx)
[![npm](https://img.shields.io/npm/v/node-red-contrib-smartcontracttx.svg)](https://www.npmjs.com/package/node-red-contrib-smartcontracttx)
[![CO2Offset](https://api.corrently.io/v2.0/ghgmanage/statusimg?host=node-red-contrib-smartcontracttx&svg=1)](https://co2offset.io/badge.html?host=node-red-contrib-smartcontracttx)

## Installation

Install using Node-RED Package Manager (Palett)

## Input (msg.payload)

In order to call a method of a SmartContract specify a JSON in `msg.payload` containing the method name as `method` and all required arguments in an array as `args`.
  
'''Javascript
{
  "method":"transfer",
  "args":["0x6B342cE1cb8671DDeeC57B62D78EB9333898d7da"]
}
'''

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
