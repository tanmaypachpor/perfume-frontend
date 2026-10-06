import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const App = lazy(() => import("@/features/home/pages/HomePage"));
const ProductPage = lazy(() => import("@/features/catalog/pages/ProductsPage"));
const ProductDetails = lazy(() => import("@/features/catalog/pages/ProductDetails"));
const OurStory = lazy(() => import("@/features/content/pages/OurStory"));
const Cart = lazy(() => import("@/features/cart/pages/Cart"));
const Checkout = lazy(() => import("@/features/checkout/pages/Checkout"));
const OrderSuccess = lazy(() => import("@/features/orders/pages/OrderSuccess"));
const ContactPage = lazy(() => import("@/features/content/pages/ContactPage"));
const AdminLogin = lazy(() => import("@/features/admin/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Account = lazy(() => import("@/features/account/pages/Account"));
const MyOrders = lazy(() => import("@/features/orders/pages/MyOrders"));
const OrderDetails = lazy(() => import("@/features/orders/pages/OrderDetails"));
const AdminProtectedRoute = lazy(() => import("@/features/admin/pages/AdminProtectedRoute"));

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <main
          className="route-loading"
          role="status"
          aria-live="polite"
        >
          Loading…
        </main>
      }
    >
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/him" element={<ProductPage />} />
        <Route path="/products/her" element={<ProductPage />} />
        <Route path="/products/unisex" element={<ProductPage />} />
        <Route path="/products/oud" element={<ProductPage />} />
        <Route path="/products/perfumes" element={<ProductPage />} />
        <Route path="/products/attars" element={<ProductPage />} />
        <Route path="/products/gift-sets" element={<ProductPage />} />
        <Route path="/products/bakhoor" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/account" element={<Account />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
