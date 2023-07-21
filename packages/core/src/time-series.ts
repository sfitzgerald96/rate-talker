export * as TimeSeries from "./time-series";
import crypto from "crypto";

export async function create() {
  const id = crypto.randomUUID();
  // write to database
  return id
}

export function get() {
  // get data
}