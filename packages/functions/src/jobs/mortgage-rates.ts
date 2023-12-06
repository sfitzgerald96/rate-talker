import { ApiHandler } from "sst/node/api";
import { Rate, RateType } from "@my-sst-app/core/rate";
import fetch from 'node-fetch';
import { HTMLElement, NodeType, parse } from 'node-html-parser';
import moment from "moment";

export const scrapeAndStoreRates = ApiHandler(async (_evt) => {
  const resp = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/15-year-fixed')
	const body = await resp.text();
  const root = parse(body);
  
  const rateDate = root.querySelector('div.current-mtg-rate > div.rate-date.pull-right')?.text.trim() || '';
  const fifteenRate = root.querySelector('div.row.rate-page > div > table > tbody > tr:nth-child(2) > td:nth-child(2)')?.text.trim().replaceAll('%', '');
  const thirtyRate = root.querySelector('div.current-mtg-rate > div.rate')?.text.trim().replaceAll('%', '');

  let rateItem: RateType = JSON.parse(await Rate.findOrCreate(moment(rateDate).format('MM/DD/YYYY')))
  rateItem.fifteenYrFixedMortgage = fifteenRate;
  rateItem.thirtyYrFixedMortgage = thirtyRate;

  await Rate.update(rateItem).then((data) => {
    console.log('updated', data)
  }).catch((err) => {
    console.log('error', err)
  });
});

export const scrapeAndStoreArticle = ApiHandler(async (_evt) => {
  const resp = await fetch(`https://www.mortgagenewsdaily.com/markets/mortgage-rates-${moment().format('MMDDYYYY')}`)
	const body = await resp.text();
  const root = parse(body);

  const articleTitle = root.querySelector('div.row.article-section div.article-title')?.text.trim()
  let articleBody = root.querySelector('div.row.article-section div.article-body')
  const advertisement = articleBody?.querySelector('div.cobrand-hide')

  if (advertisement && articleBody) {
    articleBody = articleBody?.removeChild(advertisement)
  }

  const sanitizedBody = articleBody?.structuredText.trim()

  let rateItem: RateType = JSON.parse(await Rate.findOrCreate(moment().format('MM/DD/YYYY')))
  rateItem.mortgageArticle = sanitizedBody
  rateItem.mortgageArticleTitle = articleTitle

  await Rate.update(rateItem).then((data) => {
    console.log('updated', data)
  }).catch((err) => {
    console.log('error', err)
  });
});
