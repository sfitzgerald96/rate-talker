import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    defaults: {
      function: {
      },
    },
    routes: {
      "GET /": "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreRates",
      "GET /mortgage-articles": "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreArticle",
      "GET /treasury-rates": "packages/functions/src/jobs/treasury-rates.scrapeAndStoreRates",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
