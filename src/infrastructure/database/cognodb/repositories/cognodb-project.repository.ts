
import "server-only";

import type {
  ProjectOverview,
  ProjectRepository,
  TaskImpact,
  SupplierImpact,
  ProjectTask,
  ProjectSupplier,
} from "@/domain/project/repositories/project.repository";

import type { GraphNodeDetails } from "@/domain/project/types/graph-node";

import type {
  GraphEdge,
  GraphNode,
  ProjectGraph,
} from "@/domain/project/types/graph";

import { withCognoDBSession } from "../session";

/**
 * Converts Neo4j Integer values or regular JavaScript numbers
 * into a normal JavaScript number.
 */
function toNumber(value: unknown): number {
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

export class CognoDBProjectRepository implements ProjectRepository {
  async getProjectOverview(
    projectId: string
  ): Promise<ProjectOverview | null> {
    return withCognoDBSession(async (session) => {
      const result = await session.run(
        `
        MATCH (project:Project {id: $projectId})

        OPTIONAL MATCH (project)-[:HAS_PHASE]->(phase:Phase)
        OPTIONAL MATCH (phase)-[:HAS_TASK]->(task:Task)

        RETURN
          project.id AS id,
          project.name AS name,
          project.description AS description,
          project.location AS location,
          project.status AS status,

          collect(DISTINCT {
            id: phase.id,
            name: phase.name,
            sequence: phase.sequence,
            taskCount: count(DISTINCT task)
          }) AS phases
        `,
        { projectId }
      );

      const record = result.records[0];

      if (!record) {
        return null;
      }

      const rawPhases = record.get("phases") as Array<{
        id: string | null;
        name: string | null;
        sequence: unknown;
        taskCount: unknown;
      }>;

      const phases = rawPhases
        .filter((phase) => phase.id !== null)
        .map((phase) => ({
          id: phase.id as string,
          name: phase.name ?? "",
          sequence: toNumber(phase.sequence),
          taskCount: toNumber(phase.taskCount),
        }))
        .sort((a, b) => a.sequence - b.sequence);

      return {
        id: record.get("id"),
        name: record.get("name"),
        description: record.get("description"),
        location: record.get("location"),
        status: record.get("status"),
        phases,
      };
    });
  }

  async getProjectSuppliers(
    projectId: string
  ): Promise<ProjectSupplier[]> {
    return withCognoDBSession(async (session) => {
      const result = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (:Task)
              -[:REQUIRES]->
              (material:Material)
              <-[:SUPPLIES]-
              (supplier:Supplier)

        RETURN DISTINCT
          supplier.id AS id,
          supplier.name AS name,
          supplier.reliabilityScore AS reliabilityScore

        ORDER BY supplier.name ASC
        `,
        { projectId }
      );

      return result.records.map((record) => ({
        id: record.get("id"),
        name: record.get("name"),
        reliabilityScore: toNumber(
          record.get("reliabilityScore")
        ),
      }));
    });
  }

  async getGraphNodeDetails(
    projectId: string,
    nodeId: string
  ): Promise<GraphNodeDetails | null> {
    return withCognoDBSession(async (session) => {
      const result = await session.run(
        `
        MATCH (project:Project {id: $projectId})

        MATCH path =
          (project)
          -[:HAS_PHASE|HAS_TASK|REQUIRES|SUPPLIES|DEPENDS_ON*1..6]-
          (node {id: $nodeId})

        WITH DISTINCT node

        OPTIONAL MATCH (node)-[outgoing]->(outNode)

        WITH
          node,
          collect(
            DISTINCT CASE
              WHEN outgoing IS NOT NULL THEN {
                id: elementId(outgoing),
                label: type(outgoing),
                direction: 'outgoing',
                nodeId: outNode.id,
                nodeLabel: coalesce(
                  outNode.name,
                  outNode.title,
                  outNode.id
                ),
                nodeType: toLower(labels(outNode)[0])
              }
            END
          ) AS outgoingRelationships

        OPTIONAL MATCH (incomingNode)-[incoming]->(node)

        RETURN
          node,
          outgoingRelationships,
          collect(
            DISTINCT CASE
              WHEN incoming IS NOT NULL THEN {
                id: elementId(incoming),
                label: type(incoming),
                direction: 'incoming',
                nodeId: incomingNode.id,
                nodeLabel: coalesce(
                  incomingNode.name,
                  incomingNode.title,
                  incomingNode.id
                ),
                nodeType: toLower(labels(incomingNode)[0])
              }
            END
          ) AS incomingRelationships
        `,
        {
          projectId,
          nodeId,
        }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const node = record.get("node");

      if (!node) {
        return null;
      }

      const properties = node.properties ?? {};
      const nodeLabels = node.labels ?? [];

      const relationships = [
        ...(record.get("outgoingRelationships") ?? []),
        ...(record.get("incomingRelationships") ?? []),
      ].filter(Boolean);

      return {
        id: properties.id,
        label:
          properties.name ??
          properties.title ??
          properties.id,
        type: nodeLabels[0]?.toLowerCase() as
          | "task"
          | "material"
          | "supplier",
        properties: {
          priority: properties.priority,
          category: properties.category,
          unit: properties.unit,
          reliabilityScore: properties.reliabilityScore,
        },
        relationships: relationships.map(
          (relationship: {
            id: string;
            label: string;
            direction: "incoming" | "outgoing";
            nodeId: string;
            nodeLabel: string;
            nodeType: string;
          }) => ({
            id: relationship.id,
            label: relationship.label,
            direction: relationship.direction,
            nodeId: relationship.nodeId,
            nodeLabel: relationship.nodeLabel,
            nodeType: relationship.nodeType as
              | "task"
              | "material"
              | "supplier",
          })
        ),
      };
    });
  }

  async getSupplierImpact(
    projectId: string,
    supplierId: string
  ): Promise<SupplierImpact | null> {
    return withCognoDBSession(async (session) => {
      /*
       * First establish that the supplier actually supplies
       * material required by a task belonging to this project.
       */
      const supplierResult = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (task:Task)
              -[:REQUIRES]->
              (material:Material)
              <-[:SUPPLIES]-
              (supplier:Supplier {id: $supplierId})

        RETURN DISTINCT
          supplier.id AS id,
          supplier.name AS name,
          supplier.reliabilityScore AS reliabilityScore
        `,
        {
          projectId,
          supplierId,
        }
      );

      const supplierRecord = supplierResult.records[0];

      if (!supplierRecord) {
        return null;
      }

      /*
       * Materials supplied by this supplier that are actually
       * required by this project.
       */
      const materialResult = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (:Task)
              -[:REQUIRES]->
              (material:Material)
              <-[:SUPPLIES]-
              (supplier:Supplier {id: $supplierId})

        RETURN DISTINCT
          material.id AS id,
          material.name AS name,
          material.category AS category,
          material.unit AS unit

        ORDER BY material.name ASC
        `,
        {
          projectId,
          supplierId,
        }
      );

      /*
       * Find project tasks that directly require material supplied
       * by this supplier, then find tasks that depend on those
       * starting tasks.
       */
      const taskResult = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (start:Task)
              -[:REQUIRES]->
              (material:Material)
              <-[:SUPPLIES]-
              (supplier:Supplier {id: $supplierId})

        OPTIONAL MATCH path =
          (start)<-[:DEPENDS_ON*0..10]-(affected:Task)

        WITH
          affected,
          min(length(path)) AS depth

        WHERE affected IS NOT NULL

        RETURN DISTINCT
          affected.id AS id,
          affected.name AS name,
          affected.status AS status,
          affected.priority AS priority,
          depth

        ORDER BY depth ASC, affected.name ASC
        `,
        {
          projectId,
          supplierId,
        }
      );

      return {
        supplier: {
          id: supplierRecord.get("id"),
          name: supplierRecord.get("name"), projectId,
          reliabilityScore: toNumber(
            supplierRecord.get("reliabilityScore")
          ),
        },

        materials: materialResult.records.map((record) => ({
          id: record.get("id"),
          name: record.get("name"),
          category: record.get("category"),
          unit: record.get("unit"),
        })),

        affectedTasks: taskResult.records.map((record) => ({
          id: record.get("id"),
          name: record.get("name"),
          status: record.get("status"),
          priority: record.get("priority"),
          depth: toNumber(record.get("depth")),
        })),
      };
    });
  }

  async getProjectGraph(
    projectId: string
  ): Promise<ProjectGraph> {
    return withCognoDBSession(async (session) => {
      const result = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (task:Task)

        OPTIONAL MATCH (task)-[:REQUIRES]->(material:Material)

        OPTIONAL MATCH (supplier:Supplier)
              -[:SUPPLIES]->(material)

        OPTIONAL MATCH (task)-[:DEPENDS_ON]->(dependency:Task)

        RETURN DISTINCT
          task,
          material,
          supplier,
          dependency
        `,
        { projectId }
      );

      const nodeMap = new Map<string, GraphNode>();
      const edgeMap = new Map<string, GraphEdge>();

      for (const record of result.records) {
        const task = record.get("task");
        const material = record.get("material");
        const supplier = record.get("supplier");
        const dependency = record.get("dependency");

        if (task) {
          const id = task.properties.id;

          nodeMap.set(`task:${id}`, {
            id: `task:${id}`,
            label: task.properties.name,
            entityId: id,
            type: "task",
            metadata: {
              priority: task.properties.priority,
            },
          });
        }

        if (material && task) {
          const id = material.properties.id;

          nodeMap.set(`material:${id}`, {
            id: `material:${id}`,
            label: material.properties.name,
            entityId: id,
            type: "material",
            metadata: {
              category: material.properties.category,
            },
          });

          const edgeId =
            `task:${task.properties.id}` +
            `->material:${id}`;

          edgeMap.set(edgeId, {
            id: edgeId,
            source: `task:${task.properties.id}`,
            target: `material:${id}`,
            label: "REQUIRES",
          });
        }

        if (supplier && material) {
          const supplierId = supplier.properties.id;
          const materialId = material.properties.id;

          nodeMap.set(`supplier:${supplierId}`, {
            id: `supplier:${supplierId}`,
            entityId: supplierId,
            label: supplier.properties.name,
            type: "supplier",
          });

          const edgeId =
            `supplier:${supplierId}` +
            `->material:${materialId}`;

          edgeMap.set(edgeId, {
            id: edgeId,
            source: `supplier:${supplierId}`,
            target: `material:${materialId}`,
            label: "SUPPLIES",
          });
        }

        if (dependency && task) {
          const dependencyId = dependency.properties.id;

          nodeMap.set(`task:${dependencyId}`, {
            id: `task:${dependencyId}`,
            entityId: dependencyId,
            label: dependency.properties.name,
            type: "task",
            metadata: {
              priority: dependency.properties.priority,
            },
          });

          const edgeId =
            `task:${task.properties.id}` +
            `->task:${dependencyId}`;

          edgeMap.set(edgeId, {
            id: edgeId,
            source: `task:${task.properties.id}`,
            target: `task:${dependencyId}`,
            label: "DEPENDS_ON",
          });
        }
      }

      return {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeMap.values()),
      };
    });
  }

  async getProjectTasks(
    projectId: string
  ): Promise<ProjectTask[]> {
    return withCognoDBSession(async (session) => {
      const result = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (phase:Phase)
              -[:HAS_TASK]->
              (task:Task)

        RETURN
          task.id AS id,
          task.name AS name,
          task.status AS status,
          task.priority AS priority,
          phase.name AS phaseName,
          phase.sequence AS phaseSequence

        ORDER BY phaseSequence ASC, task.name ASC
        `,
        { projectId }
      );

      return result.records.map((record) => ({
        id: record.get("id"),
        name: record.get("name"),
        status: record.get("status"),
        priority: record.get("priority"),
        phaseName: record.get("phaseName"),
      }));
    });
  }

  async getTaskImpact(
    projectId: string,
    taskId: string
  ): Promise<TaskImpact | null> {
    return withCognoDBSession(async (session) => {
      /*
       * First verify that the task belongs to the requested project.
       */
      const taskResult = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (task:Task {id: $taskId})

        RETURN
          task.id AS id,
          task.name AS name,
          task.status AS status,
          task.priority AS priority
        `,
        {
          projectId,
          taskId,
        }
      );

      const taskRecord = taskResult.records[0];

      if (!taskRecord) {
        return null;
      }

      /*
       * Find downstream tasks affected by the selected task.
       *
       * The starting task is verified against the project above.
       * We then return the dependent tasks.
       */
      const impactResult = await session.run(
        `
        MATCH (project:Project {id: $projectId})
              -[:HAS_PHASE]->
              (:Phase)
              -[:HAS_TASK]->
              (start:Task {id: $taskId})

        MATCH path =
          (start)<-[:DEPENDS_ON*1..10]-(affected:Task)

        WITH
          affected,
          min(length(path)) AS depth

        RETURN DISTINCT
          affected.id AS id,
          affected.name AS name,
          affected.status AS status,
          affected.priority AS priority,
          depth

        ORDER BY depth ASC, affected.name ASC
        `,
        {
          projectId,
          taskId,
        }
      );

      return {
        task: {
          id: taskRecord.get("id"),
          name: taskRecord.get("name"),
          status: taskRecord.get("status"),
          projectId,
          priority: taskRecord.get("priority"),
        },

        affectedTasks: impactResult.records.map((record) => ({
          id: record.get("id"),
          name: record.get("name"),
          status: record.get("status"),
          priority: record.get("priority"),
          depth: toNumber(record.get("depth")),
        })),
      };
    });
  }
}

