require('dotenv').config();
const axios = require('axios');
const { Web3Storage } = require('web3.storage');
const storageClient = new Web3Storage({
  token: process.env.SECRET_WEB3_STORAGE_KEY,
});
const fsPromise = require('fs/promises');

// Create File
export async function createFile(path, data) {
  await fsPromise.writeFile(path, JSON.stringify(data), err => {
    if (err) {
      console.error(err);
    }
  });
}

// Delete File
export async function deleteFile(path) {
  await fsPromise.unlink(path, err => {
    if (err) {
      console.error(err);
    }
  });
}

export async function dataFromCid(cid) {
  console.log('CID', cid);
  if (storageClient) {
    const res = await storageClient.get(cid.replace(/['"]/g, ''));

    if (res?.ok) {
      const file = await res.files();
      const url = `https://${file[0].cid}.ipfs.w3s.link/?filename=${file[0].name}`;
      console.log('URL', url);
      try {
        const output = await axios.get(url);
        return JSON.stringify(output.data);
      } catch (error) {
        console.log('ERROR', error);
      }
    } else {
      // voting false
      console.log('VOTE FALSE');

      console.log('SLASH VOTE DUE TO FAKE VALUE');
      return false;
    }
  }
}
