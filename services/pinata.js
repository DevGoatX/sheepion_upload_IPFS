const pinataSDK = require('@pinata/sdk');
const config = require('../config');

const {apiKey, secret, gateway} = config.pinata;
const pinata = pinataSDK(apiKey, secret);

/**
 * Get actual accessible https url from CID
 * @type {any}
 */
const getContentUrl = (hash) => {
    return gateway + "/ipfs/" + hash;
}

// export default {pinata, getContentUrl};

module.exports = {getContentUrl, pinata};