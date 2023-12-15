import { SSTConfig } from "sst";
import { AlexaSkill, DataCollectionJobs, DynamoDB} from "./stacks/stacks.js";

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
    app.stack(AlexaSkill);
  }
} satisfies SSTConfig;
