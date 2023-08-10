const axios = require("axios");
const express = require("express");
const cheerio = require("cheerio");
const PORT = 8000;
const app = express();

const URL = "https://coinmarketcap.com/headlines/news";

async function fetchLatestNews() {
  try {
    const response = await axios(URL);
    const html = response.data;
    const $ = cheerio.load(html);

    const latestNews = [];
    $(`.uikit-row .uikit-col-sm-10 .cmc-link`, html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      latestNews.push({
        title,
        url,
      });
    });
    console.log("LATEST NEWS FETCHED", latestNews);
    return latestNews;
  } catch (error) {
    console.log(error);
  }
}

fetchLatestNews();

app.listen(PORT, () => console.log(`Server Running on port ${8000}`));
