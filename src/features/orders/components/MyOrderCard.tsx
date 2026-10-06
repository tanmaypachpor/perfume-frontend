import type { Order } from "@/features/orders/types/orderTypes";

interface MyOrderCardProps {
  order: Order;
  onViewOrder: (orderId: string) => void;
}

const formatOrderId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const getStatusClass = (status: string) =>
  status.toLowerCase().replace(/\s+/g, "-");

export function MyOrderCard({ order, onViewOrder }: MyOrderCardProps) {
  return (
    <div className="order-card">
      <div className="order-card-top">
        <div>
          <span className="order-label">ORDER</span>
          <h2>{formatOrderId(order.id)}</h2>
        </div>
        <div className="order-date">{formatDate(order.created_at)}</div>
      </div>

      <div className="order-divider" />

      <div className="my-order-items">
        {order.items.length > 0 ? (
          order.items.map((item, index) => (
            <div
              className="my-order-item"
              key={item.id || `${order.id}-${item.product_id}-${index}`}
            >
              <div className="my-order-item-info">
                <span className="my-order-item-category">FRAGRANCE</span>
                <h3>{item.product_name}</h3>
                <p>QTY: {item.quantity}</p>
              </div>
              <strong>
                {formatCurrency(item.price * item.quantity, order.currency)}
              </strong>
            </div>
          ))
        ) : (
          <p className="no-order-items">Order items unavailable.</p>
        )}
      </div>

      <div className="order-divider" />

      <div className="order-info">
        <div className="order-info-item">
          <span>SUBTOTAL</span>
          <strong>{formatCurrency(order.subtotal, order.currency)}</strong>
        </div>
        <div className="order-info-item">
          <span>SHIPPING</span>
          <strong>
            {order.shipping === 0
              ? "FREE"
              : formatCurrency(order.shipping, order.currency)}
          </strong>
        </div>
        <div className="order-info-item">
          <span>TOTAL</span>
          <strong>{formatCurrency(order.total, order.currency)}</strong>
        </div>
        <div className="order-info-item">
          <span>PAYMENT</span>
          <strong className={`status ${getStatusClass(order.payment_status)}`}>
            {order.payment_status}
          </strong>
        </div>
        <div className="order-info-item">
          <span>ORDER STATUS</span>
          <strong className={`status ${getStatusClass(order.order_status)}`}>
            {order.order_status}
          </strong>
        </div>
      </div>

      <div className="order-card-bottom">
        <span>
          {order.items.length} {order.items.length === 1 ? "ITEM" : "ITEMS"}
        </span>
        <button type="button" onClick={() => onViewOrder(order.id)}>
          VIEW ORDER →
        </button>
      </div>
    </div>
  );
}
