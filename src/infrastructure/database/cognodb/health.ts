import "server-only";
import { withCognoDBSession } from "./session";

export async function checkCognoDBHealth(): Promise<boolean> {
  try {
    const result = await withCognoDBSession((session) =>
      session.run("RETURN 1 AS health")
    );

    const health = result.records[0]?.get("health");

    return health?.toNumber?.() === 1;
  } catch (error) {
    console.error("[CognoDB Health] Failed:", error);
    return false;
  }
}