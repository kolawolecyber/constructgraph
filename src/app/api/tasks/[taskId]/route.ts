import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetTaskImpact } from "@/application/impact/get-task-impact";

const taskIdSchema = z
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
    params: Promise<{ taskId: string }>;
  }
) {
  try {
    const { taskId } = await context.params;

    const parsedTaskId = taskIdSchema.safeParse(taskId);

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: "Invalid task identifier." },
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
        { error: "A valid project identifier is required." },
        { status: 400 }
      );
    }

    const useCase = new GetTaskImpact(
      getProjectRepository()
    );

    const result = await useCase.execute(
      parsedProjectId.data,
      parsedTaskId.data
    );

    if (!result) {
      return NextResponse.json(
        { error: "Task not found in project." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to calculate task impact.",
      },
      { status: 503 }
    );
  }
}