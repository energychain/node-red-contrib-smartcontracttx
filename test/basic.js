var assert = require('assert');
const Lib = require("../lib.js");
let kvstore = {};


describe('Core', function() {
  describe('Create Instance', function() {
      this.timeout(20000);
    it('DID-JWT Hello World', async () => {
      this.timeout(20000);
      let node = {
        connection:{
          rpcUrl:'https://integration.corrently.io/'
        },
        status:function(a) {
          kvstore['status',a];
        },
        contract:{},
        resolver:{
          resolverRpcUrl:'https://integration.corrently.io/',
          chainId:6226,
          address:'0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335',
          chainName:'mainnet'
        },
        send:function(a,b,c,d) {
          assert.equal(typeof a[3].payload, 'object');
          assert.equal(typeof a[3].signer, 'object');
          assert.equal(a[3].signer.blockchainAccountId, '0xc04b13580CCFca2aA4C65862C21829E8AB3a1803@eip155:1');
          assert.equal(a[3].signer.id, 'did:ethr:0x030e8b8727133a07b185c83aa68ce3e0917f13acd0012e8a963d01c3bdaafe7374#controller');
          assert.equal(a[3].issuer, 'did:ethr:0x030e8b8727133a07b185c83aa68ce3e0917f13acd0012e8a963d01c3bdaafe7374');
          assert.equal(typeof a[3].payload.presentation, 'object');
          assert.equal(a[3].payload.presentation.Hello, 'World');
        },
        context:function() {
          return {
            get:function(key) {
                return kvstore[key];
            },
            set:function(key,value) {
                kvstore[key] = value;
            }
          }
        }
      }
      let config = {
        noPubKeyRegistration:true
      };

      const lib = new Lib(node,config)
      assert.equal(typeof lib.input, 'function');
      let msg = {
        payload:'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE2NDEyNjM0NTYsInByZXNlbnRhdGlvbiI6eyJIZWxsbyI6IldvcmxkIn0sImlzcyI6ImRpZDpldGhyOjB4MDMwZThiODcyNzEzM2EwN2IxODVjODNhYTY4Y2UzZTA5MTdmMTNhY2QwMDEyZThhOTYzZDAxYzNiZGFhZmU3Mzc0In0.6GkXxHZ9TFVnpJzSvSHwP6QEz4D4k6Xre76qeLxIv0XIGHFDN17x3bULwkU_5Y-amLAF45BGOeZRR8JgEz1sIAE'
      }
      await lib.input(msg);
      return;
    });
    it('DLT SC Method Call', async () => {
      this.timeout(20000);
      let node = {
        connection:{
          rpcUrl:'https://integration.corrently.io/'
        },
        status:function(a) {
          kvstore['status',a];
        },
        contract:{
          address:'0xBe96Ba6AF686dDB9D023a2E10BbF72663C6d9AA3',
          ABI:[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
        },
        resolver:{
          resolverRpcUrl:'https://integration.corrently.io/',
          chainId:6226,
          address:'0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335',
          chainName:'mainnet'
        },
        send:function(a,b,c,d) {
          assert.equal(a[1].payload, '0x164a52E0a2bca1c75A3997a7c5A2dbe0aB3e0fF3');
        },
        context:function() {
          return {
            get:function(key) {
                return kvstore[key];
            },
            set:function(key,value) {
                kvstore[key] = value;
            }
          }
        }
      }
      let config = {
        noPubKeyRegistration:true
      };

      const lib = new Lib(node,config)

      let msg = {
        payload: {
          method:'owner'
        }
      };
      await lib.input(msg);
      return;
    });
  });
});
