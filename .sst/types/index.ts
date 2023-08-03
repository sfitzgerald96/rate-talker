import "sst/node/config";
declare module "sst/node/config" {
  export interface ConfigTypes {
    APP: string;
    STAGE: string;
  }
}import "sst/node/table";
declare module "sst/node/table" {
  export interface TableResources {
    "Rates": {
      tableName: string;
    }
  }
}import "sst/node/api";
declare module "sst/node/api" {
  export interface ApiResources {
    "api": {
      url: string;
    }
  }
}