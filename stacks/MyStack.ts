import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { StackContext, Api, use, Function } from "sst/constructs";
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
      "GET /mortgage-articles": "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreArticle",
      "GET /treasury-rates": "packages/functions/src/jobs/treasury-rates.getTenYrTreasury",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

export function AlexaEndpoint({ stack }: StackContext) {
  const skillLambda = new Function(stack, "RateTalkerAlexaSkill", {
    handler: "packages/functions/src/endpoints/alexa-endpoint.handler",
  });
  skillLambda.addPermission('alexa-skills-kit-trigger', {
    principal: new ServicePrincipal('alexa-appkit.amazon.com'),
    action: 'lambda:invokeFunction',
    eventSourceToken: "amzn1.ask.skill.8db4cf1c-e076-4fa7-a123-8c49c65ea3b9"
  });
}

export function RatesEndpoint({ stack }: StackContext) {
  const ratesLambda = new Function(stack, "rates", {
    handler: "packages/functions/src/endpoints/rates-endpoint.handler",
  });
}
