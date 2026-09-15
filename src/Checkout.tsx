import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Checkout.css";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import { db } from "./firebase";

// =========================
// PRODUCT INTERFACE
// =========================

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  tag: string;
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
  // ERROR STATE
  // =========================

  const [error, setError] = useState("");

  // =========================
  // LOADING STATE
  // =========================

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  // =========================
  // LOAD CART
  // =========================

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      setCart(savedCart);

      // If cart is empty,
      // go back to cart page.
      if (savedCart.length === 0) {
        navigate("/cart");
      }
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );

      navigate("/cart");
    }
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
    const { name, value } =
      event.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));

    // Remove error while user types
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
      item.price *
        item.quantity,
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
        item.quantity,
      0
    );

  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Prevent double click
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
    // START LOADING
    // =========================

    setIsPlacingOrder(true);

    try {
      // =========================
      // GENERATE ORDER ID
      // =========================

      const orderId =
        "LM" +
        Date.now()
          .toString()
          .slice(-8);

      // =========================
      // CREATE ORDER OBJECT
      // =========================

      const order = {
        orderId,

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
            customer.state,

          pincode:
            customer.pincode.trim(),
        },

        items: cart.map(
          (item) => ({
            id: item.id,

            name: item.name,

            category:
              item.category,

            price: item.price,

            quantity:
              item.quantity,

            description:
              item.description,

            imageUrl:
              item.imageUrl,

            tag: item.tag,
          })
        ),

        subtotal,

        shipping,

        total,

        totalItems,

        paymentMethod:
          "Cash on Delivery",

        orderDate:
          new Date().toISOString(),

        status:
          "CONFIRMED",
      };

      // =========================
      // SAVE ORDER TO FIRESTORE
      // =========================

      const ordersCollection =
        collection(
          db,
          "orders"
        );

      const documentReference =
        await addDoc(
          ordersCollection,
          order
        );

      // =========================
      // FIREBASE DOCUMENT ID
      // =========================

      const firebaseOrder = {
        ...order,
        firebaseId:
          documentReference.id,
      };

      console.log(
        "Order successfully saved:",
        documentReference.id
      );

      // =========================
      // SAVE LAST ORDER
      // =========================

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(
          firebaseOrder
        )
      );

      // =========================
      // SAVE LOCAL ORDER HISTORY
      // =========================

      let existingOrders:
        any[] = [];

      try {
        existingOrders =
          JSON.parse(
            localStorage.getItem(
              "orders"
            ) || "[]"
          );
      } catch {
        existingOrders = [];
      }

      localStorage.setItem(
        "orders",
        JSON.stringify([
          ...existingOrders,
          firebaseOrder,
        ])
      );

      // =========================
      // CLEAR CART
      // =========================

      localStorage.removeItem(
        "cart"
      );

      // =========================
      // GO TO SUCCESS PAGE
      // =========================

      navigate(
        "/order-success"
      );

    } catch (firebaseError) {

      console.error(
        "Firebase order error:",
        firebaseError
      );

      setError(
        "Unable to place your order. Please check your internet connection and try again."
      );

      setIsPlacingOrder(false);
    }
  };

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
          NAVBAR
      ========================= */}

      <header className="checkout-navbar">

        <Link
          to="/"
          className="checkout-logo"
        >
          LUMIÈRE
        </Link>

        <nav className="checkout-nav-links">

          <Link to="/">
            HOME
          </Link>

          <Link to="/products">
            SHOP
          </Link>

          <Link to="/#collections">
            COLLECTIONS
          </Link>

          <Link to="/#about">
            OUR STORY
          </Link>

        </nav>

        <div className="checkout-nav-actions">

          <Link
            to="/cart"
            aria-label="Back to cart"
          >
            ←
          </Link>

          <span className="checkout-lock">
            ✦ SECURE
          </span>

        </div>

      </header>

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
            your Lumière order.
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

              {/* COD */}

              <div className="payment-option">

                <div className="payment-radio">
                  <span></span>
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

              </div>

              {/* ONLINE PAYMENT */}

              <div className="payment-option disabled">

                <div className="payment-radio">
                  <span></span>
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
                  COMING SOON
                </span>

              </div>

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

                          <div className="checkout-bottle">

                            <div className="checkout-cap"></div>

                            <div className="checkout-neck"></div>

                            <div className="checkout-body">
                              <span>
                                L
                              </span>
                            </div>

                          </div>

                        </div>

                        {/* PRODUCT INFO */}

                        <div className="checkout-item-info">

                          <span>
                            {
                              item.category
                            }
                          </span>

                          <h3>
                            {
                              item.name
                            }
                          </h3>

                          <p>
                            QTY:{" "}
                            {
                              item.quantity
                            }
                          </p>

                        </div>

                        {/* PRICE */}

                        <strong>
                          ₹
                          {(
                            item.price *
                            item.quantity
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
                    {shipping ===
                    0
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

              <div className="summary-divider"></div>

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
          FOOTER
      ========================= */}

      <footer className="checkout-footer">

        <div className="checkout-footer-logo">
          LUMIÈRE
        </div>

        <p>
          The art of fragrance,
          captured in a bottle.
        </p>

        <span>
          © 2026 LUMIÈRE. ALL RIGHTS RESERVED.
        </span>

      </footer>

    </div>
  );
}

export default Checkout;
