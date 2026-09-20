import { test, expect } from "@playwright/test";

test.describe("ConstructGraph UI", () => {
  test("loads the project overview", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Project Overview" })
    ).toBeVisible();

    await expect(
      page.getByText("Lagos Commercial Office Complex")
    ).toBeVisible();
  });

  test("navigates to task impact", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Task Impact" }).click();

    await expect(
      page.getByRole("heading", { name: "Task Impact" })
    ).toBeVisible();
  });

  test("navigates to supply impact", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Supply Impact" }).click();

    await expect(
      page.getByRole("heading", { name: "Supply Impact" })
    ).toBeVisible();
  });

  test("analyzes task impact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Task Impact" }).click();

    await page.getByRole("combobox").selectOption(
      "task-foundation-concrete-001"
    );
    await page.getByRole("button", { name: "Analyze impact" }).click();

    await expect(
      page.getByRole("heading", { name: "Dependency impact path" })
    ).toBeVisible();
    await expect(
      page.getByText("Foundation Concrete", { exact: true }).last()
    ).toBeVisible();
  });

  test("analyzes supplier impact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Supply Impact" }).click();

    await page.getByRole("combobox").selectOption("supplier-steel-001");
    await page.getByRole("button", { name: "Analyze impact" }).click();

    await expect(
      page.getByRole("heading", { name: "Supply disruption path" })
    ).toBeVisible();
    await expect(
      page.getByText("Metro Steel Supplies", { exact: true }).last()
    ).toBeVisible();
  });

  test("shows an error when the project cannot load", async ({ page }) => {
    await page.route(
      "**/api/projects/project-lagos-office-001",
      (route) =>
        route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Database unavailable" }),
        })
    );

    await page.goto("/");

    await expect(
      page.getByText("We couldn't load the project right now.")
    ).toBeVisible();
  });

  test("shows an error when task loading fails", async ({ page }) => {
    await page.route(
      "**/api/projects/project-lagos-office-001/tasks",
      (route) =>
        route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Database unavailable" }),
        })
    );

    await page.goto("/");
    await page.getByRole("button", { name: "Task Impact" }).click();

    await expect(
      page.getByText("Unable to load construction tasks.")
    ).toBeVisible();
  });

  test("shows an error when supplier loading fails", async ({ page }) => {
    await page.route(
      "**/api/projects/project-lagos-office-001/suppliers",
      (route) =>
        route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Database unavailable" }),
        })
    );

    await page.goto("/");
    await page.getByRole("button", { name: "Supply Impact" }).click();

    await expect(
      page.getByText("Unable to load project suppliers.")
    ).toBeVisible();
  });

  test("shows an error when graph loading fails", async ({ page }) => {
    await page.route(
      "**/api/projects/project-lagos-office-001/graph",
      (route) =>
        route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Database unavailable" }),
        })
    );

    await page.goto("/");
    await page.getByRole("button", { name: "Graph Explorer" }).click();

    await expect(
      page.getByRole("heading", { name: "Graph unavailable" })
    ).toBeVisible();
  });

  test("keeps all navigation actions available on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Impact" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Suppliers" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Graph" })).toBeVisible();
  });
});

test("opens graph explorer and loads the project graph", async ({ page }) => {
  await page.goto("/");

  const graphResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/projects/project-lagos-office-001/graph")
  );

  await page.getByRole("button", { name: "Graph Explorer" }).click();

  const graphResponse = await graphResponsePromise;
  expect(graphResponse.status()).toBe(200);

  await expect(
    page.getByRole("heading", { name: "Graph Explorer" })
  ).toBeVisible();

  await expect(
    page.getByText("Loading project graph...")
  ).toBeHidden({ timeout: 15000 });

  await expect(
    page.locator(".react-flow")
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByText("Foundation Concrete")
  ).toBeVisible();

  await page.getByText("Foundation Concrete").click();

  await expect(page.getByText("Loading node details...")).toBeHidden({
    timeout: 15000,
  });
  await expect(page.getByRole("heading", { name: "Properties" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Relationships" })).toBeVisible();
});