import { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";
import { supabase } from "./lib/supabaseClient";

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
    payment_status: string;
    order_status: string;
    created_at: string;
}

interface OrderItem {
    id: string;
    order_id: string;
    product_id: number | null;
    product_name: string;
    quantity: number;
    price: number;
}

interface OrderWithItems extends Order {
    items: OrderItem[];
}

function AdminDashboard() {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] =
        useState<OrderWithItems | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // =====================================================
    // LOAD ORDERS
    // =====================================================

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const {
                data: orderData,
                error: orderError,
            } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", {
                    ascending: false,
                });

            if (orderError) {
                throw orderError;
            }

            const {
                data: itemData,
                error: itemError,
            } = await supabase
                .from("order_items")
                .select("*");

            if (itemError) {
                throw itemError;
            }

            const ordersWithItems: OrderWithItems[] =
                (orderData || []).map((order) => ({
                    ...order,
                    items: (itemData || []).filter(
                        (item) =>
                            item.order_id === order.id
                    ),
                }));

            setOrders(ordersWithItems);
        } catch (err) {
            console.error(
                "Admin order loading error:",
                err
            );

            if (
                err &&
                typeof err === "object" &&
                "message" in err
            ) {
                setError(
                    String(
                        (err as { message?: unknown })
                            .message
                    )
                );
            } else {
                setError(
                    "Unable to load orders."
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {
        try {
            const { error } =
                await supabase.auth.signOut();

            if (error) {
                console.error(
                    "Logout error:",
                    error
                );
                alert(
                    "Unable to logout. Please try again."
                );
                return;
            }

            window.location.href =
                "/admin/login";
        } catch (err) {
            console.error(
                "Logout error:",
                err
            );

            alert(
                "Unable to logout. Please try again."
            );
        }
    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
        (sum, order) =>
            sum + Number(order.total || 0),
        0
    );

    const pendingOrders = orders.filter(
        (order) =>
            order.order_status === "PENDING"
    ).length;

    const deliveredOrders = orders.filter(
        (order) =>
            order.order_status === "DELIVERED"
    ).length;

    // =====================================================
    // FILTER ORDERS
    // =====================================================

    const filteredOrders = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                !searchValue ||
                order.customer_name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                order.customer_email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                order.customer_phone
                    ?.toLowerCase()
                    .includes(searchValue) ||
                order.id
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                order.order_status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [orders, search, statusFilter]);

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateOrderStatus = async (
        orderId: string,
        newStatus: string
    ) => {
        try {
            const {
                error: updateError,
            } = await supabase
                .from("orders")
                .update({
                    order_status: newStatus,
                })
                .eq("id", orderId);

            if (updateError) {
                throw updateError;
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            order_status:
                                newStatus,
                        }
                        : order
                )
            );

            setSelectedOrder((current) =>
                current &&
                    current.id === orderId
                    ? {
                        ...current,
                        order_status:
                            newStatus,
                    }
                    : current
            );
        } catch (err) {
            console.error(
                "Status update error:",
                err
            );

            alert(
                "Unable to update order status."
            );
        }
    };

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatPrice = (
        value: number
    ) => {
        return `₹${Number(
            value || 0
        ).toLocaleString("en-IN")}`;
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date: string
    ) => {
        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatTime = (
        date: string
    ) => {
        return new Date(
            date
        ).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =====================================================
    // SHORT ORDER ID
    // =====================================================

    const shortOrderId = (
        id: string
    ) => {
        return `#${id
            .substring(0, 8)
            .toUpperCase()}`;
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-logo">
                    KEIAN
                </div>

                <div className="admin-spinner" />

                <p>
                    Loading admin dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="admin-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">

                <div className="admin-brand">

                    <div className="admin-brand-name">
                        KEIAN
                    </div>

                    <span>
                        ADMIN PANEL
                    </span>

                </div>

                <nav className="admin-nav">

                    <button className="admin-nav-item active">
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button className="admin-nav-item">
                        <span>▤</span>
                        Orders
                    </button>

                    <button className="admin-nav-item">
                        <span>◇</span>
                        Products
                    </button>

                    <button className="admin-nav-item">
                        <span>♙</span>
                        Customers
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">

                    <div className="admin-status">

                        <span className="status-dot" />

                        <div>

                            <strong>
                                System Online
                            </strong>

                            <small>
                                Supabase connected
                            </small>

                        </div>

                    </div>

                    <div className="admin-version">
                        KEIAN ADMIN v1.0
                    </div>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="admin-main">

                {/* HEADER */}

                <header className="admin-header">

                    <div>

                        <span className="admin-eyebrow">
                            OVERVIEW
                        </span>

                        <h1>
                            Good morning,{" "}
                            <em>Admin.</em>
                        </h1>

                        <p>
                            Here's what's happening
                            with your store.
                        </p>

                    </div>

                    <div className="admin-header-actions">

                        <button
                            className="refresh-button"
                            onClick={loadOrders}
                        >
                            ↻
                            <span>
                                Refresh
                            </span>
                        </button>

                        <button
                            className="admin-logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>

                {/* ERROR */}

                {error && (
                    <div className="admin-error">

                        <strong>
                            Unable to load dashboard
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <section className="admin-stats">

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span>
                                TOTAL ORDERS
                            </span>

                            <div className="stat-icon">
                                ↗
                            </div>

                        </div>

                        <strong>
                            {totalOrders}
                        </strong>

                        <p>
                            All orders received
                        </p>

                    </div>

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span>
                                TOTAL REVENUE
                            </span>

                            <div className="stat-icon">
                                ₹
                            </div>

                        </div>

                        <strong>
                            {formatPrice(
                                totalRevenue
                            )}
                        </strong>

                        <p>
                            Across all orders
                        </p>

                    </div>

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span>
                                PENDING
                            </span>

                            <div className="stat-icon">
                                ◷
                            </div>

                        </div>

                        <strong>
                            {pendingOrders}
                        </strong>

                        <p>
                            Awaiting processing
                        </p>

                    </div>

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span>
                                DELIVERED
                            </span>

                            <div className="stat-icon">
                                ✓
                            </div>

                        </div>

                        <strong>
                            {deliveredOrders}
                        </strong>

                        <p>
                            Successfully delivered
                        </p>

                    </div>

                </section>

                {/* =================================================
                    ORDERS SECTION
                ================================================= */}

                <section className="orders-section">

                    <div className="orders-header">

                        <div>

                            <span className="admin-eyebrow">
                                SALES
                            </span>

                            <h2>
                                Recent{" "}
                                <em>Orders</em>
                            </h2>

                        </div>

                        <span className="order-count">
                            {filteredOrders.length}{" "}
                            orders
                        </span>

                    </div>

                    {/* FILTERS */}

                    <div className="orders-toolbar">

                        <div className="search-box">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search customer, email or order ID..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="CONFIRMED">
                                Confirmed
                            </option>

                            <option value="PROCESSING">
                                Processing
                            </option>

                            <option value="SHIPPED">
                                Shipped
                            </option>

                            <option value="DELIVERED">
                                Delivered
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>

                        </select>

                    </div>

                    {/* ORDERS */}

                    {filteredOrders.length === 0 ? (

                        <div className="empty-orders">

                            <div>
                                ◇
                            </div>

                            <h3>
                                No orders found
                            </h3>

                            <p>
                                Orders will appear here
                                when customers place them.
                            </p>

                        </div>

                    ) : (

                        <div className="orders-table-wrapper">

                            <table className="orders-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ORDER
                                        </th>

                                        <th>
                                            CUSTOMER
                                        </th>

                                        <th>
                                            PRODUCTS
                                        </th>

                                        <th>
                                            TOTAL
                                        </th>

                                        <th>
                                            PAYMENT
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            DATE
                                        </th>

                                        <th>
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredOrders.map(
                                        (order) => (

                                            <tr
                                                key={
                                                    order.id
                                                }
                                            >

                                                {/* ORDER */}

                                                <td>

                                                    <button
                                                        className="order-id-button"
                                                        onClick={() =>
                                                            setSelectedOrder(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        {shortOrderId(
                                                            order.id
                                                        )}
                                                    </button>

                                                </td>

                                                {/* CUSTOMER */}

                                                <td>

                                                    <div className="customer-cell">

                                                        <div className="customer-avatar">

                                                            {order.customer_name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    order.customer_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    order.customer_email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* PRODUCTS */}

                                                <td>

                                                    <div className="products-cell">

                                                        {order.items
                                                            .slice(
                                                                0,
                                                                2
                                                            )
                                                            .map(
                                                                (
                                                                    item
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.product_name
                                                                        }{" "}
                                                                        ×{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>

                                                                )
                                                            )}

                                                        {order.items.length >
                                                            2 && (

                                                                <small>
                                                                    +
                                                                    {order
                                                                        .items
                                                                        .length -
                                                                        2}{" "}
                                                                    more
                                                                </small>

                                                            )}

                                                    </div>

                                                </td>

                                                {/* TOTAL */}

                                                <td>

                                                    <strong className="order-total">

                                                        {formatPrice(
                                                            Number(
                                                                order.total
                                                            )
                                                        )}

                                                    </strong>

                                                </td>

                                                {/* PAYMENT */}

                                                <td>

                                                    <span
                                                        className={`payment-status ${order.payment_status
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`}
                                                    >
                                                        {
                                                            order.payment_status
                                                        }
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <select
                                                        className={`order-status-select status-${order.order_status
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`}
                                                        value={
                                                            order.order_status
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateOrderStatus(
                                                                order.id,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >

                                                        <option value="PENDING">
                                                            Pending
                                                        </option>

                                                        <option value="CONFIRMED">
                                                            Confirmed
                                                        </option>

                                                        <option value="PROCESSING">
                                                            Processing
                                                        </option>

                                                        <option value="SHIPPED">
                                                            Shipped
                                                        </option>

                                                        <option value="DELIVERED">
                                                            Delivered
                                                        </option>

                                                        <option value="CANCELLED">
                                                            Cancelled
                                                        </option>

                                                    </select>

                                                </td>

                                                {/* DATE */}

                                                <td>

                                                    <div className="date-cell">

                                                        <span>
                                                            {formatDate(
                                                                order.created_at
                                                            )}
                                                        </span>

                                                        <small>
                                                            {formatTime(
                                                                order.created_at
                                                            )}
                                                        </small>

                                                    </div>

                                                </td>

                                                {/* VIEW */}

                                                <td>

                                                    <button
                                                        className="view-order-button"
                                                        onClick={() =>
                                                            setSelectedOrder(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        →
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

            {/* =================================================
                ORDER DETAIL MODAL
            ================================================= */}

            {selectedOrder && (

                <div
                    className="order-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="order-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"
                            onClick={() =>
                                setSelectedOrder(null)
                            }
                        >
                            ×
                        </button>

                        <div className="modal-header">

                            <div>

                                <span className="admin-eyebrow">
                                    ORDER DETAILS
                                </span>

                                <h2>
                                    Order{" "}
                                    <em>
                                        {shortOrderId(
                                            selectedOrder.id
                                        )}
                                    </em>
                                </h2>

                            </div>

                            <span
                                className={`modal-status status-${selectedOrder.order_status
                                    .toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        "-"
                                    )}`}
                            >
                                {
                                    selectedOrder.order_status
                                }
                            </span>

                        </div>

                        {/* CUSTOMER */}

                        <div className="modal-section">

                            <div className="modal-section-title">
                                CUSTOMER
                            </div>

                            <div className="customer-detail-grid">

                                <div>

                                    <span>
                                        NAME
                                    </span>

                                    <strong>
                                        {
                                            selectedOrder.customer_name
                                        }
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        EMAIL
                                    </span>

                                    <strong>
                                        {
                                            selectedOrder.customer_email
                                        }
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        PHONE
                                    </span>

                                    <strong>
                                        {
                                            selectedOrder.customer_phone ||
                                            "—"
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* ADDRESS */}

                        <div className="modal-section">

                            <div className="modal-section-title">
                                SHIPPING ADDRESS
                            </div>

                            <p className="address-text">

                                {
                                    selectedOrder.address ||
                                    "—"
                                }

                                <br />

                                {
                                    selectedOrder.city ||
                                    ""
                                }

                                {selectedOrder.city &&
                                    selectedOrder.state
                                    ? ", "
                                    : ""}

                                {
                                    selectedOrder.state ||
                                    ""
                                }

                                <br />

                                {
                                    selectedOrder.pincode ||
                                    ""
                                }

                            </p>

                        </div>

                        {/* PRODUCTS */}

                        <div className="modal-section">

                            <div className="modal-section-title">
                                ORDER ITEMS
                            </div>

                            <div className="modal-products">

                                {selectedOrder.items.map(
                                    (item) => (

                                        <div
                                            className="modal-product"
                                            key={
                                                item.id
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        item.product_name
                                                    }
                                                </strong>

                                                <span>
                                                    Qty:{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                            </div>

                                            <strong>
                                                {formatPrice(
                                                    Number(
                                                        item.price
                                                    ) *
                                                    item.quantity
                                                )}
                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                        {/* SUMMARY */}

                        <div className="modal-summary">

                            <div>

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    {formatPrice(
                                        Number(
                                            selectedOrder.subtotal
                                        )
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    {Number(
                                        selectedOrder.shipping
                                    ) === 0
                                        ? "FREE"
                                        : formatPrice(
                                            Number(
                                                selectedOrder.shipping
                                            )
                                        )}
                                </strong>

                            </div>

                            <div className="modal-total">

                                <span>
                                    TOTAL
                                </span>

                                <strong>
                                    {formatPrice(
                                        Number(
                                            selectedOrder.total
                                        )
                                    )}
                                </strong>

                            </div>

                        </div>

                        {/* PAYMENT */}

                        <div className="modal-payment">

                            <div>

                                <span>
                                    PAYMENT
                                </span>

                                <strong>
                                    {
                                        selectedOrder.payment_status
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    ORDER DATE
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedOrder.created_at
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminDashboard;
