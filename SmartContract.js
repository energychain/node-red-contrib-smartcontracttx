const ethers = require("ethers");

module.exports = function(RED) {
    function SmartContractNode(config) {
        RED.nodes.createNode(this,config);
        this.connection = RED.nodes.getNode(config.Connection);
        this.contract = RED.nodes.getNode(config.Contract);
        const node = this;
        const storage = node.context();

        node.on('input', async function(msg) {
          const provider = new ethers.providers.JsonRpcProvider(node.connection.rpcUrl);
          const wallet = new ethers.Wallet(node.connection.privateKey,provider);
          const instance = new ethers.Contract(node.contract.address, node.contract.ABI, wallet);
          if((typeof msg.payload !== 'undefined') && (typeof msg.payload.method !== 'undefined')) {
            if(typeof msg.payload.args == 'undefined') msg.payload.args = [];
            let res = await instance[msg.payload.method].apply(this,msg.payload.args);
            node.send({payload:res});
          }
          node.status({fill:"green",shape:"dot",text:(ethers.utils.formatEther(await wallet.getBalance()) * 1).toFixed(4)+" ETH"});
        });
    }
    RED.nodes.registerType("SmartContract",SmartContractNode);
}
