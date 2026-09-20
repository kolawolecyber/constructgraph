import { describe, expect, it, vi } from "vitest";

import { GetGraphNodeDetails } from "../../src/application/projects/get-graph-node-details";
import { GetProjectGraph } from "../../src/application/projects/get-project-graph";
import { GetProjectOverview } from "../../src/application/projects/get-project-overview";
import { GetProjectSuppliers } from "../../src/application/projects/get-project-suppliers";
import { GetProjectTasks } from "../../src/application/projects/get-project-tasks";
import { GetSupplierImpact } from "../../src/application/impact/get-supplier-impact";
import { GetTaskImpact } from "../../src/application/impact/get-task-impact";
import type { ProjectRepository } from "../../src/domain/project/repositories/project.repository";

describe("project application use cases", () => {
  it("loads a project overview through the repository", async () => {
    const repository = {
      getProjectOverview: vi.fn().mockResolvedValue(null),
    } as unknown as ProjectRepository;
    const useCase = new GetProjectOverview(repository);

    await expect(useCase.execute("project-1")).resolves.toBeNull();
    expect(repository.getProjectOverview).toHaveBeenCalledWith("project-1");
  });

  it("loads project tasks through the repository", async () => {
    const repository = {
      getProjectTasks: vi.fn().mockResolvedValue([]),
    } as unknown as ProjectRepository;
    const useCase = new GetProjectTasks(repository);

    await expect(useCase.execute("project-1")).resolves.toEqual([]);
    expect(repository.getProjectTasks).toHaveBeenCalledWith("project-1");
  });

  it("loads project suppliers through the repository", async () => {
    const repository = {
      getProjectSuppliers: vi.fn().mockResolvedValue([]),
    } as unknown as ProjectRepository;
    const useCase = new GetProjectSuppliers(repository);

    await expect(useCase.execute("project-1")).resolves.toEqual([]);
    expect(repository.getProjectSuppliers).toHaveBeenCalledWith("project-1");
  });

  it("loads a project graph through the repository", async () => {
    const graph = { nodes: [], edges: [] };
    const repository = {
      getProjectGraph: vi.fn().mockResolvedValue(graph),
    } as unknown as ProjectRepository;
    const useCase = new GetProjectGraph(repository);

    await expect(useCase.execute("project-1")).resolves.toEqual(graph);
    expect(repository.getProjectGraph).toHaveBeenCalledWith("project-1");
  });

  it("loads graph node details through the repository", async () => {
    const repository = {
      getGraphNodeDetails: vi.fn().mockResolvedValue(null),
    } as unknown as ProjectRepository;
    const useCase = new GetGraphNodeDetails(repository);

    await expect(
      useCase.execute("project-1", "task-1")
    ).resolves.toBeNull();
    expect(repository.getGraphNodeDetails).toHaveBeenCalledWith(
      "project-1",
      "task-1"
    );
  });
});

describe("impact application use cases", () => {
  it("loads task impact through the repository", async () => {
    const repository = {
      getTaskImpact: vi.fn().mockResolvedValue(null),
    } as unknown as ProjectRepository;
    const useCase = new GetTaskImpact(repository);

    await expect(
      useCase.execute("project-1", "task-1")
    ).resolves.toBeNull();
    expect(repository.getTaskImpact).toHaveBeenCalledWith(
      "project-1",
      "task-1"
    );
  });

  it("loads supplier impact through the repository", async () => {
    const repository = {
      getSupplierImpact: vi.fn().mockResolvedValue(null),
    } as unknown as ProjectRepository;
    const useCase = new GetSupplierImpact(repository);

    await expect(
      useCase.execute("project-1", "supplier-1")
    ).resolves.toBeNull();
    expect(repository.getSupplierImpact).toHaveBeenCalledWith(
      "project-1",
      "supplier-1"
    );
  });
});
