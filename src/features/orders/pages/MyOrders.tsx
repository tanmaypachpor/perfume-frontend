import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/features/orders/pages/MyOrders.css";
import { supabase } from "@/shared/lib/supabaseClient";
import { MyOrderCard } from "@/features/orders/components/MyOrderCard";
import type { Order } from "@/features/orders/types/orderTypes";

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

                        {orders.map((order) => (
                            <MyOrderCard
                                key={order.id}
                                order={order}
                                onViewOrder={(orderId) =>
                                    navigate(`/orders/${orderId}`)
                                }
                            />
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default MyOrders;
