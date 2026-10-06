interface OrderStatusProps {
  label: string;
  status: string;
  icon: string;
}

export function OrderStatus({ label, status, icon }: OrderStatusProps) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="status-card">
      <div className="status-card-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong className={`status ${statusClass}`}>{status}</strong>
      </div>
    </div>
  );
}
