import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Navbar, Footer } from "@/shared/components/layout/SiteChrome";
import { supabase } from "@/shared/lib/supabaseClient";
import { OrderSuccessSections } from "@/features/orders/components/OrderSuccessSections";

import "@/features/orders/pages/OrderSuccess.css";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

function OrderSuccess() {
  const { orderId } =
    useParams<{ orderId: string }>();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [orderItems, setOrderItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD EXACT ORDER
  ===================================================== */

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------
         GET CURRENT USER
      ----------------------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message
        );
      }

      if (!user) {
        throw new Error(
          "Please login to view your order."
        );
      }

      /* -----------------------------------------------
         GET EXACT ORDER
      ----------------------------------------------- */

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          address,
          city,
          state,
          pincode,
          subtotal,
          shipping,
          total,
          currency,
          razorpay_order_id,
          razorpay_payment_id,
          payment_status,
          order_status,
          created_at
        `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) {
        throw new Error(
          orderError.message
        );
      }

      if (!orderData) {
        throw new Error(
          "We could not find this order."
        );
      }

      setOrder(orderData as Order);

      /* -----------------------------------------------
         GET EXACT ORDER ITEMS
      ----------------------------------------------- */

      const {
        data: items,
        error: itemsError,
      } = await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          product_id,
          product_name,
          quantity,
          price
        `)
        .eq("order_id", orderId)
        .order("id", {
          ascending: true,
        });

      if (itemsError) {
        throw new Error(
          itemsError.message
        );
      }

      setOrderItems(
        (items || []) as OrderItem[]
      );
    } catch (err) {
      console.error(
        "Order success loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your order."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="success-page">

        <Navbar />

        <main className="success-container">

          <section className="success-card">

            <div className="confirmation-section">

              <div className="confirmation-mark">
                <span>✓</span>
              </div>

              <span className="success-eyebrow">
                KEIAN
              </span>

              <h1>
                Loading <em>your order</em>
              </h1>

              <p className="success-message">
                Please wait while we retrieve
                your order details.
              </p>

            </div>

          </section>

        </main>

        <Footer />

      </div>
    );
  }

  /* =====================================================
     ERROR / ORDER NOT FOUND
  ===================================================== */

  if (error || !order) {
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
              {error ||
                "We couldn't find this order."}
            </p>

            <Link
              to="/orders"
              className="success-button"
            >
              View My Orders
              <span>→</span>
            </Link>

          </section>

        </main>

        <Footer />

      </div>
    );
  }

  /* =====================================================
     PAYMENT METHOD
  ===================================================== */

  const paymentText =
    order.razorpay_order_id
      ? "Online Payment"
      : "Cash on Delivery";

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const paymentStatus =
    order.payment_status || "PENDING";

  const orderStatus =
    order.order_status || "PENDING";

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="success-page">

      <Navbar />

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
              Thank you,{" "}
              <em>{order.customer_name}</em>
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
              {order.id}
            </strong>

          </div>

          <OrderSuccessSections
            order={order}
            items={orderItems}
            paymentText={paymentText}
            paymentStatus={paymentStatus}
            orderStatus={orderStatus}
          />

          {/* =================================================
              WHAT HAPPENS NEXT
          ================================================= */}

          <div className="section-block next-section">

            <div className="section-heading">

              <span>
                04
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
                    Your fragrance will be
                    carefully prepared.
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
                    Your order will soon be
                    on its way.
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
                    Your KEIAN fragrance arrives
                    at your door.
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
              to="/orders"
              className="success-button"
            >
              View My Orders
              <span>→</span>
            </Link>

            <Link
              to="/products"
              className="home-button"
            >
              Continue Shopping
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

      <Footer />

    </div>
  );
}

export default OrderSuccess;