export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon">
            <Icon size={17} />
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
}