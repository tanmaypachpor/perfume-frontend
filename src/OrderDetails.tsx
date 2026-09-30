import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OrderDetails.css";
import { supabase } from "./lib/supabaseClient";

// =========================
// ORDER ITEM
// =========================

interface OrderItem {
    id?: string;
    order_id: string;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
}

// =========================
// ORDER
// =========================

interface Order {
    id: string;
    created_at: string;
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
    payment_status: string;
    order_status: string;

    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;

    address?: string;
    city?: string;
    state?: string;
    pincode?: string;

    items: OrderItem[];
}

// =========================
// ORDER DETAILS
// =========================

function OrderDetails() {
    const navigate = useNavigate();
    const { id: orderId } = useParams();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // LOAD ORDER
    // =========================

    useEffect(() => {
        if (!orderId) {
            setError("Order ID is missing.");
            setLoading(false);
            return;
        }

        loadOrder(orderId);
    }, [orderId]);

    const loadOrder = async (id: string) => {
        try {
            setLoading(true);
            setError("");

            // =========================
            // GET CURRENT USER
            // =========================

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error(
                    "Unable to get current user:",
                    userError
                );

                setError(
                    "Unable to verify your account. Please sign in again."
                );

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
            // GET ORDER
            // =========================
            //
            // IMPORTANT:
            // We check BOTH:
            // id = orderId
            // user_id = logged-in user
            //
            // This prevents a customer from
            // accessing another customer's
            // order through the URL.
            // =========================

            const {
                data: orderData,
                error: orderError,
            } = await supabase
                .from("orders")
                .select(
                    `
                    id,
                    created_at,
                    subtotal,
                    shipping,
                    total,
                    currency,
                    payment_status,
                    order_status,
                    customer_name,
                    customer_email,
                    customer_phone,
                    address,
                    city,
                    state,
                    pincode
                    `
                )
                .eq("id", id)
                .eq("user_id", user.id)
                .maybeSingle();

            if (orderError) {
                console.error(
                    "Order loading error:",
                    orderError
                );

                setError(
                    orderError.message ||
                        "Unable to load this order."
                );

                return;
            }

            // =========================
            // ORDER NOT FOUND
            // =========================

            if (!orderData) {
                setError(
                    "Order not found or you do not have permission to view it."
                );

                return;
            }

            // =========================
            // GET ORDER ITEMS
            // =========================

            const {
                data: itemData,
                error: itemsError,
            } = await supabase
                .from("order_items")
                .select(
                    `
                    id,
                    order_id,
                    product_id,
                    product_name,
                    quantity,
                    price
                    `
                )
                .eq("order_id", id);

            if (itemsError) {
                console.error(
                    "Order items loading error:",
                    itemsError
                );

                setError(
                    itemsError.message ||
                        "Unable to load the items for this order."
                );

                return;
            }

            // =========================
            // FORMAT ORDER
            // =========================

            const formattedOrder: Order = {
                ...orderData,

                subtotal: Number(
                    orderData.subtotal
                ),

                shipping: Number(
                    orderData.shipping
                ),

                total: Number(
                    orderData.total
                ),

                items: (itemData || []).map(
                    (item) => ({
                        ...item,

                        product_id: Number(
                            item.product_id
                        ),

                        quantity: Number(
                            item.quantity
                        ),

                        price: Number(
                            item.price
                        ),
                    })
                ),
            };

            setOrder(formattedOrder);

            console.log(
                "ORDER DETAILS:",
                formattedOrder
            );
        } catch (err) {
            console.error(
                "Order details error:",
                err
            );

            setError(
                "Something went wrong while loading your order."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FORMAT DATE
    // =========================

    const formatDate = (
        dateString: string
    ) => {
        return new Date(
            dateString
        ).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );
    };

    // =========================
    // FORMAT TIME
    // =========================

    const formatTime = (
        dateString: string
    ) => {
        return new Date(
            dateString
        ).toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    // =========================
    // FORMAT ORDER ID
    // =========================

    const formatOrderId = (
        id: string
    ) => {
        return `#${id
            .slice(0, 8)
            .toUpperCase()}`;
    };

    // =========================
    // FORMAT CURRENCY
    // =========================

    const formatCurrency = (
        amount: number,
        currency: string = "INR"
    ) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
            }
        ).format(amount);
    };

    // =========================
    // STATUS CLASS
    // =========================

    const getStatusClass = (
        status: string
    ) => {
        return status
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="order-details-loading">
                <div className="order-loading-mark">
                    ◇
                </div>

                <p>
                    Loading your order...
                </p>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error || !order) {
        return (
            <div className="order-details-page">

                <div className="order-details-error-page">

                    <span className="order-details-eyebrow">
                        KEIAN
                    </span>

                    <div className="error-symbol">
                        ×
                    </div>

                    <h1>
                        Order Unavailable
                    </h1>

                    <p>
                        {error ||
                            "We couldn't find this order."}
                    </p>

                    <div className="error-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/orders"
                                )
                            }
                        >
                            BACK TO ORDERS
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/"
                                )
                            }
                        >
                            CONTINUE SHOPPING
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    // =========================
    // UI
    // =========================

    return (
        <div className="order-details-page">

            <div className="order-details-container">

                {/* =========================
                    BACK
                ========================= */}

                <button
                    type="button"
                    className="back-to-orders"
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    ← BACK TO MY ORDERS
                </button>

                {/* =========================
                    HEADER
                ========================= */}

                <header className="order-details-header">

                    <div>
                        <span className="order-details-eyebrow">
                            KEIAN
                        </span>

                        <h1>
                            Order Details
                        </h1>

                        <p>
                            Thank you for choosing
                            KEIAN. Here are the
                            details of your order.
                        </p>
                    </div>

                    <div className="order-number-block">

                        <span>
                            ORDER
                        </span>

                        <strong>
                            {formatOrderId(
                                order.id
                            )}
                        </strong>

                        <small>
                            {formatDate(
                                order.created_at
                            )}
                            {" · "}
                            {formatTime(
                                order.created_at
                            )}
                        </small>

                    </div>

                </header>

                {/* =========================
                    STATUS SECTION
                ========================= */}

                <section className="order-status-section">

                    <div className="status-card">

                        <div className="status-card-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                ORDER STATUS
                            </span>

                            <strong
                                className={`status ${getStatusClass(
                                    order.order_status
                                )}`}
                            >
                                {order.order_status}
                            </strong>
                        </div>

                    </div>

                    <div className="status-card">

                        <div className="status-card-icon">
                            ₹
                        </div>

                        <div>
                            <span>
                                PAYMENT
                            </span>

                            <strong
                                className={`status ${getStatusClass(
                                    order.payment_status
                                )}`}
                            >
                                {order.payment_status}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* =========================
                    MAIN GRID
                ========================= */}

                <div className="order-details-grid">

                    {/* =========================
                        ORDER ITEMS
                    ========================= */}

                    <section className="order-items-section">

                        <div className="section-heading">

                            <div>
                                <span>
                                    YOUR PURCHASE
                                </span>

                                <h2>
                                    Ordered Items
                                </h2>
                            </div>

                            <strong>
                                {order.items.length}{" "}
                                {order.items.length ===
                                1
                                    ? "ITEM"
                                    : "ITEMS"}
                            </strong>

                        </div>

                        <div className="details-items-list">

                            {order.items.length >
                            0 ? (
                                order.items.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            className="details-item"
                                            key={
                                                item.id ||
                                                `${order.id}-${item.product_id}-${index}`
                                            }
                                        >

                                            <div className="item-number">
                                                {String(
                                                    index +
                                                        1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </div>

                                            <div className="details-item-info">

                                                <span>
                                                    FRAGRANCE
                                                </span>

                                                <h3>
                                                    {
                                                        item.product_name
                                                    }
                                                </h3>

                                                <p>
                                                    Quantity:{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </p>

                                            </div>

                                            <div className="details-item-price">

                                                <span>
                                                    {formatCurrency(
                                                        item.price,
                                                        order.currency
                                                    )}{" "}
                                                    ×{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        item.price *
                                                            item.quantity,
                                                        order.currency
                                                    )}
                                                </strong>

                                            </div>

                                        </div>
                                    )
                                )
                            ) : (
                                <div className="empty-items">
                                    <p>
                                        Order items
                                        are currently
                                        unavailable.
                                    </p>
                                </div>
                            )}

                        </div>

                    </section>

                    {/* =========================
                        SUMMARY
                    ========================= */}

                    <aside className="order-summary-section">

                        <div className="summary-heading">
                            <span>
                                PAYMENT SUMMARY
                            </span>

                            <h2>
                                Order Total
                            </h2>
                        </div>

                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                {formatCurrency(
                                    order.subtotal,
                                    order.currency
                                )}
                            </strong>

                        </div>

                        <div className="summary-row">

                            <span>
                                Shipping
                            </span>

                            <strong>
                                {order.shipping ===
                                0
                                    ? "FREE"
                                    : formatCurrency(
                                          order.shipping,
                                          order.currency
                                      )}
                            </strong>

                        </div>

                        <div className="summary-divider" />

                        <div className="summary-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatCurrency(
                                    order.total,
                                    order.currency
                                )}
                            </strong>

                        </div>

                        <div className="payment-method">

                            <span>
                                PAYMENT STATUS
                            </span>

                            <strong
                                className={`status ${getStatusClass(
                                    order.payment_status
                                )}`}
                            >
                                {order.payment_status}
                            </strong>

                        </div>

                    </aside>

                </div>

                {/* =========================
                    CUSTOMER / DELIVERY
                ========================= */}

                <section className="customer-information">

                    <div className="section-heading">

                        <div>
                            <span>
                                DELIVERY INFORMATION
                            </span>

                            <h2>
                                Customer & Address
                            </h2>
                        </div>

                    </div>

                    <div className="customer-info-grid">

                        {/* =========================
                            CUSTOMER
                        ========================= */}

                        <div className="customer-info-card">

                            <span className="info-card-label">
                                CUSTOMER
                            </span>

                            <div className="info-content">

                                <div className="info-row">

                                    <span>
                                        NAME
                                    </span>

                                    <strong>
                                        {order.customer_name ||
                                            "Not available"}
                                    </strong>

                                </div>

                                <div className="info-row">

                                    <span>
                                        EMAIL
                                    </span>

                                    <strong>
                                        {order.customer_email ||
                                            "Not available"}
                                    </strong>

                                </div>

                                <div className="info-row">

                                    <span>
                                        PHONE
                                    </span>

                                    <strong>
                                        {order.customer_phone ||
                                            "Not available"}
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* =========================
                            DELIVERY ADDRESS
                        ========================= */}

                        <div className="customer-info-card">

                            <span className="info-card-label">
                                DELIVERY ADDRESS
                            </span>

                            <div className="address-content">

                                <strong>
                                    {order.customer_name ||
                                        "Customer"}
                                </strong>

                                <p>
                                    {order.address ||
                                        "Address not available"}
                                </p>

                                {(order.city ||
                                    order.state ||
                                    order.pincode) && (
                                    <p>
                                        {[
                                            order.city,
                                            order.state,
                                            order.pincode,
                                        ]
                                            .filter(
                                                Boolean
                                            )
                                            .join(
                                                ", "
                                            )}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {/* =========================
                    BOTTOM ACTIONS
                ========================= */}

                <div className="order-details-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/orders"
                            )
                        }
                    >
                        ← BACK TO MY ORDERS
                    </button>

                    <button
                        type="button"
                        className="continue-shopping"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        CONTINUE SHOPPING
                    </button>

                </div>

            </div>

        </div>
    );
}

export default OrderDetails;