module.exports = function(node,config) {
  const ethers = require("ethers");
  const EthrDID = require("ethr-did").EthrDID;
  const EthCrypto = require('eth-crypto');
  let errors = [];
  const _lib = this;

  _lib.sender = function(msgs) { console.log('No sender set!');};

  if((typeof node == 'undefined') || (node == null)) {
    node = {
      status: function() {

      },
      send:function(msgs) {
        _lib.sender(msgs);
      },
      connection: {
        rpcUrl: "https://integration.corrently.io/"
      },
      resolver: {
        resolverRpcUrl: "https://integration.corrently.io/",
        chainId: "6226",
        address:"0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335",
        chainName:"mainnet"
      },
      contract: {},
      context: function() {
        const persist = require('node-persist');
        return {
          get: async function(key) {
            if(typeof persist.values == 'undefined') await persist.init();
            return await persist.getItem(key);
          },
          set: async function(key,value) {
            if(typeof persist.values == 'undefined') await persist.init();
            return await persist.setItem(key,value);
          }
        }
      }
    }
    if((typeof config !== 'undefined') && (config !== null)) {
      if(typeof config.connection !== 'undefined') node.connection = config.connection;
      if(typeof config.contract !== 'undefined') node.contract = config.contract;
    }
  }
  if((typeof config == 'undefined') || (config == null)) {
    config = {};
  }
  const storage = node.context();


  this.initFinished = false;

  async function load(msg) {
    if(_lib.initFinished) return;
    else {
      _lib.initFinished=true;
      let keys = await storage.get("keys");

      if((typeof keys !== 'undefined') && (keys !== null) && (typeof config.rapidAPIkey !== 'undefined') && (config.rapidAPIkey !== null) && (config.rapidAPIkey.length >10)) {
        const Cloudwallet = require("cloudwallet");
        const cloudwallet = new Cloudwallet(config.rapidAPIkey,keys.privateKey,keys.identifier);
        let presentations = await cloudwallet.get('presentations');
        if((typeof presentations !== 'undefined') && (presentations !== null)) {
          await storage.set('presentations',presentations);
        }
      }
    }
  }

  async function input(msg) {
    let privateKey = node.connection.privateKey
    let contractAddress = node.contract.address;
    let abi = node.contract.ABI;
    let rpcUrl = node.connection.rpcUrl;
    let keys = {};

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
      keys = keypair;
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey,provider);

    const getPublicKey = async function(address) {
      try {
        const rabi = [{"inputs":[{"internalType":"string","name":"_value","type":"string"}],"name":"register","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"values","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
        const instance = new ethers.Contract('0x511b0650AcFf75c75Cd1a52229C8877D1cCFD6f8', rabi, wallet);
        let res = await instance.values(address);
        return res;
      } catch(e) {
        errors.push('Unable to do PublicKey Lookup - Maybe not on corrently Blockchain?')
        return;
      }
    }

    const setPublicKey = async function(publicKey) {
      if(typeof config.noPubKeyRegistration !== 'undefined') return;

      try {
        const rabi = [{"inputs":[{"internalType":"string","name":"_value","type":"string"}],"name":"register","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"values","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
        const instance = new ethers.Contract('0x511b0650AcFf75c75Cd1a52229C8877D1cCFD6f8', rabi, wallet);
        await instance.register(publicKey);
      } catch(e) {
        errors.push('Unable to register public Key - Maybe not on corrently Blockchain');
        errors.push(e.reason);
      }
    }

    // Register our public key if it was not confirmed registered
    if((typeof keys.registered == 'undefined') && (typeof keys.publicKey !== 'undefined') && (typeof keys.address !== 'undefined')) {
      let lookup = await getPublicKey(keys.address);
      if(lookup !== keys.publicKey) {
        setPublicKey(keys.publicKey);
      } else {
        keys.registered = new Date().getTime();
        await storage.set("keys",keys);
      }
    }

    // Identify OnChain call if method is defined
    if((typeof msg.payload !== 'undefined') && (typeof msg.payload.method !== 'undefined')) {
        const instance = new ethers.Contract(contractAddress, abi, wallet);

          if(typeof msg.payload.args == 'undefined') msg.payload.args = [];
          try {
            if(typeof instance[msg.payload.method] == 'undefined') {
              errors.push("Unable to find Method in Smart Contract:"+msg.payload.method,contractAddress);
            } else {
              let res = await instance[msg.payload.method].apply(this,msg.payload.args);
              node.send([{payload:res},{payload:res},null,null]);
            }
          } catch(e) {
            if(config.RetryTX) {
              let txq = await storage.get("txq");
              if((typeof txq == 'undefined') || (txq == null)) {
                txq = [];
              }
              txq.push(msg);
              await storage.set("txq",txq);
                errors.push("Retry failed tx:"+e.reason);
              if(typeof _lib.interval == 'undefined') {
                  _lib.interval = setInterval(async function() {
                    let txs = await storage.get("txq");
                    if((typeof txs !== 'undefined') && (txs !== null) && (txs.length >0)) {
                      let msg = txs.pop();
                      await storage.set("txq",txs);
                      input(msg);
                    } else {
                      clearInterval(_lib.interval);
                      delete _lib.interval;
                    }
                  },60000);
              }
            } else {
                errors.push("Error creating OnChain call/transaction");
                errors.push(e.reason);
            }
          }
    }


    // OffChain presentation encode
    if(
       (typeof msg.payload !== 'undefined') &&
        (typeof msg.payload.presentation !== 'undefined')
      ) {
      async function encryptValue(publicKey,value) {
          if(publicKey.length < 50) {
            publicKey = await getPublicKey(publicKey);
          }
          if(publicKey.substr(0,9) == 'did:ethr:') publicKey = publicKey.substr(9);

          if(publicKey.substr(0,2) == '0x') publicKey = publicKey.substr(2);
          if(typeof value == 'object') {
            value = JSON.stringify(value);
          }
          let unstring = await EthCrypto.encryptWithPublicKey(publicKey,value);
          return EthCrypto.cipher.stringify(unstring);
      }

      if(typeof keys.identifier == 'undefined') keys.identifier = wallet.address;
      if(typeof keys.privateKey == 'undefined') keys.privateKey = privateKey;
      if(typeof keys.publicKey == 'undefined') keys.publicKey = await EthCrypto.publicKeyByPrivateKey(privateKey);

      try {
        const ethrDid = new EthrDID(keys);
        let data = {
          presentation:msg.payload.presentation
        }
        if(typeof msg.payload.presentTo !== 'undefined') {
          let innerDid = await ethrDid.signJWT(data);

          data = {
            _presentation: await encryptValue(msg.payload.presentTo,innerDid),
            recipient:msg.payload.presentTo
          }
        }
        if(typeof keys.publicKey == 'undefined') {
          data.signerPublicKey = keys.publicKey;
        }
        let presentation = {
          payload:await ethrDid.signJWT(data)
        }

        if(typeof msg.payload.presentTo !== 'undefined') {
          presentation.presentTo = msg.payload.presentTo;
        }

        node.send([{payload:presentation},null,presentation,null]);
      } catch (e) {
          errors.push("Error creating Presentation");
          errors.push(e);
      }
    }

    // Handle Presentations received (decode)
    if( (
          (typeof msg.payload == 'string') &&
          (msg.payload.substr(0,2) == 'ey') &&
          (typeof node.resolver !== 'undefined')
        ) ||
        (
          (typeof msg.payload.jwt !== 'undefined') &&
          (typeof node.resolver !== 'undefined')
        )
      ){
      // We might get all we need from configuration!
      if(typeof msg.payload.jwt !== 'undefined') {
        msg.payload = msg.payload.jwt;
      }
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
                errors.push('Decrypt failed');
                errors.push(e);
              unstring = { payload:{} };
          }
          return unstring;
      }

      try {
        if(typeof keys.identifier == 'undefined') keys.identifier = wallet.address;
        if(typeof keys.privateKey == 'undefined') keys.privateKey = privateKey;

          msg._jwt = msg.payload;

          const ethrDid = new EthrDID({
            identifier:keys.identifier,
            privateKey: keys.privateKey,
            rpcUrl:node.resolver.resolverRpcUrl,
            chainId:node.resolver.chainId,
            registry:node.resolver.address
          });

          const Resolver = require('did-resolver').Resolver;
          const getResolver = require('ethr-did-resolver').getResolver;
          const didResolver = new Resolver(getResolver({
              identifier:keys.identifier,
              privateKey: keys.privateKey,
              rpcUrl:node.resolver.resolverRpcUrl,
              chainId:1*node.resolver.chainId,
              name:node.resolver.chainName,
              registry:node.resolver.address
            }));
          msg.payload = await ethrDid.verifyJWT(msg.payload,didResolver);
          msg.signer = msg.payload.signer;
          msg.issuer = msg.payload.issuer;
          if(typeof msg.payload.payload._presentation !== 'undefined') {
            msg.payload.jwt = await decryptValue(privateKey,msg.payload.payload._presentation);
            msg.payload.presentation = (await ethrDid.verifyJWT(msg.payload.jwt,didResolver)).payload.presentation;
          } else {
            msg.payload.presentation = msg.payload.payload.presentation;
          }
          delete msg.payload.payload;
          let presentations = await storage.get("presentations");
          if((typeof presentations == 'undefined') || (presentations == null)) presentations = {};
          msg.payload.hash = ethers.utils.id(msg.issuer + '@' + JSON.stringify(msg.payload.presentation));
          presentations[msg.payload.hash]=msg;
          await storage.set("presentations",presentations);
          if((typeof config.rapidAPIkey !== 'undefined') && (config.rapidAPIkey !== null) && (config.rapidAPIkey.length >10)) {
            const Cloudwallet = require("cloudwallet");
            const cloudwallet = new Cloudwallet(config.rapidAPIkey,keys.privateKey,keys.identifier);
            await cloudwallet.set("presentations",presentations);
          }
          let doSend = true;

          if((typeof config.pps !== 'undefined') && (config.pps !== null) && (config.pps.length>6)) {
            try {
              const axios = require("axios");
              const ethrDid = new EthrDID(keys);
              msg.payload.presentation._issuer = msg.issuer;
              let responds = await axios.post(config.pps,{did:await ethrDid.signJWT(msg.payload)});
              if(typeof responds.data['_action'] !== 'undefined') {
                if(responds.data['_action'] == 'inject') {
                  input({payload:responds.data});
                  doSend = false;
                } else
                if(responds.data['_action'] == 'drop') {
                  doSend = false;
                }
              }
              msg.payload = responds.data;
            } catch(e) {
                errors.push("Error in Presentation Processing Service");
                errors.push(e);
            }
          }
          if(doSend) {
            node.send([msg,null,null,msg]);
          }
       } catch(e) {
           errors.push("Error resolving Presentation, forwarding");
         msg.payload = msg._jwt;
         node.send([msg,null,msg,null])
       }
    }

    let balance = await wallet.getBalance();
    let fill = 'green';
    if(balance < 100000) fill = 'yellow';
    if(balance < 10000) fill = 'red';
    node.status({fill:fill,shape:"dot",text:wallet.address.substr(0,15) + "... ("+ethers.utils.formatEther(balance)+")"});
    if(typeof config.consoleErrors !== 'undefined') {
      console.error(errors);
      errors = [];
    }
    return;
  }

  return {
    input:input,
    load:load,
    errors:errors,
    setSender:function(fct) {
      _lib.sender = fct;
    }
  }
}
