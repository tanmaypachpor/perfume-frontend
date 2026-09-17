import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    imageUrl: string;
    tag: string;
}

interface CartItem extends Product {
    quantity: number;
}

function Cart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const navigate = useNavigate();

    // =========================
    // LOAD CART
    // =========================
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const savedCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        setCart(savedCart);
    };

    // =========================
    // UPDATE LOCAL STORAGE
    // =========================
    const updateCart = (updatedCart: CartItem[]) => {
        setCart(updatedCart);
        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );
    };

    // =========================
    // INCREASE QUANTITY
    // =========================
    const increaseQuantity = (id: number) => {
        const updatedCart = cart.map((item) =>
            item.id === id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                }
                : item
        );

        updateCart(updatedCart);
    };

    // =========================
    // DECREASE QUANTITY
    // =========================
    const decreaseQuantity = (id: number) => {
        const updatedCart = cart
            .map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity - 1,
                    }
                    : item
            )
            .filter((item) => item.quantity > 0);

        updateCart(updatedCart);
    };

    // =========================
    // REMOVE PRODUCT
    // =========================
    const removeFromCart = (id: number) => {
        const updatedCart = cart.filter(
            (item) => item.id !== id
        );

        updateCart(updatedCart);
    };

    // =========================
    // CLEAR CART
    // =========================
    const clearCart = () => {
        localStorage.removeItem("cart");
        setCart([]);
    };

    // =========================
    // TOTAL ITEMS
    // =========================
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // =========================
    // SUBTOTAL
    // =========================
    const subtotal = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    // =========================
    // SHIPPING
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
    const total = subtotal + shipping;

    return (
        <div className="cart-page">

            {/* =========================
              NAVBAR
          ========================= */}
            <header className="cart-navbar">

                <Link to="/" className="cart-logo">
                    KEIAN
                </Link>

                <nav className="cart-nav-links">

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

                <div className="cart-nav-actions">

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                        aria-label="Continue shopping"
                    >
                        ←
                    </button>

                    <Link
                        to="/cart"
                        className="cart-icon"
                        aria-label="Shopping cart"
                    >
                        ♧
                        {totalItems > 0 && (
                            <span className="cart-count">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                </div>

            </header>

            {/* =========================
              CART CONTENT
          ========================= */}
            <main className="cart-container">

                {/* HEADER */}
                <div className="cart-header">

                    <span className="section-label">
                        YOUR SELECTION
                    </span>

                    <h1>
                        Shopping <em>Bag</em>
                    </h1>

                    <p>
                        {totalItems === 0
                            ? "Your bag is currently empty."
                            : `${totalItems} ${totalItems === 1
                                ? "item"
                                : "items"
                            } in your bag`}
                    </p>

                </div>

                {/* =========================
                EMPTY CART
            ========================= */}
                {cart.length === 0 && (

                    <div className="empty-cart">

                        <div className="empty-cart-icon">
                            ♧
                        </div>

                        <h2>
                            Your bag is empty
                        </h2>

                        <p>
                            Discover a fragrance that feels
                            uniquely yours.
                        </p>

                        <Link
                            to="/products"
                            className="continue-shopping-button"
                        >
                            EXPLORE FRAGRANCES
                            <span>→</span>
                        </Link>

                    </div>

                )}

                {/* =========================
                CART WITH PRODUCTS
            ========================= */}
                {cart.length > 0 && (

                    <div className="cart-layout">

                        {/* =========================
                    LEFT: PRODUCTS
                ========================= */}
                        <div className="cart-products">

                            <div className="cart-products-top">

                                <span>
                                    PRODUCT
                                </span>

                                <button
                                    type="button"
                                    onClick={clearCart}
                                >
                                    CLEAR BAG
                                </button>

                            </div>

                            {cart.map((item, index) => {

                                const productClasses = [
                                    "product-noir",
                                    "product-rose",
                                    "product-oud",
                                    "product-bloom",
                                ];

                                const className =
                                    productClasses[
                                    index % productClasses.length
                                    ];

                                return (

                                    <div
                                        className="cart-item"
                                        key={item.id}
                                    >

                                        {/* PRODUCT IMAGE */}
                                        <div
                                            className={`cart-product-image ${className}`}
                                            onClick={() =>
                                                navigate(
                                                    `/products/${item.id}`
                                                )
                                            }
                                        >

                                            <div className="cart-bottle">

                                                <div className="cart-mini-cap"></div>

                                                <div className="cart-mini-neck"></div>

                                                <div className="cart-mini-body">
                                                    <span>K</span>
                                                </div>

                                            </div>

                                        </div>

                                        {/* PRODUCT INFO */}
                                        <div className="cart-item-info">

                                            <span className="cart-item-category">
                                                {item.category}
                                            </span>

                                            <h2>
                                                {item.name}
                                            </h2>

                                            <p>
                                                {item.description}
                                            </p>

                                            {item.tag && (
                                                <span className="cart-item-tag">
                                                    {item.tag}
                                                </span>
                                            )}

                                        </div>

                                        {/* PRICE */}
                                        <div className="cart-item-price">

                                            <span>
                                                PRICE
                                            </span>

                                            <strong>
                                                ₹
                                                {item.price.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>

                                        {/* QUANTITY */}
                                        <div className="cart-item-quantity">

                                            <span>
                                                QTY
                                            </span>

                                            <div className="cart-quantity-control">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <strong>
                                                    {item.quantity}
                                                </strong>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>

                                        {/* ITEM TOTAL */}
                                        <div className="cart-item-total">

                                            <span>
                                                TOTAL
                                            </span>

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

                                        {/* REMOVE */}
                                        <button
                                            type="button"
                                            className="remove-cart-item"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            ×
                                        </button>

                                    </div>

                                );
                            })}

                            {/* CONTINUE SHOPPING */}
                            <Link
                                to="/products"
                                className="continue-shopping"
                            >
                                ← CONTINUE SHOPPING
                            </Link>

                        </div>

                        {/* =========================
                    RIGHT: SUMMARY
                ========================= */}
                        <aside className="cart-summary">

                            <span className="summary-label">
                                ORDER SUMMARY
                            </span>

                            <h2>
                                Your <em>Order</em>
                            </h2>

                            <div className="summary-line">
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

                            <div className="summary-line">
                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    {shipping === 0
                                        ? "FREE"
                                        : `₹${shipping}`}
                                </strong>
                            </div>

                            {shipping > 0 && (
                                <p className="shipping-note">
                                    Add ₹
                                    {(
                                        1999 - subtotal
                                    ).toLocaleString(
                                        "en-IN"
                                    )}{" "}
                                    more for free shipping.
                                </p>
                            )}

                            {shipping === 0 && (
                                <p className="shipping-note free">
                                    ✦ You qualify for free shipping.
                                </p>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-total">

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

                            {/* CHECKOUT */}
                            <button
                                type="button"
                                className="checkout-button"
                                onClick={() => navigate("/checkout")}
                            >
                                PROCEED TO CHECKOUT
                                <span>→</span>
                            </button>


                            <div className="cart-security">

                                <span>✦</span>

                                <p>
                                    <strong>
                                        SECURE CHECKOUT
                                    </strong>
                                    <br />
                                    Your information is protected.
                                </p>

                            </div>

                        </aside>

                    </div>

                )}

            </main>

            {/* =========================
              FOOTER
          ========================= */}
            <footer className="cart-footer">

                <div className="cart-footer-logo">
                    KEIAN
                </div>

                <p>
                    The art of fragrance,
                    captured in a bottle.
                </p>

                <span>
                    © 2026 KEIAN. ALL RIGHTS RESERVED.
                </span>

            </footer>

        </div>
    );
}

export default Cart;