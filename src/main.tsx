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

import "./index.css";

ReactDOM.createRoot(
    document.getElementById("root")!
).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>

                {/* =========================
                    CUSTOMER WEBSITE
                ========================= */}

                <Route
                    path="/"
                    element={<App />}
                />

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

                <Route
                    path="/our-story"
                    element={<OurStory />}
                />

                <Route
                    path="/cart"
                    element={<Cart />}
                />

                <Route
                    path="/checkout"
                    element={<Checkout />}
                />

                <Route
                    path="/order-success"
                    element={<OrderSuccess />}
                />

                <Route
                    path="/contact"
                    element={<ContactPage />}
                />


                {/* =========================
                    ADMIN LOGIN
                ========================= */}

                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />


                {/* =========================
                    PROTECTED ADMIN
                ========================= */}

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
        </BrowserRouter>
    </React.StrictMode>
);