export * as Rate from "./rate";
import { DynamoDB, Request } from "aws-sdk";
import moment from "moment";
import { Table } from "sst/node/table";

export interface RateType {
  rateDate: string,
  thirtyYrFixedMortgage?: string,
  mortgageArticle?: string,
  mortgageArticleTitle?: string,
  fifteenYrFixedMortgage?: string,
  tenYrTreasury?: string,
}

export const update = async (
  rate: RateType
): Promise<any> => {
  const dynamoDb = new DynamoDB.DocumentClient();

  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: Table.Rates.tableName,
    Key: {
      "rateDate": rate.rateDate,
    },
    UpdateExpression: 'set thirtyYrFixedMortgage = :thirty, mortgageArticle = :article, mortgageArticleTitle = :articleTitle, fifteenYrFixedMortgage = :fifteen, tenYrTreasury = :ten',
    ExpressionAttributeValues: {
      ':thirty': rate.thirtyYrFixedMortgage || "",
      ':article': rate.mortgageArticle || "",
      ':articleTitle': rate.mortgageArticleTitle || "",
      ':fifteen': rate.fifteenYrFixedMortgage || "",
      ':ten': rate.tenYrTreasury || "",
    }
  }
  console.log("updating rate")
  return dynamoDb.update(params).promise()
}

export const findOrCreate = async (rateDate: string = moment().format('MM/DD/YYYY')): Promise<any> => {
  const dynamoDb = new DynamoDB.DocumentClient();

  const findParams = {
    TableName: Table.Rates.tableName,
    Key: {
      rateDate: rateDate,
    },
  };

  const results = await dynamoDb.get(findParams).promise();

  if (results.Item) {
    return JSON.stringify(results.Item)
  }

  const putParams = {
    TableName: Table.Rates.tableName,
    Item: {
      rateDate: rateDate,
    },
  };
  await dynamoDb.put(putParams).promise();

  return JSON.stringify(putParams.Item)
}

export const findMostRecentlyAvailableRate = async (): Promise<any> => {
  const dynamoDb = new DynamoDB.DocumentClient();

  let i = 0;
  let rateDate = ''
  while (i < 7) {
    rateDate = moment().subtract(i, 'day').format('MM/DD/YYYY');

    const findParams = {
      TableName: Table.Rates.tableName,
      Key: {
        rateDate: rateDate,
      },
    }

    const results = await dynamoDb.get(findParams).promise();

    if (results.Item) {
      return JSON.stringify(results.Item)
    }
  };
}
