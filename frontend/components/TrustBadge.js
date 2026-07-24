import { Bot, Users, ShieldCheck } from "lucide-react";

export default function TrustBadge({ status = "AI Detected", score = 60 }) {
  let badgeClass = "ai";
  let label = "AI-DET";
  let IconComponent = Bot;

  if (status === "Community Confirmed") {
    badgeClass = "community";
    label = "COMM-CONF";
    IconComponent = Users;
  } else if (status === "Authority Verified") {
    badgeClass = "authority";
    label = "AUTH-VERIF";
    IconComponent = ShieldCheck;
  }

  return (
    <span className={`trust-badge ${badgeClass}`}>
      <IconComponent size={12} />
      <span>{label}</span>
      <span style={{ opacity: 0.75 }}>[{score}%]</span>
    </span>
  );
}
