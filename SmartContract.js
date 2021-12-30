const ethers = require("ethers");

module.exports = function(RED) {
    function SmartContractNode(config) {
        RED.nodes.createNode(this,config);
        this.connection = RED.nodes.getNode(config.Connection);
        this.contract = RED.nodes.getNode(config.Contract);
        const node = this;
        const storage = node.context();

        node.on('input', async function(msg) {
          let privateKey = node.connection.privateKey
          let contractAddress = node.contract.address;
          let abi = node.contract.ABI;

          if(config.AllowInject) {
            if((typeof msg.payload !== 'undefined') && (msg.payload !== null)) {
              if(typeof msg.payload.privateKey !== 'undefined') privateKey = msg.payload.privateKey;
              if(typeof msg.payload.contract !== 'undefined') contractAddress = msg.payload.contract;
              if(typeof msg.payload.abi !== 'undefined') abi = msg.payload.abi;
            }
          }

          const provider = new ethers.providers.JsonRpcProvider(node.connection.rpcUrl);
          const wallet = new ethers.Wallet(privateKey,provider);
          const instance = new ethers.Contract(contractAddress, abi, wallet);
          if((typeof msg.payload !== 'undefined') && (typeof msg.payload.method !== 'undefined')) {
            if(typeof msg.payload.args == 'undefined') msg.payload.args = [];
            try {
              let res = await instance[msg.payload.method].apply(this,msg.payload.args);
              node.send({payload:res});
            } catch(e) {
              console.log(e);
            }
          }
          node.status({fill:"green",shape:"dot",text:(ethers.utils.formatEther(await wallet.getBalance()) * 1).toFixed(4)+" ETH"});
        });
    }
    RED.nodes.registerType("SmartContract",SmartContractNode);
}
