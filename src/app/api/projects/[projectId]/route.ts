import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetProjectOverview } from "@/application/projects/get-project-overview";

const projectIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ projectId: string }>;
  }
) {
  try {
    const { projectId } = await context.params;

    const parsed = projectIdSchema.safeParse(projectId);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid project identifier.",
        },
        { status: 400 }
      );
    }

    const useCase = new GetProjectOverview(
      getProjectRepository()
    );

    const project = await useCase.execute(parsed.data);

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: project,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to retrieve project.",
      },
      { status: 503 }
    );
  }
}