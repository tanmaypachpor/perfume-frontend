import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import App from "./App";
import ProductPage from "./ProductsPage";
import ProductDetails from "./ProductDetails";
import OurStory from "./OurStory";
import Cart from "./Cart";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import ContactPage from "./ContactPage";

import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminProtectedRoute from "./AdminProtectedRoute";

import Register from "./Register";
import Login from "./Login";

import Account from "./Account";
import MyOrders from "./MyOrders";
import OrderDetails from "./OrderDetails";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            CUSTOMER WEBSITE
        ===================================================== */}

        <Route
          path="/"
          element={<App />}
        />

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <Route
          path="/products"
          element={<ProductPage />}
        />

        <Route
          path="/products/him"
          element={<ProductPage />}
        />

        <Route
          path="/products/her"
          element={<ProductPage />}
        />

        <Route
          path="/products/unisex"
          element={<ProductPage />}
        />

        <Route
          path="/products/oud"
          element={<ProductPage />}
        />

        <Route
          path="/products/perfumes"
          element={<ProductPage />}
        />

        <Route
          path="/products/attars"
          element={<ProductPage />}
        />

        <Route
          path="/products/gift-sets"
          element={<ProductPage />}
        />

        <Route
          path="/products/bakhoor"
          element={<ProductPage />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        {/* =====================================================
            OUR STORY
        ===================================================== */}

        <Route
          path="/our-story"
          element={<OurStory />}
        />

        {/* =====================================================
            CART
        ===================================================== */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* =====================================================
            CHECKOUT
        ===================================================== */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* =====================================================
            ORDER SUCCESS
            Example:
            /order-success/b803cf47-7f7b-4d8e-a782-7874a833ddc4
        ===================================================== */}

        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />

        {/* =====================================================
            CUSTOMER ORDERS
        ===================================================== */}

        <Route
          path="/orders"
          element={<MyOrders />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        <Route
          path="/account"
          element={<Account />}
        />

        {/* =====================================================
            CONTACT
        ===================================================== */}

        <Route
          path="/contact"
          element={<ContactPage />}
        />

        {/* =====================================================
            AUTHENTICATION
        ===================================================== */}

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================================
            ADMIN LOGIN
        ===================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =====================================================
            PROTECTED ADMIN DASHBOARD
        ===================================================== */}

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN ORDERS
        ===================================================== */}

        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  </React.StrictMode>
);