module.exports = function(RED) {
    function ResolverNode(n) {
        RED.nodes.createNode(this,n);
        this.address = n.address;
        this.name = n.name;
        this.resolverRpcUrl = n.resolverRpcUrl;
        this.chainId = n.chainId;
        this.chainName = n.chainName;
    }
    RED.nodes.registerType("Resolver",ResolverNode);
}
