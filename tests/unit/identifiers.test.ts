import { describe, expect, it } from "vitest";

import {
  entityIdSchema,
  projectIdSchema,
} from "../../src/lib/validation/identifiers";

describe("projectIdSchema", () => {
  it("accepts safe project identifiers", () => {
    expect(projectIdSchema.safeParse("project-lagos-office-001").success).toBe(
      true
    );
  });

  it("trims surrounding whitespace", () => {
    const result = projectIdSchema.safeParse(" project-1 ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("project-1");
    }
  });

  it("rejects unsafe or oversized identifiers", () => {
    expect(projectIdSchema.safeParse("project bad").success).toBe(false);
    expect(projectIdSchema.safeParse("a".repeat(101)).success).toBe(false);
  });
});

describe("entityIdSchema", () => {
  it("accepts task, material, and supplier-style identifiers", () => {
    expect(entityIdSchema.safeParse("task-foundation-001").success).toBe(true);
    expect(entityIdSchema.safeParse("material-cement-001").success).toBe(true);
    expect(entityIdSchema.safeParse("supplier-steel-001").success).toBe(true);
  });

  it("rejects empty, spaced, and oversized identifiers", () => {
    expect(entityIdSchema.safeParse("").success).toBe(false);
    expect(entityIdSchema.safeParse("task bad").success).toBe(false);
    expect(entityIdSchema.safeParse("a".repeat(151)).success).toBe(false);
  });
});
