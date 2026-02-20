import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client (only if URL is available)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(request: Request) {
  if (!convex) {
    return Response.json(
      {
        error:
          "Convex URL not configured. Set NEXT_PUBLIC_CONVEX_URL environment variable.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action, args } = body;

    console.log(`[API] Convex action: ${action}`, args);

    // Route to appropriate Convex function
    let result;
    switch (action) {
      case "updateAgentStatus":
        // Call the mutation directly
        result = await convex.mutation("agents:updateAgentStatus" as any, args);
        break;
      case "createTask":
        result = await convex.mutation("agents:createTask" as any, args);
        break;
      case "createAgent":
        result = await convex.mutation("agents:createAgent" as any, args);
        break;
      case "getAgentStatus":
        result = await convex.query("agents:getAgentStatus" as any, args);
        break;
      case "listAgents":
        result = await convex.query("agents:listAgents" as any, {});
        break;
      case "getAgentTasks":
        result = await convex.query("agents:getAgentTasks" as any, args);
        break;
      case "updateTaskStatus":
        result = await convex.mutation("agents:updateTaskStatus" as any, args);
        break;
      default:
        return Response.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return Response.json(result);
  } catch (error) {
    console.error("[API] Convex error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
