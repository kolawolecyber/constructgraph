import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetTaskImpact } from "@/application/impact/get-task-impact";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      projectId: string;
      taskId: string;
    }>;
  }
) {
  try {
    const { projectId, taskId } = await context.params;

    const parsedProjectId =
      identifierSchema.safeParse(projectId);

    const parsedTaskId =
      identifierSchema.safeParse(taskId);

    if (!parsedProjectId.success) {
      return NextResponse.json(
        { error: "Invalid project identifier." },
        { status: 400 }
      );
    }

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: "Invalid task identifier." },
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
      { error: "Unable to calculate task impact." },
      { status: 503 }
    );
  }
}