import * as events from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { SecretValue } from "aws-cdk-lib/core";
import { Skill } from "cdk-alexa-skill";
import { StackContext, use, Function } from "sst/constructs";
import { Table } from "sst/constructs";
import * as fs from 'fs'

export function DynamoDB({ stack, app }: {stack: any, app: any}) {
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
  // When on Standard time, run cron every hour between 8am and 5pm EST
  // When on Daylight time, run cron every hour between 9pm and 6pm EDT
  const tenYrTreasuryCron = new events.Rule(stack, 'tenYrTreasuryCron', {
    schedule: events.Schedule.cron({
      minute: "0",
      hour: "13-22",
      weekDay: "1-5",
      month: "*",
    })
  })

  mortgageRatesCronRule.addTarget(new LambdaFunction(mtgRatesFn))
  mortgageRatesCronRule.addTarget(new LambdaFunction(mtgArticleFn))
  tenYrTreasuryCron.addTarget(new LambdaFunction(tenYrTreasuryFn))
}

export async function AlexaSkill({ stack }: StackContext) {
  const { table } = use(DynamoDB)

  // Get Alexa Developer credentials from SSM Parameter Store/Secrets Manager.
  // NOTE: Parameters and secrets must have been created in the appropriate account before running `cdk deploy` on this stack.
  //       See sample script at scripts/upload-credentials.sh for how to create appropriate resources via AWS CLI.
  const alexaVendorId = process.env.ALEXA_VENDOR_ID
  if (!alexaVendorId) {
    throw new Error("Undefined environment variable: ALEXA_VENDOR_ID")
  } 

  const lwaClientId = process.env.LWA_CLIENT_ID
  if (!lwaClientId) {
    throw new Error("Undefined environment variable: LWA_CLIENT_ID")
  }

  if (!process.env.LWA_CLIENT_SECRET) {
    throw new Error("Undefined environment variable: LWA_CLIENT_SECRET")
  }
  const lwaClientSecret = SecretValue.unsafePlainText(process.env.LWA_CLIENT_SECRET)

  if (!process.env.LWA_REFRESH_TOKEN) {
    throw new Error("Undefined environment variable: LWA_REFRESH_TOKEN")
  } 
  const lwaRefreshToken = SecretValue.unsafePlainText(process.env.LWA_REFRESH_TOKEN)

  const skillLambda = new Function(stack, "RateTalkerAlexaSkill", {
    bind: [table],
    handler: "packages/functions/src/endpoints/alexa-endpoint.handler",
  });

  await fs.copyFile(`./skill-package/${stack.stage}.json`, './skill-package/skill.json', (err) => { 
    console.log(err)
  })
  const skill = new Skill(stack, 'Skill', {
    endpointLambdaFunction: skillLambda,
    skillPackagePath: 'skill-package',
    alexaVendorId: alexaVendorId,
    lwaClientId: lwaClientId,
    lwaClientSecret: lwaClientSecret,
    lwaRefreshToken: lwaRefreshToken
  });
}