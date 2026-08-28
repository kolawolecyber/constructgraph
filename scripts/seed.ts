import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config({ path: ".env.local" });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("CognoDB environment variables are not configured.");
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

const project = {
  id: "project-lagos-office-001",
  name: "Lagos Commercial Office Complex",
  description: "Commercial office development used for graph dependency analysis.",
  location: "Lagos, Nigeria",
  status: "active",
};

const phases = [
  {
    id: "phase-foundation-001",
    name: "Foundation",
    sequence: 1,
  },
  {
    id: "phase-ground-floor-001",
    name: "Ground Floor",
    sequence: 2,
  },
  {
    id: "phase-superstructure-001",
    name: "Superstructure",
    sequence: 3,
  },
  {
    id: "phase-finishes-001",
    name: "Finishes",
    sequence: 4,
  },
];

const tasks = [
  {
    id: "task-site-clearing-001",
    name: "Site Clearing",
    description: "Clear the construction area before setting out.",
    durationDays: 2,
    status: "completed",
    priority: "medium",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-setting-out-001",
    name: "Setting Out",
    description: "Establish building lines and reference points.",
    durationDays: 1,
    status: "completed",
    priority: "high",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-excavation-001",
    name: "Excavation",
    description: "Excavate foundation trenches and pad locations.",
    durationDays: 5,
    status: "completed",
    priority: "high",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-blinding-001",
    name: "Blinding Concrete",
    description: "Place lean concrete at prepared foundation bases.",
    durationDays: 2,
    status: "completed",
    priority: "high",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-foundation-reinforcement-001",
    name: "Foundation Reinforcement",
    description: "Install reinforcement for foundation concrete.",
    durationDays: 3,
    status: "in-progress",
    priority: "high",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-foundation-concrete-001",
    name: "Foundation Concrete",
    description: "Cast reinforced concrete foundations.",
    durationDays: 3,
    status: "pending",
    priority: "high",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-foundation-blockwork-001",
    name: "Foundation Blockwork",
    description: "Construct foundation blockwork up to ground level.",
    durationDays: 4,
    status: "pending",
    priority: "high",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-backfilling-001",
    name: "Backfilling",
    description: "Backfill completed foundation areas.",
    durationDays: 2,
    status: "pending",
    priority: "medium",
    phaseId: "phase-foundation-001",
  },
  {
    id: "task-dpm-001",
    name: "DPM Installation",
    description: "Install damp proof membrane before oversite concrete.",
    durationDays: 1,
    status: "pending",
    priority: "high",
    phaseId: "phase-ground-floor-001",
  },
  {
    id: "task-oversite-concrete-001",
    name: "Oversite Concrete",
    description: "Cast ground floor oversite concrete.",
    durationDays: 3,
    status: "pending",
    priority: "high",
    phaseId: "phase-ground-floor-001",
  },
  {
    id: "task-column-reinforcement-001",
    name: "Column Reinforcement",
    description: "Install reinforcement for structural columns.",
    durationDays: 3,
    status: "pending",
    priority: "high",
    phaseId: "phase-superstructure-001",
  },
  {
    id: "task-column-concrete-001",
    name: "Column Concrete",
    description: "Cast reinforced concrete columns.",
    durationDays: 3,
    status: "pending",
    priority: "high",
    phaseId: "phase-superstructure-001",
  },
  {
    id: "task-blockwork-001",
    name: "Blockwork",
    description: "Construct external and internal masonry walls.",
    durationDays: 7,
    status: "pending",
    priority: "high",
    phaseId: "phase-superstructure-001",
  },
  {
    id: "task-roof-structure-001",
    name: "Roof Structure",
    description: "Install the primary roof structural framework.",
    durationDays: 5,
    status: "pending",
    priority: "high",
    phaseId: "phase-superstructure-001",
  },
  {
    id: "task-plastering-001",
    name: "Internal Plastering",
    description: "Apply internal wall plaster.",
    durationDays: 6,
    status: "pending",
    priority: "medium",
    phaseId: "phase-finishes-001",
  },
  {
    id: "task-screeding-001",
    name: "Screeding",
    description: "Prepare floor surfaces for final floor finishes.",
    durationDays: 4,
    status: "pending",
    priority: "medium",
    phaseId: "phase-finishes-001",
  },
  {
    id: "task-tiling-001",
    name: "Floor Tiling",
    description: "Install finished floor tiles.",
    durationDays: 5,
    status: "pending",
    priority: "medium",
    phaseId: "phase-finishes-001",
  },
  {
    id: "task-painting-001",
    name: "Painting",
    description: "Apply internal finishing coats.",
    durationDays: 5,
    status: "pending",
    priority: "medium",
    phaseId: "phase-finishes-001",
  },
];

const dependencies = [
  ["task-setting-out-001", "task-site-clearing-001"],
  ["task-excavation-001", "task-setting-out-001"],
  ["task-blinding-001", "task-excavation-001"],
  ["task-foundation-reinforcement-001", "task-blinding-001"],
  ["task-foundation-concrete-001", "task-foundation-reinforcement-001"],
  ["task-foundation-blockwork-001", "task-foundation-concrete-001"],
  ["task-backfilling-001", "task-foundation-blockwork-001"],
  ["task-dpm-001", "task-backfilling-001"],
  ["task-oversite-concrete-001", "task-dpm-001"],
  ["task-column-reinforcement-001", "task-foundation-concrete-001"],
  ["task-column-concrete-001", "task-column-reinforcement-001"],
  ["task-blockwork-001", "task-column-concrete-001"],
  ["task-roof-structure-001", "task-blockwork-001"],
  ["task-plastering-001", "task-blockwork-001"],
  ["task-screeding-001", "task-oversite-concrete-001"],
  ["task-tiling-001", "task-screeding-001"],
  ["task-painting-001", "task-plastering-001"],
];

const materials = [
  {
    id: "material-cement-001",
    name: "Cement",
    category: "Concrete",
    unit: "bag",
  },
  {
    id: "material-rebar-001",
    name: "Reinforcement Steel",
    category: "Structural",
    unit: "tonne",
  },
  {
    id: "material-sand-001",
    name: "Sharp Sand",
    category: "Aggregate",
    unit: "m3",
  },
  {
    id: "material-granite-001",
    name: "Granite",
    category: "Aggregate",
    unit: "m3",
  },
  {
    id: "material-blocks-001",
    name: "Concrete Blocks",
    category: "Masonry",
    unit: "piece",
  },
  {
    id: "material-tiles-001",
    name: "Floor Tiles",
    category: "Finishes",
    unit: "m2",
  },
];

const suppliers = [
  {
    id: "supplier-cement-001",
    name: "Lagos Building Materials Ltd",
    reliabilityScore: 0.91,
  },
  {
    id: "supplier-steel-001",
    name: "Metro Steel Supplies",
    reliabilityScore: 0.87,
  },
  {
    id: "supplier-masonry-001",
    name: "Prime Blocks & Aggregates",
    reliabilityScore: 0.84,
  },
  {
    id: "supplier-finishes-001",
    name: "FinishPro Materials",
    reliabilityScore: 0.89,
  },
];

const teams = [
  {
    id: "team-foundation-001",
    name: "Foundation Crew",
    specialization: "Foundation Works",
  },
  {
    id: "team-structural-001",
    name: "Structural Team",
    specialization: "Structural Works",
  },
  {
    id: "team-masonry-001",
    name: "Masonry Crew",
    specialization: "Blockwork",
  },
  {
    id: "team-finishes-001",
    name: "Finishing Crew",
    specialization: "Internal Finishes",
  },
];

async function seed() {
  const session = driver.session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (p:Project {id: $id})
        SET p.name = $name,
            p.description = $description,
            p.location = $location,
            p.status = $status
        `,
        project
      );

      for (const phase of phases) {
        await tx.run(
          `
          MATCH (project:Project {id: $projectId})
          MERGE (phase:Phase {id: $id})
          SET phase.name = $name,
              phase.sequence = $sequence
          MERGE (project)-[:HAS_PHASE]->(phase)
          `,
          {
            projectId: project.id,
            ...phase,
          }
        );
      }

      for (const task of tasks) {
        await tx.run(
          `
          MATCH (phase:Phase {id: $phaseId})
          MERGE (task:Task {id: $id})
          SET task.name = $name,
              task.description = $description,
              task.durationDays = $durationDays,
              task.status = $status,
              task.priority = $priority
          MERGE (phase)-[:HAS_TASK]->(task)
          `,
          task
        );
      }

      for (const [taskId, dependencyId] of dependencies) {
        await tx.run(
          `
          MATCH (task:Task {id: $taskId})
          MATCH (dependency:Task {id: $dependencyId})
          MERGE (task)-[:DEPENDS_ON]->(dependency)
          `,
          { taskId, dependencyId }
        );
      }

      for (const material of materials) {
        await tx.run(
          `
          MERGE (material:Material {id: $id})
          SET material.name = $name,
              material.category = $category,
              material.unit = $unit
          `,
          material
        );
      }

      for (const supplier of suppliers) {
        await tx.run(
          `
          MERGE (supplier:Supplier {id: $id})
          SET supplier.name = $name,
              supplier.reliabilityScore = $reliabilityScore
          `,
          supplier
        );
      }

      for (const team of teams) {
        await tx.run(
          `
          MERGE (team:Team {id: $id})
          SET team.name = $name,
              team.specialization = $specialization
          `,
          team
        );
      }

      await tx.run(`
        MATCH (task:Task {id: "task-foundation-reinforcement-001"})
        MATCH (material:Material {id: "material-rebar-001"})
        MERGE (task)-[:REQUIRES]->(material)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-foundation-concrete-001"})
        MATCH (material:Material {id: "material-cement-001"})
        MERGE (task)-[:REQUIRES]->(material)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-foundation-concrete-001"})
        MATCH (material:Material {id: "material-granite-001"})
        MERGE (task)-[:REQUIRES]->(material)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-foundation-concrete-001"})
        MATCH (material:Material {id: "material-sand-001"})
        MERGE (task)-[:REQUIRES]->(material)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-blockwork-001"})
        MATCH (material:Material {id: "material-blocks-001"})
        MERGE (task)-[:REQUIRES]->(material)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-tiling-001"})
        MATCH (material:Material {id: "material-tiles-001"})
        MERGE (task)-[:REQUIRES]->(material)
      `);

      await tx.run(`
        MATCH (supplier:Supplier {id: "supplier-cement-001"})
        MATCH (material:Material {id: "material-cement-001"})
        MERGE (supplier)-[:SUPPLIES]->(material)
      `);

      await tx.run(`
        MATCH (supplier:Supplier {id: "supplier-steel-001"})
        MATCH (material:Material {id: "material-rebar-001"})
        MERGE (supplier)-[:SUPPLIES]->(material)
      `);

      await tx.run(`
        MATCH (supplier:Supplier {id: "supplier-masonry-001"})
        MATCH (material:Material {id: "material-blocks-001"})
        MERGE (supplier)-[:SUPPLIES]->(material)
      `);

      await tx.run(`
        MATCH (supplier:Supplier {id: "supplier-finishes-001"})
        MATCH (material:Material {id: "material-tiles-001"})
        MERGE (supplier)-[:SUPPLIES]->(material)
      `);

      await tx.run(`
        MATCH (project:Project {id: $projectId})
        MATCH (supplier:Supplier {id: "supplier-cement-001"})
        MERGE (project)-[:USES_SUPPLIER]->(supplier)
      `, { projectId: project.id });

      await tx.run(`
        MATCH (project:Project {id: $projectId})
        MATCH (supplier:Supplier {id: "supplier-steel-001"})
        MERGE (project)-[:USES_SUPPLIER]->(supplier)
      `, { projectId: project.id });

      await tx.run(`
        MATCH (project:Project {id: $projectId})
        MATCH (supplier:Supplier {id: "supplier-masonry-001"})
        MERGE (project)-[:USES_SUPPLIER]->(supplier)
      `, { projectId: project.id });

      await tx.run(`
        MATCH (project:Project {id: $projectId})
        MATCH (supplier:Supplier {id: "supplier-finishes-001"})
        MERGE (project)-[:USES_SUPPLIER]->(supplier)
      `, { projectId: project.id });

      await tx.run(`
        MATCH (task:Task {id: "task-foundation-reinforcement-001"})
        MATCH (team:Team {id: "team-foundation-001"})
        MERGE (task)-[:ASSIGNED_TO]->(team)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-column-concrete-001"})
        MATCH (team:Team {id: "team-structural-001"})
        MERGE (task)-[:ASSIGNED_TO]->(team)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-blockwork-001"})
        MATCH (team:Team {id: "team-masonry-001"})
        MERGE (task)-[:ASSIGNED_TO]->(team)
      `);

      await tx.run(`
        MATCH (task:Task {id: "task-plastering-001"})
        MATCH (team:Team {id: "team-finishes-001"})
        MERGE (task)-[:ASSIGNED_TO]->(team)
      `);
    });

    console.log("ConstructGraph seed completed successfully.");
  } catch (error) {
    console.error("ConstructGraph seed failed.");
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();