import "server-only";
import { cognodbDriver } from "./driver";

export async function withCognoDBSession<T>(
  operation: (session: ReturnType<typeof cognodbDriver.session>) => Promise<T>
): Promise<T> {
  const session = cognodbDriver.session();

  try {
    return await operation(session);
  } finally {
    await session.close();
  }
}