export default function TrustBadge({ status = "AI Detected", score = 60 }) {
  let badgeClass = "ai";
  let icon = "🤖";

  if (status === "Community Confirmed") {
    badgeClass = "community";
    icon = "👥";
  } else if (status === "Authority Verified") {
    badgeClass = "authority";
    icon = "🛡️";
  }

  return (
    <span className={`trust-badge ${badgeClass}`}>
      <span>{icon}</span>
      <span>{status}</span>
      <span style={{ opacity: 0.85 }}>({score}%)</span>
    </span>
  );
}
