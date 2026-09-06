import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetSupplierImpact } from "@/application/impact/get-supplier-impact";

const supplierIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);

const projectIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);

export async function GET(
  request: Request,
  context: {
    params: Promise<{ supplierId: string }>;
  }
) {
  try {
    const { supplierId } = await context.params;

    const parsedSupplierId =
      supplierIdSchema.safeParse(supplierId);

    if (!parsedSupplierId.success) {
      return NextResponse.json(
        {
          error: "Invalid supplier identifier.",
        },
        { status: 400 }
      );
    }

    const projectId = new URL(request.url).searchParams.get(
      "projectId"
    );

    const parsedProjectId =
      projectIdSchema.safeParse(projectId);

    if (!parsedProjectId.success) {
      return NextResponse.json(
        {
          error: "A valid project identifier is required.",
        },
        { status: 400 }
      );
    }

    const useCase = new GetSupplierImpact(
      getProjectRepository()
    );

    const result = await useCase.execute(
      parsedProjectId.data,
      parsedSupplierId.data
    );

    if (!result) {
      return NextResponse.json(
        {
          error: "Supplier not found in project.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to calculate supplier impact.",
      },
      { status: 503 }
    );
  }
}