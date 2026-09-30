import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./Checkout.css";

import {
  Navbar,
  Footer,
} from "./App";

import { supabase } from "./lib/supabaseClient";

// =========================
// PRODUCT INTERFACE
// =========================

interface Product {
  id: number;
  name: string;
  category: string;
  collection?: string;
  type?: string;
  price: number;
  description: string;
  imageUrl: string;
  secondUrl?: string;
  tag: string;
}

// =========================
// SUPABASE CART ITEM
// =========================

interface SupabaseCartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at: string;
}

// =========================
// CART ITEM
// =========================

interface CartItem extends Product {
  quantity: number;
}

// =========================
// CUSTOMER DETAILS
// =========================

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// =========================
// CHECKOUT COMPONENT
// =========================

function Checkout() {
  const navigate = useNavigate();

  // =========================
  // CART STATE
  // =========================

  const [cart, setCart] = useState<CartItem[]>([]);

  // =========================
  // CUSTOMER STATE
  // =========================

  const [customer, setCustomer] =
    useState<CustomerDetails>({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

  // =========================
  // PAYMENT STATE
  // =========================

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "online">("cod");

  // =========================
  // ERROR STATE
  // =========================

  const [error, setError] = useState("");

  // =========================
  // LOADING STATE
  // =========================

  const [isLoadingCart, setIsLoadingCart] =
    useState(true);

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  // =========================
  // LOAD CART FROM SUPABASE
  // =========================

  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      try {
        setIsLoadingCart(true);
        setError("");

        // =========================
        // GET LOGGED-IN USER
        // =========================

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Unable to get user:",
            userError
          );

          if (isMounted) {
            setError(
              "Unable to verify your account. Please login again."
            );
            setIsLoadingCart(false);
          }

          return;
        }

        // =========================
        // USER NOT LOGGED IN
        // =========================

        if (!user) {
          navigate("/login");
          return;
        }

        // =========================
        // LOAD USER CART
        // =========================

        const {
          data: cartItems,
          error: cartError,
        } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          });

        if (cartError) {
          console.error(
            "CART LOAD ERROR:",
            cartError
          );

          if (isMounted) {
            setError(
              cartError.message ||
              "Unable to load your cart."
            );
            setIsLoadingCart(false);
          }

          return;
        }

        // =========================
        // EMPTY CART
        // =========================

        if (
          !cartItems ||
          cartItems.length === 0
        ) {
          navigate("/cart");
          return;
        }

        // =========================
        // GET PRODUCT IDS
        // =========================

        const productIds = (
          cartItems as SupabaseCartItem[]
        ).map(
          (item) => item.product_id
        );

        // =========================
        // LOAD PRODUCTS
        // =========================

        const {
          data: products,
          error: productsError,
        } = await supabase
          .from("products")
          .select(`
    id,
    name,
    category,
    collection,
    price,
    description,
    "imageUrl",
    "secondUrl",
    tag
  `)
          .in("id", productIds)
          .eq("active", true);

        if (productsError) {
          console.error(
            "PRODUCT LOAD ERROR:",
            productsError
          );

          if (isMounted) {
            setError(
              productsError.message ||
              "Unable to load cart products."
            );
            setIsLoadingCart(false);
          }

          return;
        }

        if (
          !products ||
          products.length === 0
        ) {
          navigate("/cart");
          return;
        }

        // =========================
        // COMBINE CART + PRODUCTS
        // =========================

        const combinedCart: CartItem[] = (
          cartItems as SupabaseCartItem[]
        )
          .map((cartItem) => {
            const product = products.find(
              (item) =>
                item.id ===
                cartItem.product_id
            );

            if (!product) {
              return null;
            }

            return {
              ...(product as Product),
              quantity:
                Number(cartItem.quantity) || 1,
            };
          })
          .filter(
            (
              item
            ): item is CartItem =>
              item !== null
          );

        // =========================
        // FINAL EMPTY CHECK
        // =========================

        if (combinedCart.length === 0) {
          navigate("/cart");
          return;
        }

        // =========================
        // SET CART
        // =========================

        if (isMounted) {
          setCart(combinedCart);
          setIsLoadingCart(false);
        }
      } catch (loadError) {
        console.error(
          "Unable to load checkout cart:",
          loadError
        );

        if (isMounted) {
          setError(
            "Unable to load your cart. Please try again."
          );
          setIsLoadingCart(false);
        }
      }
    };

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================
  // CALCULATE SUBTOTAL
  // =========================

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
      Number(item.quantity),
    0
  );

  // =========================
  // CALCULATE SHIPPING
  // =========================

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 1999
        ? 0
        : 99;

  // =========================
  // FINAL TOTAL
  // =========================

  const total =
    subtotal + shipping;

  // =========================
  // TOTAL ITEMS
  // =========================

  const totalItems =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity),
      0
    );

  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // =========================
    // PREVENT DOUBLE CLICK
    // =========================

    if (isPlacingOrder) {
      return;
    }

    setError("");

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================

    if (
      !customer.name.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim() ||
      !customer.city.trim() ||
      !customer.state.trim() ||
      !customer.pincode.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        customer.email.trim()
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    // =========================
    // PHONE VALIDATION
    // =========================

    const phoneRegex =
      /^[0-9]{10}$/;

    if (
      !phoneRegex.test(
        customer.phone.trim()
      )
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }

    // =========================
    // PINCODE VALIDATION
    // =========================

    const pincodeRegex =
      /^[0-9]{6}$/;

    if (
      !pincodeRegex.test(
        customer.pincode.trim()
      )
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }

    // =========================
    // CHECK CART
    // =========================

    if (cart.length === 0) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    // =========================
    // CHECK LOGGED-IN USER
    // =========================

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "Please login to place your order."
      );

      navigate("/login");

      return;
    }

    // =========================
    // START LOADING
    // =========================

    setIsPlacingOrder(true);

    try {
      // =========================
      // CREATE ORDER UUID
      // =========================

      const orderId =
        crypto.randomUUID();

      // =========================
      // PAYMENT STATUS
      // =========================

      /*
       * COD:
       * payment_status = PENDING
       * order_status   = CONFIRMED
       *
       * ONLINE:
       * payment_status = PENDING
       * order_status   = PENDING
       *
       * Razorpay can be integrated later.
       */

      const paymentStatus =
        "PENDING";

      const orderStatus =
        paymentMethod === "cod"
          ? "CONFIRMED"
          : "PENDING";

      // =========================
      // CREATE ORDER
      // =========================

      const {
        error: orderError,
      } = await supabase
        .from("orders")
        .insert({
          id: orderId,

          // IMPORTANT:
          // This connects the order
          // to the logged-in user.
          user_id: user.id,

          customer_name:
            customer.name.trim(),

          customer_email:
            customer.email.trim(),

          customer_phone:
            customer.phone.trim(),

          address:
            customer.address.trim(),

          city:
            customer.city.trim(),

          state:
            customer.state.trim(),

          pincode:
            customer.pincode.trim(),

          subtotal:
            Number(subtotal),

          shipping:
            Number(shipping),

          total:
            Number(total),

          currency:
            "INR",

          payment_status:
            paymentStatus,

          order_status:
            orderStatus,
        });

      // =========================
      // CHECK ORDER ERROR
      // =========================

      if (orderError) {
        console.error(
          "ORDER INSERT ERROR:",
          orderError
        );

        throw new Error(
          orderError.message ||
          "Unable to create order."
        );
      }

      // =========================
      // CREATE ORDER ITEMS
      // =========================

      const orderItems =
        cart.map((item) => ({
          order_id:
            orderId,

          product_id:
            item.id,

          product_name:
            item.name,

          quantity:
            Number(item.quantity),

          price:
            Number(item.price),
        }));

      // =========================
      // INSERT ORDER ITEMS
      // =========================

      const {
        error: orderItemsError,
      } = await supabase
        .from("order_items")
        .insert(orderItems);

      // =========================
      // CHECK ORDER ITEMS ERROR
      // =========================

      if (orderItemsError) {
        console.error(
          "ORDER ITEMS INSERT ERROR:",
          orderItemsError
        );

        throw new Error(
          orderItemsError.message ||
          "Unable to save order items."
        );
      }

      // =========================
      // CREATE LOCAL ORDER OBJECT
      // =========================

      const localOrder = {
        orderId: orderId,

        customer: {
          name:
            customer.name.trim(),

          email:
            customer.email.trim(),

          phone:
            customer.phone.trim(),

          address:
            customer.address.trim(),

          city:
            customer.city.trim(),

          state:
            customer.state.trim(),

          pincode:
            customer.pincode.trim(),
        },

        items:
          cart.map((item) => ({
            id:
              item.id,

            name:
              item.name,

            category:
              item.category,

            collection:
              item.collection,

            price:
              Number(item.price),

            quantity:
              Number(item.quantity),

            description:
              item.description,

            imageUrl:
              item.imageUrl,

            secondUrl:
              item.secondUrl,

            tag:
              item.tag,
          })),

        subtotal:
          Number(subtotal),

        shipping:
          Number(shipping),

        total:
          Number(total),

        totalItems:
          Number(totalItems),

        paymentMethod:
          paymentMethod === "online"
            ? "Online Payment"
            : "Cash on Delivery",

        paymentStatus:
          paymentStatus,

        orderStatus:
          orderStatus,

        orderDate:
          new Date().toISOString(),
      };

      // =========================
      // SAVE LAST ORDER
      // =========================

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(
          localOrder
        )
      );

      // =========================
      // SAVE LOCAL ORDER HISTORY
      // =========================

      let existingOrders: any[] =
        [];

      try {
        existingOrders =
          JSON.parse(
            localStorage.getItem(
              "orders"
            ) || "[]"
          );

        if (
          !Array.isArray(
            existingOrders
          )
        ) {
          existingOrders = [];
        }
      } catch {
        existingOrders = [];
      }

      localStorage.setItem(
        "orders",
        JSON.stringify([
          ...existingOrders,
          localOrder,
        ])
      );

      // =========================
      // CLEAR SUPABASE CART
      // =========================

      const {
        error: clearCartError,
      } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearCartError) {
        console.error(
          "CLEAR CART ERROR:",
          clearCartError
        );

        /*
         * Do not fail the order here.
         *
         * The order was already created
         * successfully. We only report the
         * cart clearing issue.
         */
      }

      // =========================
      // ALSO CLEAR OLD LOCAL CART
      // =========================

      localStorage.removeItem(
        "cart"
      );

      // =========================
      // UPDATE CART UI
      // =========================

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      // =========================
      // GO TO SUCCESS PAGE
      // =========================

      navigate(
        "/order-success"
      );
    } catch (
    supabaseError: unknown
    ) {
      // =========================
      // SHOW REAL ERROR
      // =========================

      console.error(
        "SUPABASE CHECKOUT ERROR:",
        supabaseError
      );

      const message =
        supabaseError instanceof Error
          ? supabaseError.message
          : "Unable to place your order. Please try again.";

      setError(message);

      setIsPlacingOrder(false);
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================

  if (isLoadingCart) {
    return (
      <div className="checkout-page">
        <Navbar />

        <main className="checkout-container">
          <div className="checkout-loading">
            <span>
              LOADING YOUR ORDER...
            </span>

            <p>
              Preparing your checkout.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =========================
  // EMPTY CART
  // =========================

  if (cart.length === 0) {
    return null;
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="checkout-page">

      {/* =========================
          SHARED NAVBAR
      ========================= */}

      <Navbar />

      {/* =========================
          MAIN
      ========================= */}

      <main className="checkout-container">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="checkout-header">

          <span className="section-label">
            COMPLETE YOUR ORDER
          </span>

          <h1>
            Checkout <em>Details</em>
          </h1>

          <p>
            Enter your details to complete
            your Keian order.
          </p>

        </div>

        {/* =========================
            CHECKOUT LAYOUT
        ========================= */}

        <div className="checkout-layout">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <form
            className="checkout-form"
            onSubmit={
              handlePlaceOrder
            }
          >

            {/* =========================
                CUSTOMER INFORMATION
            ========================= */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  01
                </span>

                <div>

                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Your contact details
                  </p>

                </div>

              </div>

              <div className="form-grid">

                {/* NAME */}

                <div className="form-group full-width">

                  <label htmlFor="name">
                    FULL NAME *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={
                      customer.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label htmlFor="email">
                    EMAIL ADDRESS *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={
                      customer.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* PHONE */}

                <div className="form-group">

                  <label htmlFor="phone">
                    PHONE NUMBER *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="10 digit mobile number"
                    value={
                      customer.phone
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={10}
                    inputMode="numeric"
                    required
                  />

                </div>

              </div>

            </section>

            {/* =========================
                SHIPPING ADDRESS
            ========================= */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  02
                </span>

                <div>

                  <h2>
                    Shipping Address
                  </h2>

                  <p>
                    Where should we deliver?
                  </p>

                </div>

              </div>

              <div className="form-grid">

                {/* ADDRESS */}

                <div className="form-group full-width">

                  <label htmlFor="address">
                    ADDRESS *
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    placeholder="House / Flat number, Street, Area"
                    value={
                      customer.address
                    }
                    onChange={
                      handleChange
                    }
                    rows={4}
                    required
                  />

                </div>

                {/* CITY */}

                <div className="form-group">

                  <label htmlFor="city">
                    CITY *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Your city"
                    value={
                      customer.city
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* STATE */}

                <div className="form-group">

                  <label htmlFor="state">
                    STATE *
                  </label>

                  <select
                    id="state"
                    name="state"
                    value={
                      customer.state
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select state
                    </option>

                    <option value="Andhra Pradesh">
                      Andhra Pradesh
                    </option>

                    <option value="Assam">
                      Assam
                    </option>

                    <option value="Bihar">
                      Bihar
                    </option>

                    <option value="Chhattisgarh">
                      Chhattisgarh
                    </option>

                    <option value="Delhi">
                      Delhi
                    </option>

                    <option value="Goa">
                      Goa
                    </option>

                    <option value="Gujarat">
                      Gujarat
                    </option>

                    <option value="Haryana">
                      Haryana
                    </option>

                    <option value="Himachal Pradesh">
                      Himachal Pradesh
                    </option>

                    <option value="Jharkhand">
                      Jharkhand
                    </option>

                    <option value="Karnataka">
                      Karnataka
                    </option>

                    <option value="Kerala">
                      Kerala
                    </option>

                    <option value="Madhya Pradesh">
                      Madhya Pradesh
                    </option>

                    <option value="Maharashtra">
                      Maharashtra
                    </option>

                    <option value="Odisha">
                      Odisha
                    </option>

                    <option value="Punjab">
                      Punjab
                    </option>

                    <option value="Rajasthan">
                      Rajasthan
                    </option>

                    <option value="Tamil Nadu">
                      Tamil Nadu
                    </option>

                    <option value="Telangana">
                      Telangana
                    </option>

                    <option value="Uttar Pradesh">
                      Uttar Pradesh
                    </option>

                    <option value="Uttarakhand">
                      Uttarakhand
                    </option>

                    <option value="West Bengal">
                      West Bengal
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* PINCODE */}

                <div className="form-group">

                  <label htmlFor="pincode">
                    PINCODE *
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    placeholder="6 digit pincode"
                    value={
                      customer.pincode
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />

                </div>

              </div>

            </section>

            {/* =========================
                PAYMENT
            ========================= */}

            <section className="checkout-section">

              <div className="checkout-section-heading">

                <span>
                  03
                </span>

                <div>

                  <h2>
                    Payment
                  </h2>

                  <p>
                    Payment options
                  </p>

                </div>

              </div>

              {/* CASH ON DELIVERY */}

              <button
                type="button"
                className={`payment-option ${paymentMethod === "cod"
                    ? "selected"
                    : ""
                  }`}
                onClick={() =>
                  setPaymentMethod(
                    "cod"
                  )
                }
              >

                <div className="payment-radio">

                  <span
                    className={
                      paymentMethod ===
                        "cod"
                        ? "active"
                        : ""
                    }
                  />

                </div>

                <div>

                  <strong>
                    Cash on Delivery
                  </strong>

                  <p>
                    Pay when your order arrives.
                  </p>

                </div>

                <span className="payment-badge">
                  AVAILABLE
                </span>

              </button>

              {/* ONLINE PAYMENT */}

              <button
                type="button"
                className={`payment-option ${paymentMethod ===
                    "online"
                    ? "selected"
                    : ""
                  }`}
                onClick={() =>
                  setPaymentMethod(
                    "online"
                  )
                }
              >

                <div className="payment-radio">

                  <span
                    className={
                      paymentMethod ===
                        "online"
                        ? "active"
                        : ""
                    }
                  />

                </div>

                <div>

                  <strong>
                    Online Payment
                  </strong>

                  <p>
                    UPI / Cards / Net Banking
                  </p>

                </div>

                <span className="payment-badge">
                  AVAILABLE
                </span>

              </button>

            </section>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            {/* =========================
                PLACE ORDER
            ========================= */}

            <button
              type="submit"
              className="place-order-button"
              disabled={
                isPlacingOrder
              }
            >

              {isPlacingOrder
                ? "PLACING ORDER..."
                : paymentMethod ===
                  "online"
                  ? `PAY ₹${total.toLocaleString(
                    "en-IN"
                  )}`
                  : "PLACE ORDER"}

              {!isPlacingOrder && (
                <span>
                  →
                </span>
              )}

            </button>

            {/* =========================
                NOTE
            ========================= */}

            <p className="checkout-note">
              By placing your order, you agree
              to our terms and conditions.
            </p>

          </form>

          {/* =========================
              RIGHT SIDE
          ========================= */}

          <aside className="checkout-summary">

            <div className="summary-card">

              <span className="summary-label">
                YOUR SELECTION
              </span>

              <h2>
                Order <em>Summary</em>
              </h2>

              {/* =========================
                  ITEMS
              ========================= */}

              <div className="checkout-items">

                {cart.map(
                  (
                    item,
                    index
                  ) => {

                    const productClasses = [
                      "product-noir",
                      "product-rose",
                      "product-oud",
                      "product-bloom",
                    ];

                    const className =
                      productClasses[
                      index %
                      productClasses.length
                      ];

                    return (

                      <div
                        className="checkout-item"
                        key={item.id}
                      >

                        {/* IMAGE */}

                        <div
                          className={`checkout-item-image ${className}`}
                        >

                          <img
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.name
                            }
                            onError={(
                              event
                            ) => {

                              event.currentTarget.style.display =
                                "none";

                            }}
                          />

                        </div>

                        {/* PRODUCT INFO */}

                        <div className="checkout-item-info">

                          <span>
                            {item.category ||
                              "FRAGRANCE"}
                          </span>

                          <h3>
                            {item.name}
                          </h3>

                          <p>
                            QTY:{" "}
                            {item.quantity}
                          </p>

                        </div>

                        {/* PRICE */}

                        <strong>
                          ₹
                          {(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                    );
                  }
                )}

              </div>

              {/* =========================
                  TOTALS
              ========================= */}

              <div className="checkout-summary-lines">

                <div>

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Shipping
                  </span>

                  <strong>
                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping}`}
                  </strong>

                </div>

              </div>

              {/* =========================
                  SHIPPING NOTE
              ========================= */}

              {shipping > 0 && (
                <p className="shipping-note">

                  Add ₹
                  {(
                    1999 -
                    subtotal
                  ).toLocaleString(
                    "en-IN"
                  )}{" "}
                  more for free shipping.

                </p>
              )}

              {shipping === 0 && (
                <p className="shipping-note free">

                  ✦ You qualify for free
                  shipping.

                </p>
              )}

              {/* =========================
                  DIVIDER
              ========================= */}

              <div className="summary-divider" />

              {/* =========================
                  TOTAL
              ========================= */}

              <div className="checkout-total">

                <span>
                  TOTAL
                </span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              {/* =========================
                  ITEM COUNT
              ========================= */}

              <div className="checkout-item-count">

                {totalItems}{" "}

                {totalItems === 1
                  ? "ITEM"
                  : "ITEMS"}

              </div>

              {/* =========================
                  SECURITY
              ========================= */}

              <div className="checkout-security">

                <span>
                  ✦
                </span>

                <p>

                  <strong>
                    SECURE ORDER
                  </strong>

                  <br />

                  Your information is protected.

                </p>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* =========================
          SHARED FOOTER
      ========================= */}

      <Footer />

    </div>
  );
}

export default Checkout;
