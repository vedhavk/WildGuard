export default function EventTimeline({ timelines = [] }) {
  if (!timelines || timelines.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        No timeline entries recorded for this event yet.
      </p>
    );
  }

  return (
    <div className="timeline-container">
      {timelines.map((item) => (
        <div
          key={item.timeline_id}
          className={`timeline-item ${item.actor_type || "system"}`}
        >
          <div className="timeline-badge" />
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-actor">
                {item.actor_name || item.actor_type.toUpperCase()}
              </span>
              <span>
                {item.created_at
                  ? new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{item.description}</p>
            {item.image_url && (
              <img
                src={`http://127.0.0.1:8000${item.image_url}`}
                alt="Evidence"
                style={{
                  marginTop: "10px",
                  maxHeight: "180px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
