/**
 * Agent Status Service
 * 
 * Provides a unified interface for updating agent status and task information
 * in Mission Control. Wraps Convex mutations and provides convenient helper functions.
 */

export type AgentStatus = "idle" | "working" | "blocked";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface AgentStatusUpdate {
  agentId: string;
  status: AgentStatus;
  currentTask?: string;
}

export interface TaskUpdate {
  agentId: string;
  description: string;
}

/**
 * Updates an agent's status and current task
 * @param fetch - Fetch function to call Convex mutation
 * @param agentId - ID of the agent to update
 * @param status - New status (idle, working, blocked)
 * @param currentTask - Current task description (optional)
 */
export async function updateAgentStatus(
  fetch: typeof globalThis.fetch,
  agentId: string,
  status: AgentStatus,
  currentTask?: string
): Promise<void> {
  try {
    const response = await fetch("/api/convex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateAgentStatus",
        args: { agentId, status, currentTask },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent status: ${response.statusText}`);
    }

    console.log(`[AgentStatus] Updated ${agentId} to ${status}`, {
      task: currentTask,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[AgentStatus] Error updating agent status:", error);
    throw error;
  }
}

/**
 * Updates or creates a task for an agent
 * @param fetch - Fetch function to call Convex mutation
 * @param agentId - ID of the agent
 * @param taskDescription - Description of the task
 */
export async function updateAgentTask(
  fetch: typeof globalThis.fetch,
  agentId: string,
  taskDescription: string
): Promise<string> {
  try {
    const response = await fetch("/api/convex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createTask",
        args: { agentId, description: taskDescription },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    const taskId = await response.json();
    console.log(`[AgentStatus] Created task for ${agentId}:`, taskDescription);
    return taskId;
  } catch (error) {
    console.error("[AgentStatus] Error creating task:", error);
    throw error;
  }
}

/**
 * Marks an agent as idle (working completed)
 * @param fetch - Fetch function to call Convex mutation
 * @param agentId - ID of the agent to mark idle
 */
export async function markAgentIdle(
  fetch: typeof globalThis.fetch,
  agentId: string
): Promise<void> {
  try {
    await updateAgentStatus(fetch, agentId, "idle", undefined);
    console.log(`[AgentStatus] Marked ${agentId} as idle`);
  } catch (error) {
    console.error(`[AgentStatus] Error marking ${agentId} as idle:`, error);
    throw error;
  }
}

/**
 * Marks an agent as working on a specific task
 * @param fetch - Fetch function to call Convex mutation
 * @param agentId - ID of the agent
 * @param taskDescription - Description of what the agent is working on
 */
export async function markAgentWorking(
  fetch: typeof globalThis.fetch,
  agentId: string,
  taskDescription: string
): Promise<void> {
  try {
    await updateAgentStatus(fetch, agentId, "working", taskDescription);
    await updateAgentTask(fetch, agentId, taskDescription);
    console.log(`[AgentStatus] Marked ${agentId} as working:`, taskDescription);
  } catch (error) {
    console.error(
      `[AgentStatus] Error marking ${agentId} as working:`,
      error
    );
    throw error;
  }
}

/**
 * Marks an agent as blocked (unable to proceed)
 * @param fetch - Fetch function to call Convex mutation
 * @param agentId - ID of the agent
 * @param reason - Reason why the agent is blocked
 */
export async function markAgentBlocked(
  fetch: typeof globalThis.fetch,
  agentId: string,
  reason: string
): Promise<void> {
  try {
    await updateAgentStatus(fetch, agentId, "blocked", reason);
    console.log(`[AgentStatus] Marked ${agentId} as blocked:`, reason);
  } catch (error) {
    console.error(`[AgentStatus] Error marking ${agentId} as blocked:`, error);
    throw error;
  }
}
