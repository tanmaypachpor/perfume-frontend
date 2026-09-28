import { Link } from "react-router-dom";
import { Navbar, Footer } from "./App";
import "./OrderSuccess.css";

function OrderSuccess() {
  const orderData = localStorage.getItem("lastOrder");

  const order = orderData ? JSON.parse(orderData) : null;

  /* =========================================================
     ORDER NOT FOUND
  ========================================================= */

  if (!order) {
    return (
      <div className="success-page">

        <Navbar />

        <main className="success-container">

          <section className="success-card not-found-card">

            <div className="confirmation-mark error-mark">
              !
            </div>

            <span className="success-eyebrow">
              ORDER INFORMATION
            </span>

            <h1>
              Order <em>Not Found</em>
            </h1>

            <p className="success-message">
              We couldn't find your recent order.
              Please return to the collection and
              continue shopping.
            </p>

            <Link
              to="/products"
              className="success-button"
            >
              Continue Shopping
              <span>→</span>
            </Link>

          </section>

        </main>

        <Footer />

      </div>
    );
  }


  /* =========================================================
     PAYMENT TEXT
  ========================================================= */

  const paymentText =
    order.paymentMethod === "Online Payment"
      ? "Online Payment"
      : "Cash on Delivery";


  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="success-page">

      {/* =====================================================
          SHARED NAVBAR FROM APP.TSX
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="success-container">

        <section className="success-card">


          {/* =================================================
              CONFIRMATION
          ================================================= */}

          <div className="confirmation-section">

            <div className="confirmation-mark">
              <span>✓</span>
            </div>

            <span className="success-eyebrow">
              ORDER CONFIRMED
            </span>

            <h1>
              Thank you, <em>{order.customer.name}</em>
            </h1>

            <p className="success-message">
              Your order has been received and is now
              being prepared with care.
            </p>

          </div>


          {/* =================================================
              ORDER NUMBER
          ================================================= */}

          <div className="order-number">

            <span>
              Order number
            </span>

            <strong>
              {order.orderId}
            </strong>

          </div>


          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="section-block">

            <div className="section-heading">

              <span>
                01
              </span>

              <h2>
                Order summary
              </h2>

            </div>


            <div className="summary-list">

              <div className="summary-row">

                <span>
                  {order.totalItems === 1
                    ? "Item"
                    : "Items"}
                </span>

                <strong>
                  {order.totalItems}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Payment
                </span>

                <strong>
                  {paymentText}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Shipping
                </span>

                <strong>
                  {order.shipping === 0
                    ? "Complimentary"
                    : `₹${order.shipping.toLocaleString(
                        "en-IN"
                      )}`}
                </strong>

              </div>


              <div className="summary-row total-row">

                <span>
                  Total
                </span>

                <strong>
                  ₹{order.total.toLocaleString("en-IN")}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              DELIVERY DETAILS
          ================================================= */}

          <div className="section-block">

            <div className="section-heading">

              <span>
                02
              </span>

              <h2>
                Delivery details
              </h2>

            </div>


            <div className="delivery-content">

              <div className="delivery-icon">
                <span>↗</span>
              </div>


              <div className="delivery-info">

                <span className="delivery-label">
                  Delivering to
                </span>

                <strong>
                  {order.customer.name}
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

          </div>


          {/* =================================================
              WHAT HAPPENS NEXT
          ================================================= */}

          <div className="section-block next-section">

            <div className="section-heading">

              <span>
                03
              </span>

              <h2>
                What happens next
              </h2>

            </div>


            <div className="order-journey">


              {/* STEP 1 */}

              <div className="journey-item active">

                <div className="journey-number">
                  01
                </div>

                <div>

                  <strong>
                    Order confirmed
                  </strong>

                  <p>
                    Your order has been received.
                  </p>

                </div>

              </div>


              <div className="journey-line" />


              {/* STEP 2 */}

              <div className="journey-item">

                <div className="journey-number">
                  02
                </div>

                <div>

                  <strong>
                    Being prepared
                  </strong>

                  <p>
                    Your fragrance will be carefully prepared.
                  </p>

                </div>

              </div>


              <div className="journey-line" />


              {/* STEP 3 */}

              <div className="journey-item">

                <div className="journey-number">
                  03
                </div>

                <div>

                  <strong>
                    Dispatched
                  </strong>

                  <p>
                    Your order will soon be on its way.
                  </p>

                </div>

              </div>


              <div className="journey-line" />


              {/* STEP 4 */}

              <div className="journey-item">

                <div className="journey-number">
                  04
                </div>

                <div>

                  <strong>
                    Delivered
                  </strong>

                  <p>
                    Your KEIAN fragrance arrives at your door.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="success-actions">

            <Link
              to="/products"
              className="success-button"
            >
              Continue Shopping

              <span>
                →
              </span>

            </Link>


            <Link
              to="/"
              className="home-button"
            >
              Back to Home
            </Link>

          </div>


          {/* =================================================
              NOTE
          ================================================= */}

          <p className="success-note">
            Order details and future updates will be
            shared using the contact information provided
            at checkout.
          </p>

        </section>

      </main>


      {/* =====================================================
          SHARED FOOTER FROM APP.TSX
      ===================================================== */}

      <Footer />

    </div>
  );
}

export default OrderSuccess;