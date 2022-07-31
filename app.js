
// Main ipfs worker
require('@babel/register');
const {Op} = require('sequelize');
const _ = require('lodash');
const sharp = require('sharp');
const mt = require('media-thumbnail');
const ffmpeg = require('ffmpeg-static')
const genThumbnail = require('simple-thumbnail')

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


async function uploadContent(contentPath, metaDataName, extension = 'jpg') {
  console.log('------- uploading content path: ', contentPath);
  const {IpfsHash: hash} = await pinata.pinFromFS(contentPath, {
    pinataMetadata: {
      name: `${metaDataName}.${extension}`,
    }
  });
  return hash;
}

function isMovie(extension) {
  if (extension == 'mp4') {
    return true;
  }

  return false;
}

async function uploadFolder(folder, type) {
  const metaUriList = [];
  console.log('------- folder name: ', folder);

  const contentFolder = folder + 'content/';
  const metadataFolder = folder + 'metadata/';

  // Asyncronize
  fs.readdir(contentFolder, async (err, files) => {
    let index = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file == ".DS_Store")  continue;

      const fileName = file.split('.')[0];
      const copies = fileName.split('_')[1];
      
      const extension = file.split('.')[1];
      
      // get original path name
      const metaName = `${ipfsNamePrefix}_${type}_${index + 1}`;
      const contentPath = contentFolder + file;
      console.log(`----- content path: ${contentPath}`);

      console.log(`----- ${type} ${index + 1}th uploading to IPFS`);
      const originalHash = await uploadContent(contentPath, metaName, extension);
      console.log(`------- ${type} ${index + 1}th hash: ${originalHash}`);
      console.log(`------- ${type} ${index + 1}th url: ${getContentUrl(originalHash)}`);

      // get thumbnail path name
      const thumMetaName = `${ipfsNamePrefix}_${type}_thmbnail_${index + 1}`;
      let thumbnailPath = temp.path() + '.png';
      let existThumbnail = true;

      if (isMovie(extension)) { // video
        try {
          existThumbnail = await new Promise((resolve) => {
            genThumbnail(contentPath, thumbnailPath, '350x350', {path: ffmpeg.path})
              .then(() => {
                console.log('---------- thumbnail creation success for video file: ');
                resolve(true);
              })
              .catch(err => {
                console.log('---------- thumbnail creation error for video file: ', err);
                resolve(false);
              })
          })
          
        } catch (err) {
          console.log('---------- thumbnail creation error for video file: ', err);
        }

      } else { // image
        const thumbnailImage = sharp(contentPath).resize({width: 350, height: 350});
        await thumbnailImage.toFile(thumbnailPath);
      }

      let thumbnailHash = "";
      if (existThumbnail) {
        console.log(`----- ${type} ${index + 1}th thumbnail uploading to IPFS`);
        thumbnailHash = await uploadContent(thumbnailPath, thumMetaName);
        console.log(`------- ${type} ${index + 1}th thumbnail hash: ${thumbnailHash}`);
        console.log(`------- ${type} ${index + 1}th thumbnail url: ${getContentUrl(thumbnailHash)}`);
      }

      // read metadata from file
      try {
        const jsonString = fs.readFileSync(metadataFolder + fileName + '.json');
        let metadata = JSON.parse(jsonString);
        if (existThumbnail) {
          metadata.image = getContentUrl(thumbnailHash);
        }

        metadata.rarity_type = type;
        metadata.properties.files[0].uri = getContentUrl(originalHash);

        if (isMovie(extension)) {
          metadata.animation_url = getContentUrl(originalHash);
        }

        const jsonMetaName = `${ipfsNamePrefix}_${type}_metadata_${index + 1}.json`
  
        // upload json file to ipfs
        const {IpfsHash: metadataHash} = await pinata.pinJSONToIPFS(metadata, {
          pinataMetadata: {
            name: jsonMetaName,
          }
        });
  
        console.log(`------- ${type} ${index + 1}th metadata hash: ${metadataHash}`);
        console.log(`------- ${type} ${index + 1}th metadata url: ${getContentUrl(metadataHash)}`);
        metaUriList.push({metadataHash: metadataHash, thumbnailHash: thumbnailHash, copies: copies});

      } catch (err) {
        console.log(`------ reading error of ${metadataFolder + fileName}.json: `, err);
        continue;
      }

      index++;
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


  // Syncronize
  // await new Promise((resolve) => {
  //   fs.readdir(contentFolder, async (err, files) => {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const fileName = file.split('.')[0];
  
  //       // get original path name
  //       const metaName = `${ipfsNamePrefix}_${type}_original_${index + 1}`;
  //       const contentPath = contentFolder + file;
  //       const originalHash = await uploadContent(contentPath, metaName);
  //       console.log(`------- ${type} ${index + 1}th image hash: ${originalHash}`);
  //       console.log(`------- ${type} ${index + 1}th image url: ${getContentUrl(originalHash)}`);
  
  //       // get thumbnail path name
  //       const thumMetaName = `${ipfsNamePrefix}_${type}_thmbnail_${index + 1}`;
  //       const thumbnailImage = sharp(contentPath).resize({width: 350, height: 350});
  //       const thumbnailPath = temp.path() + '.png';
  //       await thumbnailImage.toFile(thumbnailPath);
  //       const thumbnailHash = await uploadContent(thumbnailPath, thumMetaName);
  //       console.log(`------- ${type} ${index + 1}th thumbnail hash: ${thumbnailHash}`);
  //       console.log(`------- ${type} ${index + 1}th thumbnail url: ${getContentUrl(thumbnailHash)}`);
  
  //       // read metadata from file
  //       try {
  //         const jsonString = fs.readFileSync(metadataFolder + fileName + '.json');
  //         let metadata = JSON.parse(jsonString);
  //         metadata.image = getContentUrl(thumbnailHash);
  //         metadata.rarity_type = type;
  //         metadata.properties.files[0].uri = getContentUrl(originalHash);
  
  //         const jsonMetaName = `${ipfsNamePrefix}_${type}_metadata_${index + 1}.json`
    
  //         // upload json file to ipfs
  //         const {IpfsHash: metadataHash} = await pinata.pinJSONToIPFS(metadata, {
  //           pinataMetadata: {
  //             name: jsonMetaName,
  //           }
  //         });
    
  //         console.log(`------- ${type} ${index + 1}th metadata hash: ${metadataHash}`);
  //         console.log(`------- ${type} ${index + 1}th metadata url: ${getContentUrl(metadataHash)}`);
  //         metaUriList.push({metadataHash: metadataHash, thumbnailHash: thumbnailHash});
  
  //       } catch (err) {
  //         console.log(`------ reading error of ${metadataFolder + fileName}.json --------`);
  //         continue;
  //       }
  //     }
  
  //     const outputName = `${outputPath}/${type}.json`;
  //     const jsonData = JSON.stringify(metaUriList);
  //     await new Promise((writeResolve) => {
  //       fs.writeFile(outputName, jsonData, 'utf-8', (err, data) => {
  //         if (err) {
  //           console.log('------ file write error: ', err);
  //         } else {
  //           console.log('------ file write success: ', data);
  //         }
  //       });
  //       writeResolve(0);
  //     })

  //     resolve(0);
  //   })
  // })
}

async function upload() {
  await uploadFolder(`${assetPath}/common/`, TYPE_COMMON);
  await uploadFolder(`${assetPath}/rare/`, TYPE_RARE);
  await uploadFolder(`${assetPath}/super rare/`, TYPE_SUPER_RARE);
  await uploadFolder(`${assetPath}/legendary/`, TYPE_LEGENDARY);
}

// load temp
temp.track();

// Start upload
upload().then(() => {

}).catch(err => {
  console.log(err);
});

