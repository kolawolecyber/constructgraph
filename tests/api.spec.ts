import { test, expect } from "@playwright/test";

const projectId = "project-lagos-office-001";
const taskId = "task-foundation-concrete-001";
const supplierId = "supplier-steel-001";

test.describe("ConstructGraph API", () => {
  test("health endpoint is available", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      status: "ok",
    });
  });

  test("returns project overview", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data).toMatchObject({
      id: projectId,
      name: "Lagos Commercial Office Complex",
    });
  });

  test("returns project tasks", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}/tasks`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    expect(body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: taskId,
          name: "Foundation Concrete",
        }),
      ])
    );
  });

  test("returns project suppliers", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}/suppliers`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    expect(body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: supplierId,
          name: "Metro Steel Supplies",
        }),
      ])
    );
  });

  test("returns project graph", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}/graph`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data).toHaveProperty("nodes");
    expect(body.data).toHaveProperty("edges");

    expect(Array.isArray(body.data.nodes)).toBe(true);
    expect(Array.isArray(body.data.edges)).toBe(true);

    expect(body.data.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityId: taskId,
        }),
        expect.objectContaining({
          entityId: "task-site-clearing-001",
        }),
      ])
    );
  });

  test("returns task impact", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}/tasks/${taskId}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data.task).toMatchObject({
      id: taskId,
      projectId,
    });

    expect(Array.isArray(body.data.affectedTasks)).toBe(true);
  });

  test("returns supplier impact", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}/suppliers/${supplierId}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data.supplier).toMatchObject({
      id: supplierId,
      projectId,
    });

    expect(Array.isArray(body.data.materials)).toBe(true);
    expect(Array.isArray(body.data.affectedTasks)).toBe(true);
  });

  test("returns graph node details", async ({ request }) => {
    const response = await request.get(
      `/api/projects/${projectId}/graph/nodes/${taskId}`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.data).toMatchObject({
      id: taskId,
      label: "Foundation Concrete",
      type: "task",
    });

    expect(Array.isArray(body.data.relationships)).toBe(true);
  });

  test("rejects malformed graph node identifiers", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/${projectId}/graph/nodes/node%20bad`
    );

    expect(response.status()).toBe(400);
  });

  test("rejects malformed project identifiers", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/project%20bad/tasks/${taskId}`
    );

    expect(response.status()).toBe(400);
  });

  test("rejects malformed task identifiers", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/${projectId}/tasks/task%20bad`
    );

    expect(response.status()).toBe(400);
  });

  test("rejects malformed supplier identifiers", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/${projectId}/suppliers/supplier%20bad`
    );

    expect(response.status()).toBe(400);
  });

  test("returns 404 for nonexistent project", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/projects/project-does-not-exist-999"
    );

    expect(response.status()).toBe(404);
  });

  test("returns 404 for nonexistent task", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/${projectId}/tasks/task-does-not-exist-999`
    );

    expect(response.status()).toBe(404);
  });

  test("returns 404 for nonexistent supplier", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/${projectId}/suppliers/supplier-does-not-exist-999`
    );

    expect(response.status()).toBe(404);
  });
});

test.describe("Project isolation", () => {
  test("does not expose a task through an unrelated project", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/project-does-not-exist-999/tasks/${taskId}`
    );

    expect(response.status()).toBe(404);
  });

  test("does not expose a supplier through an unrelated project", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/project-does-not-exist-999/suppliers/${supplierId}`
    );

    expect(response.status()).toBe(404);
  });

  test("does not expose a graph node through an unrelated project", async ({
    request,
  }) => {
    const response = await request.get(
      `/api/projects/project-does-not-exist-999/graph/nodes/${taskId}`
    );

    expect(response.status()).toBe(404);
  });
});