import { SSTConfig } from "sst";
import { AlexaEndpoint, DataCollectionJobs, DynamoDB} from "./stacks/stacks.js";

export default {
  config(_input) {
    return {
      name: "my-sst-app",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(DynamoDB);
    app.stack(DataCollectionJobs);
    app.stack(AlexaEndpoint);
  }
} satisfies SSTConfig;
