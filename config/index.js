
const isTestNet = process.env.NODE_ENV !== 'production';

const Config = {
  ipfsNamePrefix: isTestNet ? 'sheepion_test': 'sheepion',
  pinata: {
    gateway: 'https://gateway.pinata.cloud',
    apiKey: '64cd7d4c8d9f6c0f17a7',
    secret: 'a0b4cb68aae75a391745b255e5188db2cc7c03c56bc1768b5232db3287ce34da',
  },
  thumbnailSize: {
    width: 350,
    height: 350
  }
};

// export default Config;

module.exports = Config;
