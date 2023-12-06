export * as Rate from "./rate";
import { DynamoDB, Request } from "aws-sdk";
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

export const findOrCreate = async (rateDate: string): Promise<any> => {
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
