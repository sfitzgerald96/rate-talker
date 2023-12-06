import { SSTConfig } from "sst";
import { API, AlexaEndpoint, DynamoDB, RatesEndpoint } from "./stacks/MyStack.js";

export default {
  config(_input) {
    return {
      name: "my-sst-app",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(DynamoDB);
    app.stack(API);
    app.stack(AlexaEndpoint);
    app.stack(RatesEndpoint)
  }
} satisfies SSTConfig;
