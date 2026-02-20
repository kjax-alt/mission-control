"use client";

interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "idle" | "working" | "blocked";
  currentTask?: string;
  lastUpdated?: string;
}

const statusConfig = {
  idle: {
    bg: "bg-blue-900 bg-opacity-20",
    border: "border-blue-500 border-opacity-50",
    badge: "bg-blue-600 text-blue-100",
    dot: "bg-blue-500",
    label: "Idle",
  },
  working: {
    bg: "bg-green-900 bg-opacity-20",
    border: "border-green-500 border-opacity-50",
    badge: "bg-green-600 text-green-100",
    dot: "bg-green-500 animate-pulse",
    label: "Working",
  },
  blocked: {
    bg: "bg-red-900 bg-opacity-20",
    border: "border-red-500 border-opacity-50",
    badge: "bg-red-600 text-red-100",
    dot: "bg-red-500",
    label: "Blocked",
  },
};

export default function AgentCard({
  id,
  name,
  role,
  avatar,
  status,
  currentTask,
  lastUpdated,
}: AgentCardProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300
        ${config.bg} ${config.border}
        hover:shadow-lg hover:shadow-slate-600 hover:scale-105
      `}
    >
      {/* Status indicator dot */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${config.dot}`}></div>
      </div>

      {/* Agent avatar */}
      <div className="text-5xl mb-4">{avatar}</div>

      {/* Agent name */}
      <h3 className="text-lg font-bold text-slate-100 mb-1 pr-8">{name}</h3>

      {/* Agent role */}
      <p className="text-sm text-slate-400 mb-4">{role}</p>

      {/* Status badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
          {config.label}
        </span>
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="mt-4 p-3 bg-slate-800 bg-opacity-50 rounded border border-slate-700 text-sm">
          <p className="text-slate-300 font-semibold mb-1 text-xs uppercase tracking-wide">
            Current Task
          </p>
          <p className="text-slate-300 line-clamp-3 leading-relaxed">
            {currentTask}
          </p>
        </div>
      )}

      {/* Last updated timestamp */}
      {lastUpdated && (
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <span className="inline-block">🕐</span>
          <span>Updated: {lastUpdated}</span>
        </p>
      )}

      {/* ID (debugging) */}
      <p className="text-xs text-slate-600 mt-2 font-mono break-all">{id}</p>
    </div>
  );
}
