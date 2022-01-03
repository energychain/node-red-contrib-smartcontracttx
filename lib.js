module.exports = function(node,config) {
  const ethers = require("ethers");
  const EthrDID = require("ethr-did").EthrDID;
  const EthCrypto = require('eth-crypto');

  const storage = node.context();

  async function input(msg) {
    let privateKey = node.connection.privateKey
    let contractAddress = node.contract.address;
    let abi = node.contract.ABI;
    let rpcUrl = node.connection.rpcUrl;

    if(config.AllowInject) {
      if((typeof msg.payload !== 'undefined') && (msg.payload !== null)) {
        if(typeof msg.payload.privateKey !== 'undefined') privateKey = msg.payload.privateKey;
        if(typeof msg.payload.contract !== 'undefined') contractAddress = msg.payload.contract;
        if(typeof msg.payload.abi !== 'undefined') abi = msg.payload.abi;
        if(typeof msg.payload.rpcUrl !== 'undefined') rpcUrl = msg.payload.rpcUrl;
      }
    }

    // tiny Key-Management
    if((typeof privateKey == 'undefined') || (privateKey == null) || (privateKey.length !==  66)) {
      let keypair = await storage.get("keys");
      if((typeof keypair == 'undefined')||(keypair == null)) {
        keypair = EthrDID.createKeyPair();
        keypair.id = "did:ethr:"+keypair.identifier;
        await storage.set("keys",keypair);
      }
      privateKey = keypair.privateKey;
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey,provider);

    // Identify OnChain call if method is defined
    if((typeof msg.payload !== 'undefined') && (typeof msg.payload.method !== 'undefined')) {
        const instance = new ethers.Contract(contractAddress, abi, wallet);

          if(typeof msg.payload.args == 'undefined') msg.payload.args = [];
          try {
            if(typeof instance[msg.payload.method] == 'undefined') {
              console.log("Unable to find Method in Smart Contract",msg.payload.method,contractAddress);
            } else {
              let res = await instance[msg.payload.method].apply(this,msg.payload.args);
              node.send([{payload:res},{payload:res},null,null]);
            }
          } catch(e) {
            console.error("Error creating OnChain call/transaction");
            console.log(e);
          }
    }


    // OffChain presentation encode
    if((typeof msg.payload !== 'undefined') && (typeof msg.payload.presentation !== 'undefined')) {
      async function encryptValue(publicKey,value) {
          if(publicKey.substr(0,9) == 'did:ethr:') publicKey = publicKey.substr(9);

          if(publicKey.substr(0,2) == '0x') publicKey = publicKey.substr(2);
          if(typeof value == 'object') {
            value = JSON.stringify(value);
          }
          let unstring = await EthCrypto.encryptWithPublicKey(publicKey,value);
          return EthCrypto.cipher.stringify(unstring);
      }


      let keypair = {
        identifier: wallet.address,
        privateKey: privateKey,
      }
      try {
        const ethrDid = new EthrDID(keypair);
        let data = {
          presentation:msg.payload.presentation
        }
        if(typeof msg.payload.presentTo !== 'undefined') {
          data = {
            _presentation: await encryptValue(msg.payload.presentTo,msg.payload.presentation)
          }
        }
        let presentation = await ethrDid.signJWT(data);

        node.send([{payload:presentation},null,{payload:presentation},null]);
      } catch (e) {
        console.error("Error creating Presentation");
        console.log(e);
      }
    }

    // Handle Presentations received (decode)
    if((typeof msg.payload == 'string') && (msg.payload.substr(0,2) == 'ey') && (typeof node.resolver !== 'undefined')) {
      // We might get all we need from configuration!

      async function decryptValue(privateKey,value) {
          let unstring = EthCrypto.cipher.parse(value);
          try {
              if(privateKey.substr(0,2) == '0x') privateKey = privateKey.substr(2);
              unstring = await EthCrypto.decryptWithPrivateKey(privateKey,value);
              if(unstring.substr(0,1) == "{") {
                try {
                    unstring = JSON.parse(unstring);
                } catch(e) {

                }
              }
          } catch(e) {
              console.error('Decrypt failed');
              console.log(e);
              unstring = { payload:{} };
          }
          return unstring;
      }

      try {
          let keypair = {
            identifier: wallet.address,
            privateKey: privateKey,
          }
          msg._jwt = msg.payload;

          const ethrDid = new EthrDID({
            identifier:keypair.identifier,
            privateKey: keypair.privateKey,
            rpcUrl:node.resolver.resolverRpcUrl,
            chainId:node.resolver.chainId,
            registry:node.resolver.address
          });

          const Resolver = require('did-resolver').Resolver;
          const getResolver = require('ethr-did-resolver').getResolver;
          const didResolver = new Resolver(getResolver({
              identifier:keypair.identifier,
              privateKey: keypair.privateKey,
              rpcUrl:node.resolver.resolverRpcUrl,
              chainId:1*node.resolver.chainId,
              name:node.resolver.chainName,
              registry:node.resolver.address
            }));
          msg.payload = await ethrDid.verifyJWT(msg.payload,didResolver);
          msg.signer = msg.payload.signer;
          msg.issuer = msg.payload.issuer;
          if(typeof msg.payload.payload._presentation !== 'undefined') {
            msg.payload = await decryptValue(privateKey,msg.payload.payload._presentation);
          } else {
            msg.payload = msg.payload.payload.presentation;
          }
          node.send([msg,null,null,msg]);
       } catch(e) {
         console.error("Error resolving Presentation");
         console.log(e);
       }
    }

    node.status({fill:"green",shape:"dot",text:wallet.address});
  }

  return {
    input:input
  }
}
