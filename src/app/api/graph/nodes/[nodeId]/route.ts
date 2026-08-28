import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetGraphNodeDetails } from "@/application/projects/get-graph-node-details";

const nodeIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(150)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Invalid node identifier."
  );

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      nodeId: string;
    }>;
  }
) {
  try {
    const { nodeId } =
      await context.params;

    const parsed =
      nodeIdSchema.safeParse(nodeId);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid node identifier.",
        },
        { status: 400 }
      );
    }

    const repository =
      getProjectRepository();

    const useCase =
      new GetGraphNodeDetails(repository);

    const node =
      await useCase.execute(parsed.data);

    if (!node) {
      return NextResponse.json(
        {
          error: "Graph node not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: node,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to load graph node details.",
      },
      { status: 503 }
    );
  }
}