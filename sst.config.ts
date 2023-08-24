import { SSTConfig } from "sst";
import { API, AlexaEndpoint, DynamoDB } from "./stacks/MyStack";

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
  }
} satisfies SSTConfig;
