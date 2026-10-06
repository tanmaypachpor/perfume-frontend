import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

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

interface RazorpayValidatedItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface RazorpayOrderResponse {
  success: boolean;
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: RazorpayValidatedItem[];
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

  /* =====================================================
     LOAD USER + CART
  ===================================================== */

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

      const productIds = (
        cartItems as SupabaseCartItem[]
      ).map((item) => item.product_id);

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
          : "Failed to load checkout."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FRONTEND DISPLAY CALCULATIONS

     Used for:
     - Checkout display
     - COD

     ONLINE PAYMENT:
     Server calculates the final amount again.
  ===================================================== */

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

  /* =====================================================
     INPUT HANDLER
  ===================================================== */

  const handleInputChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

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

  /* =====================================================
     CREATE RAZORPAY ORDER
  ===================================================== */

  const createRazorpayOrder = async (
    orderId: string
  ): Promise<RazorpayOrderResponse> => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.access_token) {
      throw new Error(
        "Your login session has expired. Please login again."
      );
    }

    const {
      data,
      error: functionError,
    } = await supabase.functions.invoke(
      "create-razorpay-order",
      {
        body: {
          orderId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (functionError) {
      console.error(
        "Create Razorpay order error:",
        functionError
      );

      throw new Error(
        functionError.message ||
          "Failed to create Razorpay order."
      );
    }

    if (!data?.success || !data?.id) {
      throw new Error(
        data?.error ||
          "Failed to create Razorpay order."
      );
    }

    if (
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {
      throw new Error(
        "No valid order items were returned by the server."
      );
    }

    return data as RazorpayOrderResponse;
  };

  /* =====================================================
     VERIFY RAZORPAY PAYMENT
  ===================================================== */

  const verifyRazorpayPayment = async (
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<RazorpayVerifyResponse> => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.access_token) {
      throw new Error(
        "Your login session has expired. Please login again."
      );
    }

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
      throw new Error(
        functionError.message ||
          "Payment verification failed."
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          "Payment verification failed."
      );
    }

    return data as RazorpayVerifyResponse;
  };

  /* =====================================================
     SAVE ORDER ITEMS
  ===================================================== */

  const saveOrderItems = async (
    orderId: string,
    validatedItems: RazorpayValidatedItem[] = []
  ) => {
    const orderItems =
      validatedItems.length > 0
        ? validatedItems.map((item) => ({
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: Number(item.price),
          }))
        : cart.map((item) => ({
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

  /* =====================================================
     CLEAR CART
  ===================================================== */

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

  /* =====================================================
     COD ORDER
  ===================================================== */

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

    await clearCart();

    /*
      IMPORTANT:
      Use the exact database order ID in the URL.
    */
    navigate(`/order-success/${orderId}`, {
      replace: true,
    });
  };

  /* =====================================================
     ONLINE RAZORPAY ORDER
  ===================================================== */

  const placeOnlineOrder = async (
    orderId: string
  ) => {
    if (!userId) {
      throw new Error(
        "User is not authenticated."
      );
    }

    /* STEP 1: Create Razorpay order */

    const razorpayOrder =
      await createRazorpayOrder(orderId);

    if (
      !razorpayOrder ||
      !razorpayOrder.id
    ) {
      throw new Error(
        "Unable to create Razorpay payment order."
      );
    }

    /* STEP 2: Server totals */

    const serverSubtotal =
      Number(razorpayOrder.subtotal);

    const serverShipping =
      Number(razorpayOrder.shipping);

    const serverTotal =
      Number(razorpayOrder.total);

    if (
      !Number.isFinite(serverSubtotal) ||
      !Number.isFinite(serverShipping) ||
      !Number.isFinite(serverTotal) ||
      serverTotal <= 0
    ) {
      throw new Error(
        "Invalid order amount received from server."
      );
    }

    /* STEP 3: Create KEIAN order */

    const {
      error: orderError,
    } = await supabase
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
        subtotal: serverSubtotal,
        shipping: serverShipping,
        total: serverTotal,
        currency: "INR",
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

    /* STEP 4: Save validated items */

    await saveOrderItems(
      orderId,
      razorpayOrder.items
    );

    /* STEP 5: Razorpay script */

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay checkout script is not loaded. Please check index.html."
      );
    }

    const razorpayKey =
      import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      throw new Error(
        "Razorpay Key ID is missing. Check your .env.local file."
      );
    }

    /* STEP 6: Razorpay options */

    const options: RazorpayOptions = {
      key: razorpayKey,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      name: "KEIAN",

      description:
        "Premium Fragrance Order",

      order_id: razorpayOrder.id,

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

      /* PAYMENT SUCCESS */

      handler: async (response) => {
        try {
          setPlacingOrder(true);
          setError("");

          /* STEP 7: Verify payment */

          await verifyRazorpayPayment(
            orderId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          /* STEP 8: Clear cart */

          await clearCart();

          /*
            IMPORTANT:
            Do NOT use localStorage here.
            The success page gets the exact
            order directly from Supabase.
          */

          navigate(
            `/order-success/${orderId}`,
            {
              replace: true,
            }
          );
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

      /* USER CLOSES RAZORPAY */

      modal: {
        ondismiss: () => {
          setPlacingOrder(false);

          setError(
            "Payment was cancelled. Your cart is still saved."
          );
        },
      },
    };

    /* STEP 9: Open Razorpay */

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();
  };

  /* =====================================================
     PLACE ORDER
  ===================================================== */

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
        This is the unique KEIAN order ID.
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

  /* =====================================================
     LOADING
  ===================================================== */

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

  /* =====================================================
     EMPTY CART
  ===================================================== */

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

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <Navbar />

      <main className="checkout-page">

        <div className="checkout-container">

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

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <form
            className="checkout-layout"
            onSubmit={handlePlaceOrder}
          >

            {/* =================================================
                LEFT SIDE
            ================================================= */}

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
                    className={`payment-option ${
                      paymentMethod === "ONLINE"
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
                    className={`payment-option ${
                      paymentMethod === "COD"
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

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

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
                            Number(item.price) *
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

                {/* TOTAL */}

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
                    : paymentMethod === "ONLINE"
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