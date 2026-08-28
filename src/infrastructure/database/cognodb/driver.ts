import "server-only";
import neo4j, { type Driver } from "neo4j-driver";
import { env } from "@/core/config/env";

const globalForNeo4j = globalThis as unknown as {
  cognodbDriver?: Driver;
};

export const cognodbDriver =
  globalForNeo4j.cognodbDriver ??
  neo4j.driver(
    env.COGNODB_URI,
    neo4j.auth.basic(
      env.COGNODB_USERNAME,
      env.COGNODB_PASSWORD
    )
  );

if (process.env.NODE_ENV !== "production") {
  globalForNeo4j.cognodbDriver = cognodbDriver;
}