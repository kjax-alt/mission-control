/**
 * OpenClaw Agent Bridge
 *
 * Integrates OpenClaw agent lifecycle with Mission Control status tracking.
 * Captures agent spawn/completion/error events and updates the dashboard in real-time.
 *
 * This module provides hooks for:
 * - Capturing agent spawn events (sets agent to "working")
 * - Capturing agent completion events (sets agent to "idle")
 * - Capturing agent error events (sets agent to "blocked")
 * - Bidirectional sync between OpenClaw and Mission Control
 */

import {
  markAgentWorking,
  markAgentIdle,
  markAgentBlocked,
} from "./agent-status";

export interface AgentSpawnPayload {
  agentId: string;
  agentName: string;
  taskDescription: string;
  timestamp: number;
}

export interface AgentCompletionPayload {
  agentId: string;
  result?: string;
  timestamp: number;
}

export interface AgentErrorPayload {
  agentId: string;
  error: string;
  timestamp: number;
}

/**
 * Logger for OpenClaw agent events
 */
const log = {
  spawn: (payload: AgentSpawnPayload) => {
    console.log("[OpenClaw-Bridge] Agent spawned:", {
      agentId: payload.agentId,
      agentName: payload.agentName,
      task: payload.taskDescription,
      timestamp: new Date(payload.timestamp).toISOString(),
    });
  },
  complete: (payload: AgentCompletionPayload) => {
    console.log("[OpenClaw-Bridge] Agent completed:", {
      agentId: payload.agentId,
      timestamp: new Date(payload.timestamp).toISOString(),
    });
  },
  error: (payload: AgentErrorPayload) => {
    console.error("[OpenClaw-Bridge] Agent error:", {
      agentId: payload.agentId,
      error: payload.error,
      timestamp: new Date(payload.timestamp).toISOString(),
    });
  },
};

/**
 * Handles agent spawn events - marks agent as "working"
 * Called when a new agent is spawned by OpenClaw
 *
 * @param fetch - Fetch function for API calls
 * @param payload - Agent spawn payload containing ID and task
 */
export async function handleAgentSpawn(
  fetch: typeof globalThis.fetch,
  payload: AgentSpawnPayload
): Promise<void> {
  try {
    log.spawn(payload);

    // Update agent status to "working" with task description
    await markAgentWorking(
      fetch,
      payload.agentId,
      payload.taskDescription
    );

    console.log("[OpenClaw-Bridge] Successfully marked agent as working");
  } catch (error) {
    console.error("[OpenClaw-Bridge] Error handling agent spawn:", error);
    // Don't throw - we don't want to fail the agent spawn if tracking fails
  }
}

/**
 * Handles agent completion events - marks agent as "idle"
 * Called when an agent completes its work
 *
 * @param fetch - Fetch function for API calls
 * @param payload - Agent completion payload
 */
export async function handleAgentCompletion(
  fetch: typeof globalThis.fetch,
  payload: AgentCompletionPayload
): Promise<void> {
  try {
    log.complete(payload);

    // Update agent status to "idle"
    await markAgentIdle(fetch, payload.agentId);

    console.log("[OpenClaw-Bridge] Successfully marked agent as idle");
  } catch (error) {
    console.error("[OpenClaw-Bridge] Error handling agent completion:", error);
    // Don't throw - we don't want to fail the agent completion if tracking fails
  }
}

/**
 * Handles agent error events - marks agent as "blocked"
 * Called when an agent encounters an error
 *
 * @param fetch - Fetch function for API calls
 * @param payload - Agent error payload
 */
export async function handleAgentError(
  fetch: typeof globalThis.fetch,
  payload: AgentErrorPayload
): Promise<void> {
  try {
    log.error(payload);

    // Update agent status to "blocked" with error message
    await markAgentBlocked(fetch, payload.agentId, payload.error);

    console.log("[OpenClaw-Bridge] Successfully marked agent as blocked");
  } catch (error) {
    console.error("[OpenClaw-Bridge] Error handling agent error:", error);
    // Don't throw - we don't want to fail error handling if tracking fails
  }
}

/**
 * Creates a listener for OpenClaw agent events
 * This would be integrated with OpenClaw's WebSocket or event system
 *
 * @param fetch - Fetch function for API calls
 * @returns Object with event handler functions
 */
export function createAgentEventListener(fetch: typeof globalThis.fetch) {
  return {
    onSpawn: (payload: AgentSpawnPayload) =>
      handleAgentSpawn(fetch, payload),
    onComplete: (payload: AgentCompletionPayload) =>
      handleAgentCompletion(fetch, payload),
    onError: (payload: AgentErrorPayload) =>
      handleAgentError(fetch, payload),
  };
}

/**
 * Middleware for intercepting agent lifecycle events
 * Can be used in OpenClaw's agent spawning system
 *
 * @param fetch - Fetch function for API calls
 */
export function createAgentLifecycleMiddleware(fetch: typeof globalThis.fetch) {
  return {
    /**
     * Hook called before agent spawns
     */
    beforeSpawn: async (agentConfig: any) => {
      console.log("[OpenClaw-Bridge] beforeSpawn hook:", agentConfig);
      return agentConfig;
    },

    /**
     * Hook called after agent spawns successfully
     */
    afterSpawn: async (
      agentConfig: any,
      result: any
    ) => {
      const payload: AgentSpawnPayload = {
        agentId: result.agentId || agentConfig.id,
        agentName: agentConfig.name,
        taskDescription: agentConfig.task || "Assigned task",
        timestamp: Date.now(),
      };

      await handleAgentSpawn(fetch, payload);
      return result;
    },

    /**
     * Hook called when agent completes
     */
    onComplete: async (agentId: string, result: any) => {
      const payload: AgentCompletionPayload = {
        agentId,
        result: JSON.stringify(result),
        timestamp: Date.now(),
      };

      await handleAgentCompletion(fetch, payload);
      return result;
    },

    /**
     * Hook called when agent encounters error
     */
    onError: async (agentId: string, error: Error) => {
      const payload: AgentErrorPayload = {
        agentId,
        error: error.message,
        timestamp: Date.now(),
      };

      await handleAgentError(fetch, payload);
      throw error;
    },
  };
}

/**
 * Registers an agent ID with a name and role
 * Useful for mapping OpenClaw agent IDs to human-readable names
 *
 * @param fetch - Fetch function for API calls
 * @param agentId - ID of the agent
 * @param name - Display name
 * @param role - Role/purpose of the agent
 * @param avatar - Optional emoji avatar
 */
export async function registerAgent(
  fetch: typeof globalThis.fetch,
  agentId: string,
  name: string,
  role: string,
  avatar: string = "🤖"
): Promise<string> {
  try {
    const response = await fetch("/api/convex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createAgent",
        args: { name, role, avatar },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register agent: ${response.statusText}`);
    }

    console.log("[OpenClaw-Bridge] Registered agent:", {
      agentId,
      name,
      role,
    });

    return agentId;
  } catch (error) {
    console.error("[OpenClaw-Bridge] Error registering agent:", error);
    throw error;
  }
}
