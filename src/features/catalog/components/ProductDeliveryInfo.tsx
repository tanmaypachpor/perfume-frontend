export function ProductDeliveryInfo() {
  return (
    <>
      <section className="delivery-section">
        <div className="premium-section-heading">
          <span>DELIVERY</span>
          <h2>Before You Order</h2>
        </div>

        <div className="delivery-grid">
          <div className="delivery-card">
            <span>✓</span>
            <h3>Secure Packaging</h3>
            <p>Each order is packed carefully before dispatch.</p>
          </div>

          <div className="delivery-card">
            <span>→</span>
            <h3>Order Dispatch</h3>
            <p>
              Your order is prepared and dispatched after confirmation.
            </p>
          </div>

          <div className="delivery-card">
            <span>◇</span>
            <h3>Secure Checkout</h3>
            <p>
              Complete your purchase through our secure checkout process.
            </p>
          </div>
        </div>
      </section>

      <section className="product-brand-note">
        <div>
          <span>KEIAN</span>
          <p>
            Fragrance made for everyday moments and occasions worth
            remembering.
          </p>
        </div>
      </section>
    </>
  );
}
