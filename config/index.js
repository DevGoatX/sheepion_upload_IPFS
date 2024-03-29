
const isTestNet = process.env.NODE_ENV !== 'production';

const Config = {
  ipfsNamePrefix: isTestNet ? 'sheepion_test': 'sheepion',
  pinata: {
    // gateway: 'https://sheepion.mypinata.cloud',
    // apiKey: 'd08715be3716ef4440aa',
    // secret: '987455caf7d16375e741eafd01916f671f6df2ceea4c97b4ed2a5c4904d116a3',
    gateway: 'https://gateway.pinata.cloud',
    apiKey: 'aaf0eccc10e10e38c75f',
    secret: '1a5aa6860fb27fcb11b646aa5d95e849c51f4de3c2c6120914e389f07b36c66e',
  },
  thumbnailSize: {
    width: 350,
    height: 350
  }
};

// export default Config;

module.exports = Config;
