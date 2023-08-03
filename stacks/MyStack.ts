import { StackContext, Api, use } from "sst/constructs";
import { Table } from "sst/constructs";

export function DynamoDB({ stack, app }: {stack: any, app: any}) {
  // Create the DynamoDB table
  const table = new Table(stack, "Rates", {
    fields: {
      rateDate: "string",
      thirtyYrFixedMortgage: "string",
      mortgageArticle: "string",
      fifteenYrFixedMortgage: "string",
      tenYrTreasury: "string",
    },
    primaryIndex: { partitionKey: "rateDate" },
  });

  return {
    table,
  };
}

export function API({ stack }: StackContext) {
  const { table } = use(DynamoDB)
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [table]
      },
    },
    routes: {
      "GET /": "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreRates",
      "GET /15": "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreFifteenRate",
      "GET /mortgage-articles": "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreArticle",
      "GET /treasury-rates": "packages/functions/src/jobs/treasury-rates.scrapeAndStoreRates",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
