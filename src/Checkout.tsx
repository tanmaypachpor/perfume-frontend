import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { Navbar, Footer } from "./App";
import { supabase } from "./supabaseClient";

interface Product {
  id: number;
  name: string;
  category: string;
  collection?: string;
  price: number;
  description: string;
  imageUrl: string;
  secondUrl?: string;
  tag: string;
}

interface SupabaseCartItem {
  id: string;
  user_id: string;
  product_id: number;
  quantity: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface RazorpayOrderResponse {
  success: boolean;
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  error?: string;
}

interface RazorpayVerifyResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  error?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: {
    order_id?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "ONLINE"
  >("ONLINE");

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

  const [error, setError] = useState("");

  /* ---------------------------------------------
     LOAD USER + CART
  --------------------------------------------- */

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      setCustomer((prev) => ({
        ...prev,
        email: user.email || "",
      }));

      const {
        data: cartItems,
        error: cartError,
      } = await supabase
        .from("cart_items")
        .select(
          "id, user_id, product_id, quantity"
        )
        .eq("user_id", user.id);

      if (cartError) {
        throw new Error(cartError.message);
      }

      if (!cartItems || cartItems.length === 0) {
        setCart([]);
        setLoading(false);
        return;
      }

      const productIds = cartItems.map(
        (item: SupabaseCartItem) =>
          item.product_id
      );

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
        throw new Error(productsError.message);
      }

      const mergedCart: CartItem[] = (
        cartItems as SupabaseCartItem[]
      )
        .map((cartItem) => {
          const product = products?.find(
            (item) =>
              item.id === cartItem.product_id
          );

          if (!product) {
            return null;
          }

          return {
            ...product,
            quantity: cartItem.quantity,
          };
        })
        .filter(Boolean) as CartItem[];

      setCart(mergedCart);
    } catch (err) {
      console.error(
        "Checkout loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
     CART CALCULATIONS
  --------------------------------------------- */

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) * item.quantity,
    0
  );

  const shipping =
    subtotal >= 1999 ? 0 : 99;

  const total = subtotal + shipping;

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  /* ---------------------------------------------
     INPUT HANDLER
  --------------------------------------------- */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------------------------------------
     VALIDATION
  --------------------------------------------- */

  const validateCheckout = () => {
    if (!userId) {
      setError(
        "Please login before placing an order."
      );
      return false;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return false;
    }

    if (!customer.name.trim()) {
      setError("Please enter your full name.");
      return false;
    }

    if (!customer.email.trim()) {
      setError("Please enter your email.");
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(customer.email)) {
      setError(
        "Please enter a valid email address."
      );
      return false;
    }

    if (!customer.phone.trim()) {
      setError(
        "Please enter your phone number."
      );
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(customer.phone)) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return false;
    }

    if (!customer.address.trim()) {
      setError("Please enter your address.");
      return false;
    }

    if (!customer.city.trim()) {
      setError("Please enter your city.");
      return false;
    }

    if (!customer.state.trim()) {
      setError("Please enter your state.");
      return false;
    }

    if (!customer.pincode.trim()) {
      setError("Please enter your pincode.");
      return false;
    }

    const pincodeRegex = /^\d{6}$/;

    if (!pincodeRegex.test(customer.pincode)) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return false;
    }

    return true;
  };

  /* ---------------------------------------------
     CREATE RAZORPAY ORDER
  --------------------------------------------- */

  const createRazorpayOrder = async (
    orderId: string
  ): Promise<RazorpayOrderResponse> => {
    try {
      /*
       * Get the current Supabase session.
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          sessionError.message
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      console.log(
        "Logged-in user ID:",
        session.user.id
      );

      console.log(
        "Access token available:",
        !!session.access_token
      );

      /*
       * Call Supabase Edge Function.
       */
      const {
        data,
        error: functionError,
      } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount: total,
            currency: "INR",
            receipt: `KEIAN-${orderId}`,
            orderId: orderId,
          },

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (functionError) {
        console.error(
          "Create Razorpay order function error:",
          functionError
        );

        throw new Error(
          functionError.message ||
          "Failed to create Razorpay order"
        );
      }

      /*
       * IMPORTANT:
       * Razorpay must return both success
       * and a valid Razorpay order ID.
       */
      if (!data?.success || !data?.id) {
        throw new Error(
          data?.error ||
          "Failed to create Razorpay order"
        );
      }

      console.log(
        "Razorpay order created successfully:",
        data
      );

      return data as RazorpayOrderResponse;
    } catch (error) {
      console.error(
        "createRazorpayOrder error:",
        error
      );

      throw error;
    }
  };

  /* ---------------------------------------------
     VERIFY RAZORPAY PAYMENT
  --------------------------------------------- */

  const verifyRazorpayPayment = async (
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<RazorpayVerifyResponse> => {
    try {
      /*
       * Get current Supabase session.
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          sessionError.message
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      /*
       * Call payment verification Edge Function.
       */
      const {
        data,
        error: functionError,
      } = await supabase.functions.invoke(
        "verify-razorpay-payment",
        {
          body: {
            orderId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
          },

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (functionError) {
        console.error(
          "Verify Razorpay payment error:",
          functionError
        );

        throw new Error(
          functionError.message ||
          "Payment verification failed"
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
          "Payment verification failed"
        );
      }

      console.log(
        "Razorpay payment verified successfully:",
        data
      );

      return data as RazorpayVerifyResponse;
    } catch (error) {
      console.error(
        "verifyRazorpayPayment error:",
        error
      );

      throw error;
    }
  };

  /* ---------------------------------------------
     SAVE ORDER ITEMS
  --------------------------------------------- */

  const saveOrderItems = async (
    orderId: string
  ) => {
    const orderItems = cart.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const { error } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (error) {
      throw new Error(
        `Failed to save order items: ${error.message}`
      );
    }
  };

  /* ---------------------------------------------
     CLEAR CART
  --------------------------------------------- */

  const clearCart = async () => {
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Failed to clear Supabase cart:",
        error
      );
    }

    localStorage.removeItem("cart");
  };

  /* ---------------------------------------------
     SAVE LOCAL ORDER
  --------------------------------------------- */

  const saveLocalOrder = (
    orderId: string,
    paymentStatus: string,
    orderStatus: string
  ) => {
    const localOrder = {
      id: orderId,

      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,

      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,

      subtotal,
      shipping,
      total,

      currency: "INR",

      payment_status: paymentStatus,
      order_status: orderStatus,

      created_at:
        new Date().toISOString(),

      items: cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        imageUrl: item.imageUrl,
      })),
    };

    localStorage.setItem(
      `order_${orderId}`,
      JSON.stringify(localOrder)
    );
  };

  /* ---------------------------------------------
     HANDLE COD ORDER
  --------------------------------------------- */

  const placeCODOrder = async (
    orderId: string
  ) => {
    if (!userId) {
      throw new Error(
        "User is not authenticated."
      );
    }

    const { error: orderError } =
      await supabase
        .from("orders")
        .insert({
          id: orderId,
          user_id: userId,

          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,

          address: customer.address,
          city: customer.city,
          state: customer.state,
          pincode: customer.pincode,

          subtotal,
          shipping,
          total,
          currency: "INR",

          payment_status: "PENDING",
          order_status: "CONFIRMED",
        });

    if (orderError) {
      throw new Error(
        `Failed to create order: ${orderError.message}`
      );
    }

    await saveOrderItems(orderId);

    saveLocalOrder(
      orderId,
      "PENDING",
      "CONFIRMED"
    );

    await clearCart();

    navigate("/order-success", {
      state: {
        orderId,
        paymentMethod: "COD",
        total,
      },
    });
  };

  /* ---------------------------------------------
     HANDLE RAZORPAY ONLINE ORDER
  --------------------------------------------- */

  const placeOnlineOrder = async (
    orderId: string
  ) => {
    if (!userId) {
      throw new Error(
        "User is not authenticated."
      );
    }

    /*
     * STEP 1
     * Create Razorpay order FIRST.
     *
     * IMPORTANT:
     * If Razorpay returns 401 or any other error,
     * execution stops here.
     *
     * Therefore:
     * - No orders row is created.
     * - No order_items are created.
     * - Cart remains unchanged.
     */
    const razorpayOrder =
      await createRazorpayOrder(orderId);

    /*
     * Extra safety check.
     */
    if (
      !razorpayOrder ||
      !razorpayOrder.id
    ) {
      throw new Error(
        "Unable to create Razorpay payment order."
      );
    }

    /*
     * STEP 2
     * Razorpay order successfully created.
     *
     * NOW create our own order in Supabase.
     */
    const { error: orderError } =
      await supabase
        .from("orders")
        .insert({
          id: orderId,
          user_id: userId,

          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,

          address: customer.address,
          city: customer.city,
          state: customer.state,
          pincode: customer.pincode,

          subtotal,
          shipping,
          total,
          currency: "INR",

          /*
           * Save Razorpay order ID.
           */
          razorpay_order_id:
            razorpayOrder.id,

          payment_status: "PENDING",
          order_status: "PENDING",
        });

    if (orderError) {
      throw new Error(
        `Failed to create order: ${orderError.message}`
      );
    }

    /*
     * STEP 3
     * Save order items.
     */
    await saveOrderItems(orderId);

    /*
     * STEP 4
     * Check Razorpay checkout script.
     */
    if (!window.Razorpay) {
      throw new Error(
        "Razorpay checkout script is not loaded. Please check index.html."
      );
    }

    /*
     * STEP 5
     * Razorpay Checkout Options.
     */
    const options: RazorpayOptions = {
      key:
        import.meta.env
          .VITE_RAZORPAY_KEY_ID,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      name: "KEIAN",

      description:
        "Premium Fragrance Order",

      order_id:
        razorpayOrder.id,

      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },

      notes: {
        order_id: orderId,
      },

      theme: {
        color: "#1D211C",
      },

      /*
       * STEP 6
       * Razorpay successful payment handler.
       */
      handler: async (response) => {
        try {
          setPlacingOrder(true);
          setError("");

          /*
           * STEP 7
           * Verify payment on server.
           */
          await verifyRazorpayPayment(
            orderId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          /*
           * STEP 8
           * Payment successfully verified.
           */
          saveLocalOrder(
            orderId,
            "PAID",
            "CONFIRMED"
          );

          /*
           * STEP 9
           * Clear cart only after
           * successful payment verification.
           */
          await clearCart();

          /*
           * STEP 10
           * Navigate to success page.
           */
          navigate("/order-success", {
            state: {
              orderId,
              paymentMethod: "ONLINE",
              total,
              paymentId:
                response.razorpay_payment_id,
            },
          });
        } catch (error) {
          console.error(
            "Payment verification error:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Payment verification failed."
          );

          setPlacingOrder(false);
        }
      },

      /*
       * User closes Razorpay popup.
       */
      modal: {
        ondismiss: () => {
          setPlacingOrder(false);

          setError(
            "Payment was cancelled. Your cart is still saved."
          );
        },
      },
    };

    /*
     * STEP 11
     * Open Razorpay Checkout.
     */
    const razorpay =
      new window.Razorpay(options);

    razorpay.open();
  };

  /* ---------------------------------------------
     PLACE ORDER
  --------------------------------------------- */

  const handlePlaceOrder = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!validateCheckout()) {
      return;
    }

    if (!userId) {
      setError(
        "Please login before placing your order."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      /*
       * Generate unique order ID.
       *
       * This is the order ID,
       * NOT the user ID.
       */
      const orderId =
        crypto.randomUUID();

      if (paymentMethod === "COD") {
        await placeCODOrder(orderId);
      } else {
        await placeOnlineOrder(orderId);
      }
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order."
      );

      setPlacingOrder(false);
    }
  };

  /* ---------------------------------------------
     LOADING
  --------------------------------------------- */

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="checkout-loading">
          <div className="checkout-spinner"></div>

          <p>
            Loading checkout...
          </p>
        </div>

        <Footer />
      </>
    );
  }

  /* ---------------------------------------------
     EMPTY CART
  --------------------------------------------- */

  if (cart.length === 0) {
    return (
      <>
        <Navbar />

        <section className="checkout-empty">
          <h1>
            Your Cart Is Empty
          </h1>

          <p>
            Add some fragrances to your
            cart before proceeding to
            checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            SHOP PERFUMES
          </button>
        </section>

        <Footer />
      </>
    );
  }

  /* ---------------------------------------------
     UI
  --------------------------------------------- */

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <div className="checkout-container">

          {/* ---------------------------------------
              PAGE HEADER
          --------------------------------------- */}

          <div className="checkout-header">
            <span className="checkout-eyebrow">
              KEIAN
            </span>

            <h1>
              Checkout
            </h1>

            <p>
              Complete your details to
              place your fragrance order.
            </p>
          </div>

          {/* ---------------------------------------
              ERROR
          --------------------------------------- */}

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <form
            className="checkout-layout"
            onSubmit={handlePlaceOrder}
          >

            {/* =====================================
                LEFT SIDE
            ====================================== */}

            <div className="checkout-left">

              {/* CUSTOMER INFORMATION */}

              <section className="checkout-card">
                <div className="checkout-section-title">
                  <span>
                    01
                  </span>

                  <div>
                    <h2>
                      Customer Information
                    </h2>

                    <p>
                      Enter your contact
                      details.
                    </p>
                  </div>
                </div>

                <div className="checkout-form-grid">

                  <div className="checkout-field full">
                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={customer.name}
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={customer.email}
                      onChange={
                        handleInputChange
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={customer.phone}
                      onChange={
                        handleInputChange
                      }
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </div>

                </div>
              </section>

              {/* SHIPPING ADDRESS */}

              <section className="checkout-card">
                <div className="checkout-section-title">
                  <span>
                    02
                  </span>

                  <div>
                    <h2>
                      Shipping Address
                    </h2>

                    <p>
                      Where should we
                      deliver your
                      fragrance?
                    </p>
                  </div>
                </div>

                <div className="checkout-form-grid">

                  <div className="checkout-field full">
                    <label>
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={customer.address}
                      onChange={
                        handleInputChange
                      }
                      placeholder="House / Flat / Street / Area"
                      rows={4}
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={customer.city}
                      onChange={
                        handleInputChange
                      }
                      placeholder="City"
                      autoComplete="address-level2"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={customer.state}
                      onChange={
                        handleInputChange
                      }
                      placeholder="State"
                      autoComplete="address-level1"
                    />
                  </div>

                  <div className="checkout-field">
                    <label>
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={customer.pincode}
                      onChange={
                        handleInputChange
                      }
                      placeholder="6-digit pincode"
                      maxLength={6}
                      autoComplete="postal-code"
                    />
                  </div>

                </div>
              </section>

              {/* PAYMENT */}

              <section className="checkout-card">
                <div className="checkout-section-title">
                  <span>
                    03
                  </span>

                  <div>
                    <h2>
                      Payment Method
                    </h2>

                    <p>
                      Choose how you want
                      to pay.
                    </p>
                  </div>
                </div>

                <div className="payment-methods">

                  {/* ONLINE */}

                  <label
                    className={`payment-option ${paymentMethod ===
                        "ONLINE"
                        ? "selected"
                        : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={
                        paymentMethod ===
                        "ONLINE"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "ONLINE"
                        )
                      }
                    />

                    <div className="payment-option-content">
                      <div>
                        <strong>
                          Online Payment
                        </strong>

                        <span>
                          Pay securely
                          using Razorpay
                        </span>
                      </div>

                      <span className="payment-radio"></span>
                    </div>
                  </label>

                  {/* COD */}

                  <label
                    className={`payment-option ${paymentMethod ===
                        "COD"
                        ? "selected"
                        : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={
                        paymentMethod ===
                        "COD"
                      }
                      onChange={() =>
                        setPaymentMethod(
                          "COD"
                        )
                      }
                    />

                    <div className="payment-option-content">
                      <div>
                        <strong>
                          Cash on Delivery
                        </strong>

                        <span>
                          Pay when your
                          order arrives
                        </span>
                      </div>

                      <span className="payment-radio"></span>
                    </div>
                  </label>

                </div>
              </section>
            </div>

            {/* =====================================
                RIGHT SIDE — ORDER SUMMARY
            ====================================== */}

            <aside className="checkout-right">

              <section className="checkout-summary">

                <div className="summary-header">
                  <div>
                    <span>
                      YOUR ORDER
                    </span>

                    <h2>
                      Order Summary
                    </h2>
                  </div>

                  <span className="summary-count">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "Item"
                      : "Items"}
                  </span>
                </div>

                {/* PRODUCTS */}

                <div className="checkout-products">

                  {cart.map((item) => (
                    <div
                      className="checkout-product"
                      key={item.id}
                    >

                      <div className="checkout-product-image">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      </div>

                      <div className="checkout-product-info">

                        <h3>
                          {item.name}
                        </h3>

                        <span>
                          Qty:{" "}
                          {item.quantity}
                        </span>

                        <strong>
                          ₹
                          {(
                            Number(
                              item.price
                            ) *
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    </div>
                  ))}

                </div>

                {/* PRICE */}

                <div className="summary-prices">

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

                {shipping === 0 && (
                  <div className="free-shipping-note">
                    Free shipping applied
                    on orders above
                    ₹1,999.
                  </div>
                )}

                <div className="summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                {/* PLACE ORDER */}

                <button
                  type="submit"
                  className="place-order-button"
                  disabled={placingOrder}
                >
                  {placingOrder
                    ? "PROCESSING..."
                    : paymentMethod ===
                      "ONLINE"
                      ? "PAY SECURELY"
                      : "PLACE ORDER"}
                </button>

                <div className="checkout-security">
                  <span>
                    🔒
                  </span>

                  <p>
                    Your payment and
                    personal information
                    are securely protected.
                  </p>
                </div>

              </section>
            </aside>

          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;