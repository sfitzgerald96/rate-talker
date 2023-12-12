import * as events from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { StackContext, use, Function } from "sst/constructs";
import { Table } from "sst/constructs";

export function DynamoDB({ stack, app }: {stack: any, app: any}) {
  const table = new Table(stack, "Rates", {
    fields: {
      rateDate: "string",
      thirtyYrFixedMortgage: "string",
      mortgageArticle: "string",
      mortgageArticleTitle: "string",
      fifteenYrFixedMortgage: "string",
      tenYrTreasury: "string",
    },
    primaryIndex: { partitionKey: "rateDate" },
  });

  return {
    table,
  };
}

export function DataCollectionJobs({ stack }: StackContext) {
  const { table } = use(DynamoDB)
  const mtgRatesFn = new Function(stack, "mortgageRatesLambda", {
    bind: [table],
    handler: "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreRates",
  });
  const mtgArticleFn = new Function(stack, "mortgageArticleLambda", {
    bind: [table],
    handler: "packages/functions/src/jobs/mortgage-rates.scrapeAndStoreArticle",
  });
  const tenYrTreasuryFn = new Function(stack, "tenYrTreasuryLambda", {
    bind: [table],
    handler: "packages/functions/src/jobs/treasury-rates.getTenYrTreasury",
  });
  // TODO: Read up on how AWS manages daylight savings with its cron: https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html

  // Historically, Mortgage News Daily (MND) releases its rates and articles between 5pm and 7pm
  // When on Standard time, run cron every half hour between 4pm and 7pm EST
  // When on Daylight time, run cron every half hour between 5pm and 8pm EDT
  const mortgageRatesCronRule = new events.Rule(stack, 'mortgageRatesCron', {
    schedule: events.Schedule.cron({
      minute: "*/30",
      hour: "0,21-23",
      weekDay: "1-5",
      month: "*",
    })
  })
  // Bond Market typically closes at 5pm
  // When on Standard time, run cron every hour between 4pm and 5pm EST
  // When on Daylight time, run cron every hour between 5pm and 6pm EDT
  const tenYrTreasuryCron = new events.Rule(stack, 'tenYrTreasuryCron', {
    schedule: events.Schedule.cron({
      minute: "0",
      hour: "21-22",
      weekDay: "1-5",
      month: "*",
    })
  })

  mortgageRatesCronRule.addTarget(new LambdaFunction(mtgRatesFn))
  mortgageRatesCronRule.addTarget(new LambdaFunction(mtgArticleFn))
  tenYrTreasuryCron.addTarget(new LambdaFunction(tenYrTreasuryFn))
}

export function AlexaEndpoint({ stack }: StackContext) {
  const { table } = use(DynamoDB)

  const skillLambda = new Function(stack, "RateTalkerAlexaSkill", {
    bind: [table],
    handler: "packages/functions/src/endpoints/alexa-endpoint.handler",
  });
  skillLambda.addPermission('alexa-skills-kit-trigger', {
    principal: new ServicePrincipal('alexa-appkit.amazon.com'),
    action: 'lambda:invokeFunction',
    eventSourceToken: "amzn1.ask.skill.8db4cf1c-e076-4fa7-a123-8c49c65ea3b9"
  });
}