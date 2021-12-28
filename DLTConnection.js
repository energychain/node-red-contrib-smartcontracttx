module.exports = function(RED) {
    function DLTConnectionNode(n) {
        RED.nodes.createNode(this,n);
        this.rpcUrl = n.rpcUrl;
        this.privateKey = n.privateKey;
        this.name = n.name;
    }
    RED.nodes.registerType("DLTConnection",DLTConnectionNode);
}
