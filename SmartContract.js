module.exports = function(RED) {
    function SmartContractNode(config) {
        RED.nodes.createNode(this,config);
        this.connection = RED.nodes.getNode(config.Connection);
        this.contract = RED.nodes.getNode(config.Contract);
        this.resolver = RED.nodes.getNode(config.Resolver);
        
        const node = this;

        const Lib = require("./lib.js");
        const lib = new Lib(node,config)

        node.on('input', function(msg) {
            lib.input(msg);
        });
    }
    RED.nodes.registerType("SmartContract",SmartContractNode);
}
