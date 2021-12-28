module.exports = function(RED) {
    function ContractNode(n) {
        RED.nodes.createNode(this,n);
        this.address = n.address;
        this.ABI = JSON.parse(n.ABI);
        this.name = n.name;
    }
    RED.nodes.registerType("Contract",ContractNode);
}
