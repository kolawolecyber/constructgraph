import neo4j from "neo4j-driver";
import fs from "node:fs";

const envFile = fs.readFileSync(".env.local", "utf8");

for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

  if (!match) continue;

  const [, key, value] = match;

  process.env[key] = value.replace(/^["']|["']$/g, "");
}

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

console.log("URI:", uri?.replace(/\/\/.*@/, "//***@"));
console.log("Username:", username);

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

try {
  console.log("Testing Neo4j connectivity...");

  await driver.verifyConnectivity();

  console.log("✅ Neo4j connection successful.");

  const session = driver.session();

  try {
    const result = await session.run("RETURN 1 AS health");

    console.log(
      "✅ Query successful:",
      result.records[0].get("health")
    );
  } finally {
    await session.close();
  }
} catch (error) {
  console.error("❌ Neo4j connection failed:");
  console.error(error);
} finally {
  await driver.close();
}