import type { OrderItem } from "@/features/orders/types/orderTypes";

interface OrderItemsListProps {
  orderId: string;
  items: OrderItem[];
  currency: string;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export function OrderItemsList({
  orderId,
  items,
  currency,
}: OrderItemsListProps) {
  return (
    <section className="order-items-section">
      <div className="section-heading">
        <div>
          <span>YOUR PURCHASE</span>
          <h2>Ordered Items</h2>
        </div>
        <strong>
          {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
        </strong>
      </div>

      <div className="details-items-list">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              className="details-item"
              key={item.id || `${orderId}-${item.product_id}-${index}`}
            >
              <div className="item-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="details-item-info">
                <span>FRAGRANCE</span>
                <h3>{item.product_name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="details-item-price">
                <span>
                  {formatCurrency(item.price, currency)} × {item.quantity}
                </span>
                <strong>
                  {formatCurrency(item.price * item.quantity, currency)}
                </strong>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-items">
            <p>Order items are currently unavailable.</p>
          </div>
        )}
      </div>
    </section>
  );
}
