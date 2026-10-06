interface CartOrderSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  amountRemaining: number;
  shippingProgress: number;
  onCheckout: () => void;
}

const formatPrice = (value: number) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

export function CartOrderSummary({
  subtotal,
  shipping,
  total,
  amountRemaining,
  shippingProgress,
  onCheckout,
}: CartOrderSummaryProps) {
  return (
    <aside className="cart-summary">
      <div className="summary-top">
        <span>ORDER SUMMARY</span>
        <h2>
          Your <em>Order</em>
        </h2>
      </div>

      {shipping > 0 && (
        <div className="shipping-message">
          <p>
            Add <strong>{formatPrice(amountRemaining)}</strong> more for
            complimentary shipping.
          </p>
          <div className="shipping-track">
            <div
              className="shipping-fill"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>
      )}

      {shipping === 0 && subtotal > 0 && (
        <div className="shipping-message shipping-complete">
          <span>✓</span>
          <p>Complimentary shipping has been applied.</p>
        </div>
      )}

      <div className="summary-details">
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>
            {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
          </strong>
        </div>
      </div>

      <div className="summary-total">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <button
        type="button"
        className="checkout-button"
        onClick={onCheckout}
      >
        <span>Proceed to checkout</span>
        <strong>→</strong>
      </button>

      <div className="summary-note">
        <span>KEIAN</span>
        <p>
          Secure checkout · Carefully packed · Complimentary shipping over
          ₹1,999
        </p>
      </div>
    </aside>
  );
}
