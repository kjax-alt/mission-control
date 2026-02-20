# Agent Status Integration - Implementation Guide

## Overview

This integration enables real-time tracking of agent status in Mission Control. When agents spawn in OpenClaw, their status is immediately reflected on the dashboard, and as they complete tasks, their status updates live.

## Architecture

### 1. Convex Backend (Database Layer)

**Schema Files:** `convex/schema.ts`, `convex/agents.ts`

**Tables:**
- `agents`: Stores agent metadata and current status
  - Fields: `id`, `name`, `role`, `avatar`, `status`, `currentTask`, `lastUpdated`
  - Indices: `by_status`, `by_name`
  
- `tasks`: Tracks individual tasks assigned to agents
  - Fields: `agentId`, `description`, `status`, `createdAt`, `updatedAt`
  - Indices: `by_agent`, `by_status`

**Mutations Available:**
- `updateAgentStatus(agentId, status, currentTask)` - Update agent status
- `createTask(agentId, description)` - Create a task for an agent
- `createAgent(name, role, avatar)` - Register a new agent
- `updateTaskStatus(taskId, status)` - Update task progress

**Queries Available:**
- `listAgents()` - Get all agents
- `getAgentStatus(agentId)` - Get single agent status
- `getAgentTasks(agentId)` - Get tasks for an agent

### 2. Frontend Services

#### `lib/agent-status.ts`
Client-side service providing convenient functions for agent status management:

```typescript
// Update agent status
await updateAgentStatus(fetch, agentId, "working", "Building features");

// Mark agent as working on a task
await markAgentWorking(fetch, agentId, "Implementing dashboard");

// Mark agent as idle
await markAgentIdle(fetch, agentId);

// Mark agent as blocked
await markAgentBlocked(fetch, agentId, "Waiting for API response");
```

#### `lib/openclaw-agent-bridge.ts`
Integration bridge for capturing OpenClaw agent lifecycle events:

```typescript
// When agent spawns
await handleAgentSpawn(fetch, {
  agentId: "agent123",
  agentName: "Codesmith",
  taskDescription: "Building feature X",
  timestamp: Date.now(),
});

// When agent completes
await handleAgentCompletion(fetch, {
  agentId: "agent123",
  result: "Feature X built successfully",
  timestamp: Date.now(),
});

// When agent errors
await handleAgentError(fetch, {
  agentId: "agent123",
  error: "API rate limit exceeded",
  timestamp: Date.now(),
});
```

### 3. Frontend UI

#### `components/agents/OfficeContainer.tsx`
Main dashboard component with real-time updates:
- Subscribes to `api.agents.listAgents` for live updates
- Displays agent statistics (total, working, idle, blocked)
- Shows last update timestamp
- Sorts agents by status priority (working first)

#### `components/agents/AgentCard.tsx`
Individual agent card component:
- Visual status indicators (colored borders, animated dots)
- Current task display
- Last updated timestamp
- Responsive design with hover effects

### 4. API Route

#### `app/api/convex/route.ts`
REST endpoint for calling Convex functions from the frontend:
```
POST /api/convex
{
  "action": "updateAgentStatus",
  "args": { "agentId": "...", "status": "working", "currentTask": "..." }
}
```

## Integration Points

### For OpenClaw

When spawning agents, hook into the agent lifecycle:

```typescript
import {
  handleAgentSpawn,
  handleAgentCompletion,
  handleAgentError,
  registerAgent,
} from "@/lib/openclaw-agent-bridge";

// 1. Register agent at creation time
const agentId = await registerAgent(
  fetch,
  "agent123",
  "Codesmith",
  "Developer Agent",
  "💻"
);

// 2. On spawn, update status
await handleAgentSpawn(fetch, {
  agentId: "agent123",
  agentName: "Codesmith",
  taskDescription: "Your task here",
  timestamp: Date.now(),
});

// 3. On completion, mark idle
await handleAgentCompletion(fetch, {
  agentId: "agent123",
  timestamp: Date.now(),
});

// 4. On error, mark blocked
await handleAgentError(fetch, {
  agentId: "agent123",
  error: "Error message",
  timestamp: Date.now(),
});
```

### Status States

- **idle**: Agent is ready, not currently working
- **working**: Agent is actively processing a task
- **blocked**: Agent encountered an error or is waiting for external input

### Data Flow

```
OpenClaw Agent Lifecycle
    ↓
handleAgentSpawn/Completion/Error
    ↓
/api/convex endpoint
    ↓
Convex Mutation/Query
    ↓
Database Update
    ↓
Real-time Subscription
    ↓
OfficeContainer Component
    ↓
Live Dashboard Update
```

## Setting Up

### Environment Variables

Ensure `.env.local` contains:
```
NEXT_PUBLIC_CONVEX_URL=your-convex-url
```

### Running the Dashboard

```bash
cd mission-control
npm run dev
```

The dashboard will be available at `http://localhost:3000` and will show real-time agent status updates.

## Logging

All integrations include comprehensive logging:

- `[AgentStatus]` - Service-level logging
- `[OpenClaw-Bridge]` - Bridge integration logging
- `[API]` - API route logging

Enable debug logs by checking browser console and server logs.

## Next Steps for Kyle

1. **Connect OpenClaw events**: Integrate the bridge into OpenClaw's agent spawning system
2. **Create sample agents**: Add test agents to verify the dashboard updates
3. **Add more metrics**: Extend with task duration, completion rate, etc.
4. **Add webhooks**: Send notifications when agents change status
5. **Deploy**: Push to production and enable real-time monitoring

## Files Modified/Created

- ✅ `convex/schema.ts` - Already complete
- ✅ `convex/agents.ts` - Extended with updateTaskStatus
- ✅ `lib/agent-status.ts` - NEW service layer
- ✅ `lib/openclaw-agent-bridge.ts` - NEW integration layer
- ✅ `components/agents/OfficeContainer.tsx` - Updated for real-time subscriptions
- ✅ `components/agents/AgentCard.tsx` - Enhanced with better UI
- ✅ `app/api/convex/route.ts` - NEW API endpoint
