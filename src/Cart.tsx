import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Footer } from "./App";
import "./Cart.css";

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

    rating?: number;
    reviewCount?: number;
    topNotes?: string;
    heartNotes?: string;
    baseNotes?: string;
    fragranceFamily?: string;
    concentration?: string;
    volume?: string;
    gender?: string;
    occasion?: string;
    longevity?: string;
}

interface CartItem extends Product {
    quantity: number;
}

function Cart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const navigate = useNavigate();

    /* =========================================================
       LOAD CART
    ========================================================= */

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        try {
            const savedCart = JSON.parse(
                localStorage.getItem("cart") || "[]"
            );

            if (Array.isArray(savedCart)) {
                setCart(savedCart);
            } else {
                setCart([]);
            }
        } catch (error) {
            console.error(
                "Unable to load cart:",
                error
            );

            setCart([]);
        }
    };

    /* =========================================================
       UPDATE CART
    ========================================================= */

    const updateCart = (
        updatedCart: CartItem[]
    ) => {
        setCart(updatedCart);

        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );

        window.dispatchEvent(
            new Event("cartUpdated")
        );
    };

    /* =========================================================
       INCREASE QUANTITY
    ========================================================= */

    const increaseQuantity = (
        id: number
    ) => {
        const updatedCart = cart.map(
            (item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity:
                            item.quantity + 1,
                    }
                    : item
        );

        updateCart(updatedCart);
    };

    /* =========================================================
       DECREASE QUANTITY
    ========================================================= */

    const decreaseQuantity = (
        id: number
    ) => {
        const updatedCart = cart
            .map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity:
                            item.quantity - 1,
                    }
                    : item
            )
            .filter(
                (item) =>
                    item.quantity > 0
            );

        updateCart(updatedCart);
    };

    /* =========================================================
       REMOVE PRODUCT
    ========================================================= */

    const removeFromCart = (
        id: number
    ) => {
        const updatedCart =
            cart.filter(
                (item) =>
                    item.id !== id
            );

        updateCart(updatedCart);
    };

    /* =========================================================
       CLEAR CART
    ========================================================= */

    const clearCart = () => {
        localStorage.removeItem(
            "cart"
        );

        setCart([]);

        window.dispatchEvent(
            new Event("cartUpdated")
        );
    };

    /* =========================================================
       TOTAL ITEMS
    ========================================================= */

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    /* =========================================================
       SUBTOTAL
    ========================================================= */

    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.price) *
                    item.quantity,
            0
        );

    /* =========================================================
       SHIPPING
    ========================================================= */

    const freeShippingThreshold =
        1999;

    const shipping =
        subtotal === 0
            ? 0
            : subtotal >=
              freeShippingThreshold
                ? 0
                : 99;

    /* =========================================================
       TOTAL
    ========================================================= */

    const total =
        subtotal + shipping;

    /* =========================================================
       SHIPPING PROGRESS
    ========================================================= */

    const shippingProgress =
        Math.min(
            (subtotal /
                freeShippingThreshold) *
                100,
            100
        );

    const amountRemaining =
        Math.max(
            freeShippingThreshold -
                subtotal,
            0
        );

    /* =========================================================
       FORMAT PRICE
    ========================================================= */

    const formatPrice = (
        value: number
    ) => {
        return `₹${Number(
            value
        ).toLocaleString("en-IN")}`;
    };

    return (
        <div className="cart-page">

            {/* =================================================
                SHARED KEIAN NAVBAR
            ================================================= */}

            <Navbar />


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="cart-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <section className="cart-header">

                    <div className="cart-header-label">

                        <span className="header-line"></span>

                        <span>
                            YOUR SELECTION
                        </span>

                    </div>

                    <h1>
                        Shopping <em>Bag</em>
                    </h1>

                    <p>
                        {totalItems === 0
                            ? "Your selection is currently empty."
                            : `${totalItems} ${
                                totalItems === 1
                                    ? "piece"
                                    : "pieces"
                            } selected`}
                    </p>

                </section>


                {/* =================================================
                    EMPTY CART
                ================================================= */}

                {cart.length === 0 && (

                    <section className="empty-cart">

                        <div className="empty-cart-index">
                            01
                        </div>

                        <div className="empty-cart-content">

                            <span>
                                YOUR BAG IS EMPTY
                            </span>

                            <h2>
                                Begin with a
                                <em>
                                    {" "}fragrance.
                                </em>
                            </h2>

                            <p>
                                Explore the KEIAN collection
                                and find a scent that feels
                                distinctly yours.
                            </p>

                            <Link
                                to="/products"
                                className="empty-cart-link"
                            >

                                <span>
                                    Explore fragrances
                                </span>

                                <strong>
                                    →
                                </strong>

                            </Link>

                        </div>

                    </section>

                )}


                {/* =================================================
                    CART
                ================================================= */}

                {cart.length > 0 && (

                    <div className="cart-layout">

                        {/* =================================================
                            PRODUCTS
                        ================================================= */}

                        <section className="cart-products">

                            <div className="cart-products-heading">

                                <div>

                                    <span>
                                        YOUR FRAGRANCES
                                    </span>

                                    <strong>
                                        {totalItems}{" "}
                                        {totalItems === 1
                                            ? "piece"
                                            : "pieces"}
                                    </strong>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        clearCart
                                    }
                                    className="clear-bag-button"
                                >
                                    Clear bag
                                </button>

                            </div>


                            {/* =================================================
                                PRODUCT ITEMS
                            ================================================= */}

                            <div className="cart-items">

                                {cart.map(
                                    (item) => (

                                        <article
                                            className="cart-item"
                                            key={item.id}
                                        >

                                            {/* PRODUCT IMAGE */}

                                            <button
                                                type="button"
                                                className="cart-product-image"
                                                onClick={() =>
                                                    navigate(
                                                        `/products/${item.id}`
                                                    )
                                                }
                                                aria-label={`View ${item.name}`}
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
                                                        event.currentTarget.style.opacity =
                                                            "0";
                                                    }}
                                                />

                                            </button>


                                            {/* PRODUCT INFORMATION */}

                                            <div className="cart-item-info">

                                                <span className="cart-item-category">

                                                    {item.category ||
                                                        "FRAGRANCE"}

                                                </span>

                                                <h2>
                                                    {item.name}
                                                </h2>

                                                {item.description && (
                                                    <p>
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                )}

                                                {item.tag && (
                                                    <span className="cart-item-tag">
                                                        {
                                                            item.tag
                                                        }
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    className="mobile-remove-button"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>

                                            </div>


                                            {/* UNIT PRICE */}

                                            <div className="cart-item-price">

                                                <span>
                                                    PRICE
                                                </span>

                                                <strong>
                                                    {formatPrice(
                                                        Number(
                                                            item.price
                                                        )
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
                                                        aria-label={`Decrease quantity of ${item.name}`}
                                                    >
                                                        −
                                                    </button>

                                                    <strong>
                                                        {
                                                            item.quantity
                                                        }
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                item.id
                                                            )
                                                        }
                                                        aria-label={`Increase quantity of ${item.name}`}
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </div>


                                            {/* TOTAL */}

                                            <div className="cart-item-total">

                                                <span>
                                                    TOTAL
                                                </span>

                                                <strong>
                                                    {formatPrice(
                                                        Number(
                                                            item.price
                                                        ) *
                                                            item.quantity
                                                    )}
                                                </strong>

                                            </div>


                                            {/* REMOVE */}

                                            <button
                                                type="button"
                                                className="remove-cart-item"
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.id
                                                    )
                                                }
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                ×
                                            </button>

                                        </article>

                                    )
                                )}

                            </div>


                            {/* =================================================
                                CONTINUE SHOPPING
                            ================================================= */}

                            <div className="cart-continue-row">

                                <Link
                                    to="/products"
                                    className="continue-shopping"
                                >

                                    <span>
                                        ←
                                    </span>

                                    Continue shopping

                                </Link>

                            </div>

                        </section>


                        {/* =================================================
                            ORDER SUMMARY
                        ================================================= */}

                        <aside className="cart-summary">

                            <div className="summary-top">

                                <span>
                                    ORDER SUMMARY
                                </span>

                                <h2>
                                    Your <em>Order</em>
                                </h2>

                            </div>


                            {/* =================================================
                                SHIPPING MESSAGE
                            ================================================= */}

                            {shipping > 0 && (

                                <div className="shipping-message">

                                    <p>

                                        Add{" "}

                                        <strong>
                                            {formatPrice(
                                                amountRemaining
                                            )}
                                        </strong>{" "}

                                        more for complimentary
                                        shipping.

                                    </p>

                                    <div className="shipping-track">

                                        <div
                                            className="shipping-fill"
                                            style={{
                                                width: `${shippingProgress}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                            )}


                            {shipping === 0 &&
                                subtotal > 0 && (

                                    <div className="shipping-message shipping-complete">

                                        <span>
                                            ✓
                                        </span>

                                        <p>
                                            Complimentary shipping
                                            has been applied.
                                        </p>

                                    </div>

                                )}


                            {/* =================================================
                                PRICE DETAILS
                            ================================================= */}

                            <div className="summary-details">

                                <div className="summary-row">

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatPrice(
                                            subtotal
                                        )}
                                    </strong>

                                </div>


                                <div className="summary-row">

                                    <span>
                                        Shipping
                                    </span>

                                    <strong>
                                        {shipping === 0
                                            ? "Complimentary"
                                            : formatPrice(
                                                shipping
                                            )}
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                TOTAL
                            ================================================= */}

                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatPrice(
                                        total
                                    )}
                                </strong>

                            </div>


                            {/* =================================================
                                CHECKOUT
                            ================================================= */}

                            <button
                                type="button"
                                className="checkout-button"
                                onClick={() =>
                                    navigate(
                                        "/checkout"
                                    )
                                }
                            >

                                <span>
                                    Proceed to checkout
                                </span>

                                <strong>
                                    →
                                </strong>

                            </button>


                            {/* =================================================
                                SMALL SERVICE NOTE
                            ================================================= */}

                            <div className="summary-note">

                                <span>
                                    KEIAN
                                </span>

                                <p>
                                    Secure checkout ·
                                    Carefully packed ·
                                    Complimentary shipping
                                    over ₹1,999
                                </p>

                            </div>

                        </aside>

                    </div>

                )}


                {/* =================================================
                    BRAND NOTE
                ================================================= */}

                {cart.length > 0 && (

                    <section className="cart-brand-note">

                        <div className="brand-note-mark">
                            K
                        </div>

                        <div className="brand-note-line"></div>

                        <p>
                            Fragrance, considered
                            from first note to final detail.
                        </p>

                    </section>

                )}

            </main>


            {/* =================================================
                SHARED KEIAN FOOTER
            ================================================= */}

            <Footer />

        </div>
    );
}

export default Cart;