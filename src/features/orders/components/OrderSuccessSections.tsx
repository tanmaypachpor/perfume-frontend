interface SuccessOrder {
  customer_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  shipping: number;
  total: number;
}

interface SuccessOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderSuccessSectionsProps {
  order: SuccessOrder;
  items: SuccessOrderItem[];
  paymentText: string;
  paymentStatus: string;
  orderStatus: string;
}

export function OrderSuccessSections({
  order,
  items,
  paymentText,
  paymentStatus,
  orderStatus,
}: OrderSuccessSectionsProps) {
  return (
    <>
      <div className="section-block">
        <div className="section-heading">
          <span>01</span>
          <h2>Order summary</h2>
        </div>

        <div className="summary-list">
          <div className="summary-row">
            <span>{items.length === 1 ? "Item" : "Items"}</span>
            <strong>
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Payment</span>
            <strong>{paymentText}</strong>
          </div>

          <div className="summary-row">
            <span>Payment Status</span>
            <strong>{paymentStatus}</strong>
          </div>

          <div className="summary-row">
            <span>Order Status</span>
            <strong>{orderStatus}</strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <strong>
              {Number(order.shipping) === 0
                ? "Complimentary"
                : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
            </strong>
          </div>

          <div className="summary-row total-row">
            <span>Total</span>
            <strong>
              ₹{Number(order.total).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="section-block">
          <div className="section-heading">
            <span>02</span>
            <h2>Your fragrance</h2>
          </div>

          <div className="summary-list">
            {items.map((item) => (
              <div className="summary-row" key={item.id}>
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <strong>
                  ₹
                  {(Number(item.price) * item.quantity).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-block">
        <div className="section-heading">
          <span>03</span>
          <h2>Delivery details</h2>
        </div>

        <div className="delivery-content">
          <div className="delivery-icon">
            <span>↗</span>
          </div>
          <div className="delivery-info">
            <span className="delivery-label">Delivering to</span>
            <strong>{order.customer_name}</strong>
            <p>
              {order.address}
              <br />
              {order.city}, {order.state}
              <br />
              {order.pincode}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
