import { Bot, User, ShieldAlert, Clock, ImageIcon } from "lucide-react";

export default function EventTimeline({ timelines = [] }) {
  if (!timelines || timelines.length === 0) {
    return (
      <div className="mono-code" style={{ padding: "1rem", color: "var(--text-muted)" }}>
        NO EVENT MILESTONES LOGGED FOR THIS INCIDENT RECORD.
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {timelines.map((item) => {
        let IconComp = Bot;
        if (item.actor_type === "authority") IconComp = ShieldAlert;
        if (item.actor_type === "user") IconComp = User;

        return (
          <div
            key={item.timeline_id}
            className={`timeline-item ${item.actor_type || "system"}`}
          >
            <div className="timeline-badge" />
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-actor" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <IconComp size={12} />
                  <span>{item.actor_name || item.actor_type.toUpperCase()}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} />
                  {item.created_at
                    ? new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "LOGGED"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-primary)" }}>
                {item.description}
              </p>
              {item.image_url && (
                <div style={{ marginTop: "8px" }}>
                  <img
                    src={`http://127.0.0.1:8000${item.image_url}`}
                    alt="Evidence attachment"
                    style={{
                      maxHeight: "160px",
                      borderRadius: "2px",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
