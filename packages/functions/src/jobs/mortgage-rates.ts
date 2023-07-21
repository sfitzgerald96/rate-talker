import { ApiHandler } from "sst/node/api";
import { TimeSeries } from "@my-sst-app/core/time-series";

export const scrapeAndStoreRates = ApiHandler(async (_evt) => {
  // await TimeSeries.create();

  return {
    statusCode: 200,
    body: "mortgage rates updated",
  };
});

export const scrapeAndStoreArticle = ApiHandler(async (_evt) => {
  await TimeSeries.create();

  return {
    statusCode: 200,
    body: "mortgage article retrieved",
  };
});