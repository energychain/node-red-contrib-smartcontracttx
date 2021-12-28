const ethers = require("ethers");

const app = async function() {
  const privateKey = '0x2e327e65844f634a5a061b846874aadde013085ad0e08eec7a6996604bf09aab';
  const rpcUrl = 'https://integration.corrently.io/'

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey,provider);

  const contract = '0x6B342cE1cb8671DDeeC57B62D78EB9333898d7da';

  const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "ledgers",
		"outputs": [
			{
				"internalType": "contract espledger",
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
				"name": "from",
				"type": "address"
			},
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
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
  const instance = new ethers.Contract(contract, abi, wallet);

  let res = await instance.transfer(contract,'0x164a52E0a2bca1c75A3997a7c5A2dbe0aB3e0fF3',20);
  console.log(abi);
  console.log(await wallet.getBalance());
}
app();
