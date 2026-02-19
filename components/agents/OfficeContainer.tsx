"use client";

import AgentCard from "./AgentCard";

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "idle" | "working" | "blocked";
  currentTask?: string;
  timestamp?: string;
}

const AGENTS: Agent[] = [
  {
    id: "1",
    name: "Codesmith",
    role: "Developer Agent",
    avatar: "💻",
    status: "working",
    currentTask: "Building Mission Control dashboard",
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: "2",
    name: "Wordsmith",
    role: "Content Agent",
    avatar: "✍️",
    status: "idle",
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: "3",
    name: "Architect",
    role: "System Design",
    avatar: "📐",
    status: "idle",
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: "4",
    name: "Research",
    role: "Research Agent",
    avatar: "🔍",
    status: "idle",
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: "5",
    name: "DesignMind",
    role: "Design Agent",
    avatar: "🎨",
    status: "idle",
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: "6",
    name: "Auditor",
    role: "Audit Agent",
    avatar: "📋",
    status: "idle",
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: "7",
    name: "Operator",
    role: "Operations",
    avatar: "⚙️",
    status: "idle",
    timestamp: new Date().toLocaleTimeString(),
  },
];

export default function OfficeContainer() {
  return (
    <div>
      <header className="bg-slate-900 border-b border-slate-700 p-6">
        <h1 className="text-3xl font-bold text-slate-100">Mission Control</h1>
        <p className="text-slate-400 mt-2">Real-time Agent Status Dashboard</p>
      </header>

      <main className="office-grid">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} {...agent} />
        ))}
      </main>
    </div>
  );
}
