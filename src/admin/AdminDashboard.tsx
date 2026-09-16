import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./AdminDashboard.css";

interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
  imageUrl?: string;
  tag?: string;
}

interface Order {
  id: string;
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  orderDate: string;
  paymentMethod: string;
  shipping: number;
  status: string;
  subtotal: number;
  total: number;
  totalItems: number;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "orders")
      );

      const ordersData: Order[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          orderId: data.orderId || "",
          customer: data.customer || {},
          items: data.items || [],
          orderDate: data.orderDate || "",
          paymentMethod: data.paymentMethod || "",
          shipping: data.shipping || 0,
          status: data.status || "PLACED",
          subtotal: data.subtotal || 0,
          total: data.total || 0,
          totalItems: data.totalItems || 0,
        };
      });

      // Show newest orders first
      ordersData.sort(
        (a, b) =>
          new Date(b.orderDate).getTime() -
          new Date(a.orderDate).getTime()
      );

      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>LUMIÈRE</h1>
          <p>Admin Order Dashboard</p>
        </div>

        <button onClick={fetchOrders} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-title">
          <h2>Orders</h2>
          <span>{orders.length} Total Orders</span>
        </div>

        {loading && (
          <div className="loading">
            Loading orders...
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            No orders found.
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderId}</strong>
                    </td>

                    <td>
                      <div className="customer-name">
                        {order.customer.name}
                      </div>

                      <div className="customer-phone">
                        {order.customer.phone}
                      </div>
                    </td>

                    <td>
                      {order.items.length > 0
                        ? order.items
                            .map(
                              (item) =>
                                `${item.name} × ${item.quantity}`
                            )
                            .join(", ")
                        : "No items"}
                    </td>

                    <td>
                      ₹{order.total.toLocaleString("en-IN")}
                    </td>

                    <td>
                      {order.paymentMethod}
                    </td>

                    <td>
                      <span
                        className={`status status-${order.status
                          .toLowerCase()
                          .replaceAll("_", "-")}`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      {order.orderDate
                        ? new Date(
                            order.orderDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;