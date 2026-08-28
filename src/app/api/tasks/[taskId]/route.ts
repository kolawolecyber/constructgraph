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

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ taskId: string }>;
  }
) {
  try {
    const { taskId } = await context.params;

    const parsed = taskIdSchema.safeParse(taskId);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid task identifier.",
        },
        { status: 400 }
      );
    }

    const useCase = new GetTaskImpact(
      getProjectRepository()
    );

    const result = await useCase.execute(parsed.data);

    if (!result) {
      return NextResponse.json(
        {
          error: "Task not found.",
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
        error: "Unable to calculate task impact.",
      },
      { status: 503 }
    );
  }
}