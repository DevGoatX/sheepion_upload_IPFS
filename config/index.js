
const isTestNet = process.env.NODE_ENV !== 'production';

const rinkebyContracts = {
  nft: '0x952309485dc3981855fbF92B17ED08E2fb7dbb05',
  sales: '0x58e6aCCfDf934EEb5C8910421Cfc8FF95D1F5968'
};

const mainNetContracts = {
  nft: '0x952309485dc3981855fbF92B17ED08E2fb7dbb05',
  sales: '0x58e6aCCfDf934EEb5C8910421Cfc8FF95D1F5968'
};

const rpc_rinkeby = 'https://rinkeby.infura.io/v3/859f217886ed4c58aada5e127e2ebe7b';
const wss_rpc_rinkeby = 'wss://rinkeby.infura.io/ws/v3/859f217886ed4c58aada5e127e2ebe7b';
const rpc_homestead = 'https://mainnet.infura.io/v3/859f217886ed4c58aada5e127e2ebe7b';
const wss_rpc_homestead = 'wss://mainnet.infura.io/ws/v3/859f217886ed4c58aada5e127e2ebe7b';

const Config = {
  port: process.env.APP_PORT || 9000,
  ipfsNamePrefix: isTestNet ? 'sheepion_test': 'sheepion',
  pinata: {
    gateway: 'https://sheepion.mypinata.cloud',
    apiKey: '64cd7d4c8d9f6c0f17a7',
    secret: 'a0b4cb68aae75a391745b255e5188db2cc7c03c56bc1768b5232db3287ce34da',
  },
  contract: isTestNet ? rinkebyContracts : mainNetContracts,
  rpc: isTestNet ? rpc_rinkeby : rpc_homestead,
  wsRpc: isTestNet ? wss_rpc_rinkeby: wss_rpc_homestead,
  thumbnailSize: {
    width: 350,
    height: 350
  }
};

// export default Config;

module.exports = Config;
