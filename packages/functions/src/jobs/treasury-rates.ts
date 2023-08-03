import { ApiHandler } from "sst/node/api";
import { Rate } from "@my-sst-app/core/rate";

export const scrapeAndStoreRates = ApiHandler(async (_evt) => {
  // await Rate.findOrCreate();

  return {
    statusCode: 200,
    body: "Treasury yields created/updated",
  };
});