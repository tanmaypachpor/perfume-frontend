import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";
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
// MY ORDERS
// =========================

function MyOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // LOAD ORDERS
    // =========================

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            // =========================
            // GET LOGGED-IN USER
            // =========================

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            console.log("CURRENT USER:", user);
            console.log("USER ID:", user?.id);
            console.log("USER ERROR:", userError);

            if (userError) {
                console.error(
                    "Unable to get current user:",
                    userError
                );

                setError(
                    "Unable to verify your account. Please sign in again."
                );

                setLoading(false);
                return;
            }

            if (!user) {
                navigate("/login");
                return;
            }

            // =========================
            // GET USER ORDERS
            // =========================

            const {
                data: orderData,
                error: ordersError,
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
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false,
                });

            if (ordersError) {
                console.error(
                    "Orders loading error:",
                    ordersError
                );

                setError(
                    ordersError.message ||
                        "Unable to load your orders. Please try again."
                );

                return;
            }

            // =========================
            // NO ORDERS
            // =========================

            if (!orderData || orderData.length === 0) {
                setOrders([]);
                return;
            }

            // =========================
            // GET ORDER ITEMS
            // =========================

            const orderIds = orderData.map(
                (order) => order.id
            );

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
                .in("order_id", orderIds);

            if (itemsError) {
                console.error(
                    "Order items loading error:",
                    itemsError
                );

                setError(
                    itemsError.message ||
                        "Unable to load your order items."
                );

                return;
            }

            // =========================
            // ATTACH ITEMS TO ORDERS
            // =========================

            const formattedOrders: Order[] =
                orderData.map((order) => ({
                    ...order,
                    subtotal: Number(order.subtotal),
                    shipping: Number(order.shipping),
                    total: Number(order.total),

                    items:
                        (itemData || [])
                            .filter(
                                (item) =>
                                    item.order_id ===
                                    order.id
                            )
                            .map((item) => ({
                                ...item,
                                product_id:
                                    Number(
                                        item.product_id
                                    ),
                                quantity:
                                    Number(
                                        item.quantity
                                    ),
                                price:
                                    Number(
                                        item.price
                                    ),
                            })),
                }));

            setOrders(formattedOrders);

            console.log(
                "MY ORDERS:",
                formattedOrders
            );
        } catch (err) {
            console.error(
                "My orders error:",
                err
            );

            setError(
                "Something went wrong while loading your orders."
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
            <div className="orders-loading">
                <span>
                    Loading your orders...
                </span>
            </div>
        );
    }

    // =========================
    // UI
    // =========================

    return (
        <div className="my-orders-page">

            <div className="my-orders-container">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="orders-header">

                    <span className="orders-eyebrow">
                        KEIAN
                    </span>

                    <h1>
                        My Orders
                    </h1>

                    <p>
                        View and manage your KEIAN
                        fragrance orders.
                    </p>

                </div>

                {/* =========================
                    ERROR
                ========================= */}

                {error && (
                    <div className="orders-error">
                        {error}

                        <button
                            type="button"
                            onClick={loadOrders}
                        >
                            TRY AGAIN
                        </button>
                    </div>
                )}

                {/* =========================
                    NO ORDERS
                ========================= */}

                {!error &&
                    orders.length === 0 && (
                        <div className="no-orders">

                            <div className="no-orders-icon">
                                ◇
                            </div>

                            <h2>
                                No orders yet
                            </h2>

                            <p>
                                Your fragrance journey
                                starts here.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/products"
                                    )
                                }
                            >
                                EXPLORE COLLECTION
                            </button>

                        </div>
                    )}

                {/* =========================
                    ORDERS
                ========================= */}

                {orders.length > 0 && (
                    <div className="orders-list">

                        {orders.map(
                            (order) => (
                                <div
                                    className="order-card"
                                    key={
                                        order.id
                                    }
                                >

                                    {/* =========================
                                        ORDER HEADER
                                    ========================= */}

                                    <div className="order-card-top">

                                        <div>

                                            <span className="order-label">
                                                ORDER
                                            </span>

                                            <h2>
                                                {formatOrderId(
                                                    order.id
                                                )}
                                            </h2>

                                        </div>

                                        <div className="order-date">
                                            {formatDate(
                                                order.created_at
                                            )}
                                        </div>

                                    </div>

                                    <div className="order-divider" />

                                    {/* =========================
                                        ORDER ITEMS
                                    ========================= */}

                                    <div className="my-order-items">

                                        {order.items.length >
                                        0 ? (
                                            order.items.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        className="my-order-item"
                                                        key={
                                                            item.id ||
                                                            `${order.id}-${item.product_id}-${index}`
                                                        }
                                                    >

                                                        <div className="my-order-item-info">

                                                            <span className="my-order-item-category">
                                                                FRAGRANCE
                                                            </span>

                                                            <h3>
                                                                {
                                                                    item.product_name
                                                                }
                                                            </h3>

                                                            <p>
                                                                QTY:{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>

                                                        </div>

                                                        <strong>
                                                            {formatCurrency(
                                                                item.price *
                                                                    item.quantity,
                                                                order.currency
                                                            )}
                                                        </strong>

                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p className="no-order-items">
                                                Order items
                                                unavailable.
                                            </p>
                                        )}

                                    </div>

                                    <div className="order-divider" />

                                    {/* =========================
                                        ORDER INFORMATION
                                    ========================= */}

                                    <div className="order-info">

                                        <div className="order-info-item">

                                            <span>
                                                SUBTOTAL
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    order.subtotal,
                                                    order.currency
                                                )}
                                            </strong>

                                        </div>

                                        <div className="order-info-item">

                                            <span>
                                                SHIPPING
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

                                        <div className="order-info-item">

                                            <span>
                                                TOTAL
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    order.total,
                                                    order.currency
                                                )}
                                            </strong>

                                        </div>

                                        <div className="order-info-item">

                                            <span>
                                                PAYMENT
                                            </span>

                                            <strong
                                                className={`status ${getStatusClass(
                                                    order.payment_status
                                                )}`}
                                            >
                                                {
                                                    order.payment_status
                                                }
                                            </strong>

                                        </div>

                                        <div className="order-info-item">

                                            <span>
                                                ORDER STATUS
                                            </span>

                                            <strong
                                                className={`status ${getStatusClass(
                                                    order.order_status
                                                )}`}
                                            >
                                                {
                                                    order.order_status
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                    {/* =========================
                                        BOTTOM
                                    ========================= */}

                                    <div className="order-card-bottom">

                                        <span>
                                            {
                                                order.items
                                                    .length
                                            }{" "}
                                            {order.items
                                                .length ===
                                            1
                                                ? "ITEM"
                                                : "ITEMS"}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/orders/${order.id}`
                                                )
                                            }
                                        >
                                            VIEW ORDER →
                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default MyOrders;
