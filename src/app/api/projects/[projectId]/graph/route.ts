import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetProjectGraph } from "@/application/projects/get-project-graph";

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
    const { projectId } =
      await context.params;

    const parsed =
      projectIdSchema.safeParse(projectId);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid project identifier.",
        },
        { status: 400 }
      );
    }

    const repository =
      getProjectRepository();

    const useCase =
      new GetProjectGraph(repository);

    const graph =
      await useCase.execute(parsed.data);

    return NextResponse.json({
      data: graph,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to load project graph.",
      },
      { status: 503 }
    );
  }
}