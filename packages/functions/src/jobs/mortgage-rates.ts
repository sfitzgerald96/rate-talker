import { ApiHandler } from "sst/node/api";
import { Rate, RateType } from "@my-sst-app/core/rate";
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import moment from "moment";

export const scrapeAndStoreRates = ApiHandler(async (_evt) => {
  const resp = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/15-year-fixed')
	const body = await resp.text();
  const root = parse(body);
  
  const rateDate = root.querySelector('div.current-mtg-rate > div.rate-date.pull-right')?.text.trim() || '';

  if (rateDate !== moment().tz(Rate.TIMEZONE).format('M/D/YYYY')) {
    return { statusCode: 200, body: "Mortgage rate has not posted for today."}
  }

  const fifteenRate = root.querySelector('div.row.rate-page > div > table > tbody > tr:nth-child(2) > td:nth-child(2)')?.text.trim().replaceAll('%', '');
  const thirtyRate = root.querySelector('div.current-mtg-rate > div.rate')?.text.trim().replaceAll('%', '');

  let rateItem: RateType = JSON.parse(await Rate.findOrCreate())
  rateItem.fifteenYrFixedMortgage = fifteenRate;
  rateItem.thirtyYrFixedMortgage = thirtyRate;

  await Rate.update(rateItem).then((data) => {
    console.log('updated', data)
    return data
  }).catch((err) => {
    console.log('error', err)
    return err
  });
});

export const scrapeAndStoreArticle = ApiHandler(async (_evt) => {
  const resp = await fetch(`https://www.mortgagenewsdaily.com/markets/mortgage-rates-${moment().tz(Rate.TIMEZONE).format('MMDDYYYY')}`)
	const body = await resp.text();
  const root = parse(body);

  const articleTitle = root.querySelector('div.row.article-section div.article-title')?.text.trim()
  let articleBody = root.querySelector('div.row.article-section div.article-body')
  const advertisement = articleBody?.querySelector('div.cobrand-hide')

  if (articleBody && articleTitle) {
    if (advertisement) {
      articleBody = articleBody?.removeChild(advertisement)
    }

    const sanitizedBody = articleBody?.structuredText.trim()

    let rateItem: RateType = JSON.parse(await Rate.findOrCreate())
    rateItem.mortgageArticle = sanitizedBody
    rateItem.mortgageArticleTitle = articleTitle

    await Rate.update(rateItem).then((data) => {
      console.log('updated', data)
    }).catch((err) => {
      console.log('error', err)
    });
  } else {
    console.log(`Article has not been released for ${moment().tz(Rate.TIMEZONE).format('MM/DD/YYYY')}`)
  }
});
