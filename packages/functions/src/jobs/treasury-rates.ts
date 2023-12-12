import { ApiHandler } from "sst/node/api";
import { Rate, RateType } from "@my-sst-app/core/rate";
import fetch from "node-fetch";

type TenYrTreasuryResponse = {
  FormattedQuoteResult: {
    FormattedQuote: {
      symbol: string,
      symbolType: string,
      name: string,
      shortName: string,
      last: string,
      last_timedate: string,
      changetype: string,
      open: string,
      high: string,
      low: string,
      change: string,
      change_pct: string,
      previous_day_closing: string,
      realTime: string
    }[]
  }
}

export const getTenYrTreasury = ApiHandler(async (_evt) => {
  let shortenedUrl = "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=US10Y&output=json"
  const resp = await fetch(shortenedUrl)
  const tenYrTreasuryResp = await resp.json() as TenYrTreasuryResponse;

  let rateItem: RateType = JSON.parse(await Rate.findOrCreate())
  rateItem.tenYrTreasury = tenYrTreasuryResp.FormattedQuoteResult.FormattedQuote[0].last.replace("%", "")

  await Rate.update(rateItem).then((data) => {
    console.log('updated', data)
  }).catch((err) => {
    console.log('error', err)
  });
});
