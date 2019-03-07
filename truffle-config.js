'use strict';

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 9545,
      gas: 5000000,
      gasPrice: 5e9,
      network_id: '*'
    },
    ropsten: {
      host: 'localhost',
      port: 18545,
      gas: 6000000,
      gasPrice: 15e9,
      network_id: '3'
    }
  }
};
