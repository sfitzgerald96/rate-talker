import { ApiHandler } from "sst/node/api";
import { TimeSeries } from "@my-sst-app/core/time-series";

export const scrapeAndStoreRates = ApiHandler(async (_evt) => {
  await TimeSeries.create();

  return {
    statusCode: 200,
    body: "Treasury yields created/updated",
  };
});