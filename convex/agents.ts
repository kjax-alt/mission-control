import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getAgentStatus = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

export const updateAgentStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      status: args.status,
      currentTask: args.currentTask,
      lastUpdated: Date.now(),
    });
  },
});

export const createAgent = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      avatar: args.avatar,
      status: "idle",
      lastUpdated: Date.now(),
    });
    return agentId;
  },
});

export const createTask = mutation({
  args: {
    agentId: v.id("agents"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      agentId: args.agentId,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return taskId;
  },
});

export const getAgentTasks = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
  },
});
