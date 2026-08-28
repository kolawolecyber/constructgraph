import dotenv from "dotenv";
import neo4j, { type Driver } from "neo4j-driver";

dotenv.config({ path: ".env.local" });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("CognoDB environment variables are not configured.");
}

export const driver: Driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);