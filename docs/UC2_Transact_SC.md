# Use Case: Issue Transaction  

<a href="https://stromdao.de/" target="_blank" title="STROMDAO - Digital Energy Infrastructure"><img src="../static/stromdao.png" align="right" height="85px" hspace="30px" vspace="30px"></a>

Create a new ERC20 Token with a factory contract. Issue (mint) 20 tokens to the author.  

![Sample Output](../static/uc2_output.png)

## Prerequisites

In order to follow this description we are connecting to the Corrently Integration Blockchain and use a given Private Key. Even if we try to *refill* the ETHs from time to time, it might be that you could not pay for the transaction gas. In this case send a mail to dev@stromdao.com .

## Configuration / Setup

![Setup SmartContractTx Node](../static/uc2_setup1.png)

### Connection

![Setup DLTConnection Node](../static/uc2_setup2.png)

- rpcUrl: 'https://integration.corrently.io'
- Private Key: `0x6ADBfA3a9fdaA03Dc6E9Ab79D099053E11e7f614`

### Contract

![Setup Contract Node](../static/uc2_setup3.png)

The address of the deployed ERC-20 Token Factory is `0xBe96Ba6AF686dDB9D023a2E10BbF72663C6d9AA3`.

The ABI:
```javascript
[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "erc20",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lastSupply",
				"type": "uint256"
			}
		],
		"name": "Close",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "closeToken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "erc20",
				"type": "address"
			}
		],
		"name": "Create",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Mint",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "tokens",
		"outputs": [
			{
				"internalType": "contract GeneralToken",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
```

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
    "method": "mint",
    "args": [
        "0x164a52E0a2bca1c75A3997a7c5A2dbe0aB3e0fF3",
        20
    ]
}
```

If the method `mint` is called on the SmartContract deployed at  `0xBe96Ba6AF686dDB9D023a2E10BbF72663C6d9AA3` (is TokenFactory), the address given as first argument `0x164a52E0a2bca1c75A3997a7c5A2dbe0aB3e0fF3` will receive the number of tokens given in second argument (here 20).


## Flow

Available on [GIST](https://gist.github.com/zoernert/1a56ea5a0f59433fdf9b0e62da228f4c)
