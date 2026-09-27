// src/components/StatCard.jsx

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        {description && <small>{description}</small>}
      </div>
    </div>
  );
}