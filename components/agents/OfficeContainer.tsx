"use client";

import { useEffect, useState } from "react";
import AgentCard from "./AgentCard";

interface Agent {
  _id: string;
  id?: string;
  name: string;
  role: string;
  avatar: string;
  status: "idle" | "working" | "blocked";
  currentTask?: string;
  lastUpdated: number;
}

export default function OfficeContainer() {
  const [displayedAgents, setDisplayedAgents] = useState<Agent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/convex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "listAgents",
            args: {},
          }),
        });

        if (response.ok) {
          const agents = await response.json();
          // Sort agents by status (working first, then idle, then blocked)
          const sorted = [...agents].sort((a: Agent, b: Agent) => {
            const statusPriority: Record<string, number> = { working: 0, idle: 1, blocked: 2 };
            return (
              (statusPriority[a.status] || 3) -
              (statusPriority[b.status] || 3)
            );
          });
          setDisplayedAgents(sorted);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchAgents, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate agent statistics
  const stats = {
    total: displayedAgents.length,
    working: displayedAgents.filter((a) => a.status === "working").length,
    idle: displayedAgents.filter((a) => a.status === "idle").length,
    blocked: displayedAgents.filter((a) => a.status === "blocked").length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-700 p-6 sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-100">Mission Control</h1>
            <p className="text-slate-400 mt-2">
              Real-time Agent Status Dashboard
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-300 text-sm mb-3">
              Last updated: <span className="font-mono">{lastUpdate}</span>
            </p>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="bg-slate-800 p-2 rounded">
                <p className="text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-100">
                  {stats.total}
                </p>
              </div>
              <div className="bg-green-900 bg-opacity-30 p-2 rounded">
                <p className="text-green-400">Working</p>
                <p className="text-2xl font-bold text-green-300">
                  {stats.working}
                </p>
              </div>
              <div className="bg-blue-900 bg-opacity-30 p-2 rounded">
                <p className="text-blue-400">Idle</p>
                <p className="text-2xl font-bold text-blue-300">{stats.idle}</p>
              </div>
              <div className="bg-red-900 bg-opacity-30 p-2 rounded">
                <p className="text-red-400">Blocked</p>
                <p className="text-2xl font-bold text-red-300">
                  {stats.blocked}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin mb-3">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full"></div>
              </div>
              <p className="text-slate-400">Loading agents...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedAgents.length > 0 ? (
              displayedAgents.map((agent) => (
                <AgentCard
                  key={agent._id}
                  id={agent._id}
                  name={agent.name}
                  role={agent.role}
                  avatar={agent.avatar}
                  status={agent.status}
                  currentTask={agent.currentTask}
                  lastUpdated={new Date(agent.lastUpdated).toLocaleTimeString()}
                />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-slate-400 text-lg mb-2">
                    No agents available
                  </p>
                  <p className="text-slate-500 text-sm">
                    Agents will appear here when they connect to Mission Control
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Live status indicator */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-slate-300 text-sm">Live</span>
      </div>
    </div>
  );
}
