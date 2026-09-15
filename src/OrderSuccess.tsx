import { Link } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const orderData = localStorage.getItem("lastOrder");

  const order = orderData
    ? JSON.parse(orderData)
    : null;

  if (!order) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">!</div>

          <h1>
            Order <em>Not Found</em>
          </h1>

          <p>
            We couldn't find your recent order.
          </p>

          <Link
            to="/products"
            className="success-button"
          >
            CONTINUE SHOPPING
            <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">

      {/* NAVBAR */}
      <header className="success-navbar">

        <Link
          to="/"
          className="success-logo"
        >
          LUMIÈRE
        </Link>

        <span className="success-secure">
          ✦ SECURE ORDER
        </span>

      </header>

      {/* MAIN */}
      <main className="success-container">

        <div className="success-card">

          {/* SUCCESS ICON */}
          <div className="success-icon">
            ✓
          </div>

          <span className="success-label">
            ORDER CONFIRMED
          </span>

          <h1>
            Thank You, <em>{order.customer.name}</em>
          </h1>

          <p className="success-message">
            Your Lumière order has been successfully
            placed. We will deliver your fragrance
            to the address provided.
          </p>

          {/* ORDER ID */}
          <div className="order-number">

            <span>
              ORDER NUMBER
            </span>

            <strong>
              {order.orderId}
            </strong>

          </div>

          {/* ORDER DETAILS */}
          <div className="success-details">

            <div className="detail-row">
              <span>
                ITEMS
              </span>

              <strong>
                {order.totalItems}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                PAYMENT
              </span>

              <strong>
                {order.paymentMethod}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                SHIPPING
              </span>

              <strong>
                {order.shipping === 0
                  ? "FREE"
                  : `₹${order.shipping}`}
              </strong>
            </div>

            <div className="detail-row total-row">
              <span>
                TOTAL
              </span>

              <strong>
                ₹{order.total.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

          {/* DELIVERY */}
          <div className="delivery-box">

            <span className="delivery-icon">
              ✦
            </span>

            <div>
              <strong>
                DELIVERY ADDRESS
              </strong>

              <p>
                {order.customer.address}
                <br />
                {order.customer.city},{" "}
                {order.customer.state}
                <br />
                {order.customer.pincode}
              </p>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="success-actions">

            <Link
              to="/products"
              className="success-button"
            >
              CONTINUE SHOPPING
              <span>→</span>
            </Link>

            <Link
              to="/"
              className="home-button"
            >
              BACK TO HOME
            </Link>

          </div>

          <p className="success-footer-text">
            A confirmation has been recorded for
            your order.
          </p>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="success-footer">

        <div>
          LUMIÈRE
        </div>

        <p>
          The art of fragrance, captured in a bottle.
        </p>

        <span>
          © 2026 LUMIÈRE. ALL RIGHTS RESERVED.
        </span>

      </footer>

    </div>
  );
}

export default OrderSuccess;
