interface CheckoutPaymentMethodProps {
  paymentMethod: "COD" | "ONLINE";
  onPaymentMethodChange: (method: "COD" | "ONLINE") => void;
}

export function CheckoutPaymentMethod({
  paymentMethod,
  onPaymentMethodChange,
}: CheckoutPaymentMethodProps) {
  return (
    <section className="checkout-card">
      <div className="checkout-section-title">
        <span>03</span>
        <div>
          <h2>Payment Method</h2>
          <p>Choose how you want to pay.</p>
        </div>
      </div>

      <div className="payment-methods">
        <label
          className={`payment-option ${
            paymentMethod === "ONLINE" ? "selected" : ""
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            onChange={() => onPaymentMethodChange("ONLINE")}
          />
          <div className="payment-option-content">
            <div>
              <strong>Online Payment</strong>
              <span>Pay securely using Razorpay</span>
            </div>
            <span className="payment-radio"></span>
          </div>
        </label>

        <label
          className={`payment-option ${
            paymentMethod === "COD" ? "selected" : ""
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={() => onPaymentMethodChange("COD")}
          />
          <div className="payment-option-content">
            <div>
              <strong>Cash on Delivery</strong>
              <span>Pay when your order arrives</span>
            </div>
            <span className="payment-radio"></span>
          </div>
        </label>
      </div>
    </section>
  );
}
