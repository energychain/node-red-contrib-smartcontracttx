# Use Case: Call Method on SmartContract

<a href="https://stromdao.de/" target="_blank" title="STROMDAO - Digital Energy Infrastructure"><img src="../static/stromdao.png" align="right" height="85px" hspace="30px" vspace="30px"></a>

Retrieve the [USDT](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) total supply and return it in debug output.

![Sample Output](../static/uc1_output.png)

## Prerequisites

In order to reproduce this Use Case you need an RPC connection to the Ethereum Main Blockchain (Homestead). You could either setup a `geth` node on your computer and get it synced or register for an account on https://infura.io/ .

Sample RPC Url: https://mainnet.infura.io/v3/d254009fd63f4c2bb4596685c0b93d73

## Configuration / Setup

![Setup SmartContractTx Node](../static/uc1_setup1.png)

### Connection

![Setup DLTConnection Node](../static/uc1_setup2.png)

You do not have to specify a privateKey. A new one will be generated on first execution of the node.

### Contract

![Setup Contract Node](../static/uc1_setup3.png)

The address of the deployed ERC-20 Token is `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`. The ABI could be taken from [ethereumdev](https://ethereumdev.io/abi-for-erc20-contract-on-ethereum/)

### DID Resolver/Verifier

![Setup DIDResolver Node](../static/uc1_setup4.png)

We do not need any DIDResolver for this use-case so we could stick with the defaults:
- rpcUrl: `https://integration.corrently.io/`
- DID Registry: `0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335`
- ChainId: `6226`
- Chain Name: `mainnet`

### Inject

Last step is to modify the inject node. As `msg.payload` we specify that the method `totalSupply()` get called.

```javascript
{
    "method": "totalSupply"
}
```
