"use client";

interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "idle" | "working" | "blocked";
  currentTask?: string;
  timestamp?: string;
}

export default function AgentCard({
  name,
  role,
  avatar,
  status,
  currentTask,
  timestamp,
}: AgentCardProps) {
  return (
    <div className="agent-card">
      <div className="agent-avatar">{avatar}</div>

      <h3 className="text-lg font-bold mb-1">{name}</h3>
      <p className="text-sm text-slate-400 mb-4">{role}</p>

      <div className="mb-4">
        <span className={`status-badge status-${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {currentTask && (
        <div className="mt-4 p-3 bg-slate-800 rounded text-sm">
          <p className="text-slate-300 font-semibold mb-1">Current Task:</p>
          <p className="text-slate-400">{currentTask}</p>
        </div>
      )}

      {timestamp && (
        <p className="text-xs text-slate-500 mt-3">Last updated: {timestamp}</p>
      )}
    </div>
  );
}
