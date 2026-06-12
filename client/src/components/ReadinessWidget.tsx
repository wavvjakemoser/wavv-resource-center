import { useState } from "react";
import { CheckCircle2, Circle, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type Page = "academy" | "webinars" | "guides" | "playground" | "support";

const PAGE_LABELS: Record<Page, string> = {
  academy: "WAVV Academy",
  webinars: "WAVV Webinars",
  guides: "Resource Hub",
  playground: "Playground",
  support: "Support",
};

interface Props {
  page: Page;
}

export function ReadinessWidget({ page }: Props) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Only render for admins and super admins
  if (!user || (user.role !== "viewer" && user.role !== "publisher" && user.role !== "partner_manager" && user.role !== "owner")) return null;

  return <ReadinessWidgetInner page={page} expanded={expanded} setExpanded={setExpanded} />;
}

function ReadinessWidgetInner({
  page,
  expanded,
  setExpanded,
}: {
  page: Page;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.readiness.getItems.useQuery({ page });

  const toggleMutation = trpc.readiness.toggleItem.useMutation({
    onMutate: async ({ id, checked }) => {
      await utils.readiness.getItems.cancel({ page });
      const prev = utils.readiness.getItems.getData({ page });
      utils.readiness.getItems.setData({ page }, (old) =>
        old ? old.map((item) => (item.id === id ? { ...item, checked } : item)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.readiness.getItems.setData({ page }, ctx.prev);
    },
    onSettled: () => {
      utils.readiness.getItems.invalidate({ page });
    },
  });

  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const progressColor =
    pct === 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        fontFamily: "inherit",
      }}
    >
      {/* Expanded panel */}
      {expanded && (
        <div
          style={{
            background: "rgba(10, 15, 30, 0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "0.75rem",
            padding: "1rem",
            marginBottom: "0.5rem",
            width: "320px",
            maxHeight: "420px",
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: "0.1rem" }}>
                Launch Readiness
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                {PAGE_LABELS[page]}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: progressColor }}>
                {pct}%
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                {done}/{total} done
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginBottom: "0.875rem", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: progressColor,
                borderRadius: "2px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Checklist items */}
          {isLoading ? (
            <div style={{ color: "#6b7280", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleMutation.mutate({ id: item.id, checked: !item.checked })}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.375rem 0.5rem",
                    borderRadius: "0.375rem",
                    textAlign: "left",
                    transition: "background 0.15s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ flexShrink: 0, marginTop: "1px" }}>
                    {item.checked ? (
                      <CheckCircle2 size={15} color="#22c55e" />
                    ) : (
                      <Circle size={15} color="#4b5563" />
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: item.checked ? "#6b7280" : "#d1d5db",
                      textDecoration: item.checked ? "line-through" : "none",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating pill trigger */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(10, 15, 30, 0.95)",
          border: `1px solid ${progressColor}`,
          borderRadius: "2rem",
          padding: "0.45rem 0.875rem",
          cursor: "pointer",
          boxShadow: `0 0 12px ${progressColor}40`,
          transition: "all 0.2s ease",
          marginLeft: "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 20px ${progressColor}70`;
          e.currentTarget.style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 12px ${progressColor}40`;
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <ClipboardList size={14} color={progressColor} />
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: progressColor }}>
          {done}/{total} Ready
        </span>
        {expanded ? (
          <ChevronDown size={12} color={progressColor} />
        ) : (
          <ChevronUp size={12} color={progressColor} />
        )}
      </button>
    </div>
  );
}
