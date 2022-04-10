
// Main ipfs worker
require('@babel/register');
const {Op} = require('sequelize');
const _ = require('lodash');
const sharp = require('sharp');
const {pinata, getContentUrl} = require('./services/pinata');
const temp = require('temp');
const {ipfsNamePrefix} = require('./config');

const path = require('path');
const fs = require('fs');

const TYPE_COMMON     = 'common';
const TYPE_RARE       = 'rare';
const TYPE_SUPER_RARE = 'super_rare';
const TYPE_LEGENDARY  = 'legendary';

const assetPath = __dirname + '/assets';
const outputPath = __dirname + '/output';

async function upload() {
  await uploadFolder(`${assetPath}/common/`, TYPE_COMMON);
  await uploadFolder(`${assetPath}/rare/`, TYPE_RARE);
  await uploadFolder(`${assetPath}/super rare/`, TYPE_SUPER_RARE);
  await uploadFolder(`${assetPath}/legendary/`, TYPE_LEGENDARY);
}

async function uploadFolder(folder, type) {
  const metaUriList = [];
  console.log('------- folder name: ', folder);

  // Syncronize
  // await new Promise((resolve) => {
  //   fs.readdir(folder, async (err, files) => {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  
  //       // get original path name
  //       const metaName = `${ipfsNamePrefix}_${type}_original_${i}`;
  //       const imagePath = folder + file;
  //       const originalHash = await uploadImage(imagePath, metaName);
  //       console.log(`------- ${type} ${i + 1}th image hash: ${originalHash}`);
  
  //       // get thumbnail path name
  //       const thumMetaName = `${ipfsNamePrefix}_${type}_thmbnail_${i}`;
  //       const thumbnailImage = sharp(imagePath).resize({width: 350, height: 350});
  //       const thumbnailPath = temp.path() + '.png';
  //       await thumbnailImage.toFile(thumbnailPath);
  //       const thumbnailHash = await uploadImage(thumbnailPath, thumMetaName);
  //       console.log(`------- ${type} ${i + 1}th thumbnail hash: ${thumbnailHash}`);
      
  //       const metadata = {
  //         name: `#${i + 1}`,
  //         description: '',
  //         image: getContentUrl(thumbnailHash),
  //         external_url: 'https://sheepion.xyz',
  //         type: type,
  //         attributes: [
  //         ],
  //         properties: {
  //           category: 'image',
  //           files: [
  //             {
  //               uri: getContentUrl(originalHash),
  //               type: 'image/png'
  //             }
  //           ]
  //         },
  //         compiler: '',
  //       };
  //       console.log(`------- ${type} ${i + 1}th metadata: `, metadata);
  
  //       const jsonMetaName = `${ipfsNamePrefix}_${type}_metadata_${i}.json`
  
  //       // upload json file to ipfs
  //       const {IpfsHash: metadataHash} = await pinata.pinJSONToIPFS(metadata, {
  //         pinataMetadata: {
  //           name: jsonMetaName,
  //         }
  //       });
  
  //       console.log(`------- ${type} ${i + 1}th metadata hash: ${metadataHash}`);
  //       metaUriList.push(metadataHash);
  //     }
  
  //     const outputName = `${outputPath}/${type}.json`;
  //     const jsonData = JSON.stringify(metaUriList);
  //     fs.writeFile(outputName, jsonData, 'utf-8', (err, data) => {
  //       if (err) {
  //         console.log('------ file write error: ', err);
  //       } else {
  //         console.log('------ file write success: ', data);
  //       }
  //     });

  //     resolve(0);
  
  //   });
  // })

  // Asyncronize
  fs.readdir(folder, async (err, files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // get original path name
      const metaName = `${ipfsNamePrefix}_${type}_original_${i}`;
      const imagePath = folder + file;
      const originalHash = await uploadImage(imagePath, metaName);
      console.log(`------- ${type} ${i + 1}th image hash: ${originalHash}`);

      // get thumbnail path name
      const thumMetaName = `${ipfsNamePrefix}_${type}_thmbnail_${i}`;
      const thumbnailImage = sharp(imagePath).resize({width: 350, height: 350});
      const thumbnailPath = temp.path() + '.png';
      await thumbnailImage.toFile(thumbnailPath);
      const thumbnailHash = await uploadImage(thumbnailPath, thumMetaName);
      console.log(`------- ${type} ${i + 1}th thumbnail hash: ${thumbnailHash}`);
    
      const metadata = {
        name: `#${i + 1}`,
        description: '',
        image: getContentUrl(thumbnailHash),
        external_url: 'https://sheepion.xyz',
        type: type,
        attributes: [
        ],
        properties: {
          category: 'image',
          files: [
            {
              uri: getContentUrl(originalHash),
              type: 'image/png'
            }
          ]
        },
        compiler: '',
      };
      console.log(`------- ${type} ${i + 1}th metadata: `, metadata);

      const jsonMetaName = `${ipfsNamePrefix}_${type}_metadata_${i}.json`

      // upload json file to ipfs
      const {IpfsHash: metadataHash} = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: jsonMetaName,
        }
      });

      console.log(`------- ${type} ${i + 1}th metadata hash: ${metadataHash}`);
      metaUriList.push(metadataHash);
    }

    const outputName = `${outputPath}/${type}.json`;
    const jsonData = JSON.stringify(metaUriList);
    fs.writeFile(outputName, jsonData, 'utf-8', (err, data) => {
      if (err) {
        console.log('------ file write error: ', err);
      } else {
        console.log('------ file write success: ', data);
      }
    });
  })
}

async function uploadImage(imagePath, metaDataName) {
  console.log('--------- image path: ', imagePath);
  const {IpfsHash: imageHash} = await pinata.pinFromFS(imagePath, {
    pinataMetadata: {
      name: `${metaDataName}.jpg`,
    }
  });

  console.log('---------- image hash: ', imageHash);
  return imageHash;
}


// load temp
temp.track();

// Start upload
upload().then(() => {

}).catch(err => {
  console.log(err);
});

