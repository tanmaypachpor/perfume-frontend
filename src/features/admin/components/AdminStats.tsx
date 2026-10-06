interface AdminStatsProps {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  formatPrice: (value: number) => string;
}

export function AdminStats({
  totalOrders,
  totalRevenue,
  pendingOrders,
  deliveredOrders,
  formatPrice,
}: AdminStatsProps) {
  return (
    <section className="admin-stats">
      <div className="stat-card">
        <div className="stat-card-top">
          <span>TOTAL ORDERS</span>
          <div className="stat-icon">↗</div>
        </div>
        <strong>{totalOrders}</strong>
        <p>All orders received</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-top">
          <span>TOTAL REVENUE</span>
          <div className="stat-icon">₹</div>
        </div>
        <strong>{formatPrice(totalRevenue)}</strong>
        <p>Across all orders</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-top">
          <span>PENDING</span>
          <div className="stat-icon">◷</div>
        </div>
        <strong>{pendingOrders}</strong>
        <p>Awaiting processing</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-top">
          <span>DELIVERED</span>
          <div className="stat-icon">✓</div>
        </div>
        <strong>{deliveredOrders}</strong>
        <p>Successfully delivered</p>
      </div>
    </section>
  );
}
