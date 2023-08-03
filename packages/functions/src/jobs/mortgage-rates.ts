import { ApiHandler } from "sst/node/api";
import { Rate, RateType } from "@my-sst-app/core/rate";
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import moment from "moment";

// export const scrapeAndStoreThirtyRate = ApiHandler(async (_evt) => {
//   const resp = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fixed')
// 	const body = await resp.text();
//   const root = parse(body);

//   const rateDate = root.querySelector('div.current-mtg-rate > div.rate-date.pull-right')?.text.trim() || '';
//   const rate = root.querySelector('div.current-mtg-rate > div.rate')?.text.trim().replaceAll('%', '');

//   let rateItem: RateType = JSON.parse(await Rate.findOrCreate(rateDate))
//   rateItem.thirtyYrFixedMortgage = rate;

//   await Rate.update(rateItem).then((data) => {
//     console.log('updated', data)
//   }).catch((err) => {
//     console.log('error', err)
//   });
// });

export const scrapeAndStoreRates = ApiHandler(async (_evt) => {
  const resp = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/15-year-fixed')
	const body = await resp.text();
  const root = parse(body);
  
  const rateDate = root.querySelector('div.current-mtg-rate > div.rate-date.pull-right')?.text.trim() || '';
  const fifteenRate = root.querySelector('div.row.rate-page > div > table > tbody > tr:nth-child(2) > td:nth-child(2)')?.text.trim().replaceAll('%', '');
  const thirtyRate = root.querySelector('div.current-mtg-rate > div.rate')?.text.trim().replaceAll('%', '');

  let rateItem: RateType = JSON.parse(await Rate.findOrCreate(rateDate))
  rateItem.fifteenYrFixedMortgage = fifteenRate;
  rateItem.thirtyYrFixedMortgage = thirtyRate;

  await Rate.update(rateItem).then((data) => {
    console.log('updated', data)
  }).catch((err) => {
    console.log('error', err)
  });
});

export const scrapeAndStoreArticle = ApiHandler(async (_evt) => {
  const rootUrl = 'https://www.mortgagenewsdaily.com'
  const resp = await fetch(`${rootUrl}/topic/mortgage-rates`)
	const body = await resp.text();
  const root = parse(body);

  const articleTitle = root.querySelector('div.row.article-list-section.category > div.col-md-8 > div.news-article-list > div:nth-child(1) > div.article-title > a')
  const articleLink = `${rootUrl}${articleTitle?.rawAttributes.href}`
  const articleDate = root.querySelector('div.row.article-list-section.category > div.col-md-8 > div.news-article-list > div:nth-child(1) > div.article-byline')?.text

  let a = moment(articleDate); 
  console.log(a)
  // console.log(articleDate, articleLink)

  // const articleBody = root.querySelector('#pw > div.container > div > div.row.article-section > div.col-md-8 > div > div.article-body')
  // console.log(articleBody)
  return {
    statusCode: 200,
    body: "mortgage article retrieved",
  };
});