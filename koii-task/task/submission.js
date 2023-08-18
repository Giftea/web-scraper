require('dotenv').config();
const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { createFile, deleteFile } = require('../helpers');
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const storageClient = new Web3Storage({
  token: process.env.SECRET_WEB3_STORAGE_KEY,
});

class Submission {
  async task(round) {
    try {
      const URL = 'https://coinmarketcap.com/headlines/news';
      const latestNews = [];
      let proof_cid;
      const response = await axios(URL);
      const html = response.data;
      const $ = cheerio.load(html);

      $(`.uikit-row .uikit-col-sm-10 .cmc-link`, html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');
        latestNews.push({
          title,
          url,
        });
      });

      if (latestNews !== null && latestNews.length !== 0) {
        const path = `./Latest_news/proofs.json`;

        if (!fs.existsSync('./Latest_news')) fs.mkdirSync('./Latest_news');
        console.log('PATH', path);
        await createFile(path, latestNews);

        if (storageClient) {
          const file = await getFilesFromPath(path);
          proof_cid = await storageClient.put(file);
          console.log('User Linktrees proof uploaded to IPFS: ', proof_cid);

          // deleting the file from fs once it is uploaded to IPFS
          await deleteFile(path);

          // store value on NeDB
          await namespaceWrapper.storeSet('value', JSON.stringify(proof_cid));
          console.log('LATEST NEWS CID', proof_cid);
        } else {
          console.log('NODE DO NOT HAVE ACCESS TO WEB3.STORAGE');
        }
      }
      return proof_cid;
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  async submitTask(roundNumber) {
    console.log('submitTask called with round', roundNumber);
    try {
      console.log('inside try');
      console.log(
        await namespaceWrapper.getSlot(),
        'current slot while calling submit',
      );
      const submission = await this.fetchSubmission(roundNumber);
      console.log('SUBMISSION', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(
        submission,
        roundNumber,
      );
      console.log('after the submission call');
      return submission;
    } catch (error) {
      console.log('error in submission', error);
    }
  }

  async fetchSubmission(round) {
    // Write the logic to fetch the submission values here and return the cid string

    // fetching round number to store work accordingly

    console.log('IN FETCH SUBMISSION');

    // The code below shows how you can fetch your stored value from level DB

    const value = await namespaceWrapper.storeGet('value'); // retrieves the value
    console.log('VALUE', value);
    return value;
  }
}
const submission = new Submission();
module.exports = { submission };
