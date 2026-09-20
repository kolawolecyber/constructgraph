import { driver } from "./cognodb";

const constraints = [
  `
  CREATE CONSTRAINT project_id_unique IF NOT EXISTS
  FOR (p:Project)
  REQUIRE p.id IS UNIQUE
  `,
  `
  CREATE CONSTRAINT phase_id_unique IF NOT EXISTS
  FOR (p:Phase)
  REQUIRE p.id IS UNIQUE
  `,
  `
  CREATE CONSTRAINT task_id_unique IF NOT EXISTS
  FOR (t:Task)
  REQUIRE t.id IS UNIQUE
  `,
  `
  CREATE CONSTRAINT material_id_unique IF NOT EXISTS
  FOR (m:Material)
  REQUIRE m.id IS UNIQUE
  `,
  `
  CREATE CONSTRAINT supplier_id_unique IF NOT EXISTS
  FOR (s:Supplier)
  REQUIRE s.id IS UNIQUE
  `,
  `
  CREATE CONSTRAINT team_id_unique IF NOT EXISTS
  FOR (t:Team)
  REQUIRE t.id IS UNIQUE
  `,
];

async function setupDatabase() {
  const session = driver.session();

  try {
    for (const statement of constraints) {
      await session.run(statement);
    }

    console.log("CognoDB schema setup completed.");
  } finally {
    await session.close();
    await driver.close();
  }
}

setupDatabase().catch(() => {
  console.error("CognoDB schema setup failed.");
  process.exitCode = 1;
});