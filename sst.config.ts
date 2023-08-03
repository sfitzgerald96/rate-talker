import { SSTConfig } from "sst";
import { API, DynamoDB } from "./stacks/MyStack";

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
  }
} satisfies SSTConfig;
