interface AdminOrdersToolbarProps {
  search: string;
  statusFilter: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
}

export function AdminOrdersToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AdminOrdersToolbarProps) {
  return (
    <div className="orders-toolbar">
      <div className="search-box">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search customer, email or order ID..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
