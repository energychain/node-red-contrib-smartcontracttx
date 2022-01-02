module.exports = function(node,config) {
  const ethers = require("ethers");

  const storage = node.context();

  async function input(msg) {
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
        if(typeof instance[msg.payload.method] == 'undefined') {
          console.log("Unable to find Method in Smart Contract",msg.payload.method,contractAddress);
        } else {
          let res = await instance[msg.payload.method].apply(this,msg.payload.args);
          node.send({payload:res});
        }
      } catch(e) {
        console.log(e);
      }
    }
    node.status({fill:"green",shape:"dot",text:(ethers.utils.formatEther(await wallet.getBalance()) * 1).toFixed(4)+" "});
  }

  return {
    input:input
  }
}
