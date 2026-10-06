export interface CheckoutSummaryItem {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface CheckoutOrderSummaryProps {
  items: CheckoutSummaryItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  placingOrder: boolean;
  paymentMethod: "COD" | "ONLINE";
}

export function CheckoutOrderSummary({
  items,
  totalItems,
  subtotal,
  shipping,
  total,
  placingOrder,
  paymentMethod,
}: CheckoutOrderSummaryProps) {
  return (
    <section className="checkout-summary">
      <div className="summary-header">
        <div>
          <span>YOUR ORDER</span>
          <h2>Order Summary</h2>
        </div>

        <span className="summary-count">
          {totalItems} {totalItems === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="checkout-products">
        {items.map((item) => (
          <div className="checkout-product" key={item.id}>
            <div className="checkout-product-image">
              <img
                src={item.imageUrl}
                alt={item.name}
                width="72"
                height="72"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="checkout-product-info">
              <h3>{item.name}</h3>
              <span>Qty: {item.quantity}</span>
              <strong>
                ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-prices">
        <div>
          <span>Subtotal</span>
          <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
        </div>

        <div>
          <span>Shipping</span>
          <strong>{shipping === 0 ? "FREE" : `₹${shipping}`}</strong>
        </div>
      </div>

      {shipping === 0 && (
        <div className="free-shipping-note">
          Free shipping applied on orders above ₹1,999.
        </div>
      )}

      <div className="summary-total">
        <span>Total</span>
        <strong>₹{total.toLocaleString("en-IN")}</strong>
      </div>

      <button
        type="submit"
        className="place-order-button"
        disabled={placingOrder}
      >
        {placingOrder
          ? "PROCESSING..."
          : paymentMethod === "ONLINE"
            ? "PAY SECURELY"
            : "PLACE ORDER"}
      </button>

      <div className="checkout-security">
        <span>🔒</span>
        <p>Your payment and personal information are securely protected.</p>
      </div>
    </section>
  );
}
