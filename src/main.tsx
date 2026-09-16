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
import AdminDashboard from "./admin/AdminDashboard";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={<App />}
        />

        {/* =========================
            ALL PRODUCTS
        ========================= */}

        <Route
          path="/products"
          element={<ProductPage />}
        />

        {/* =========================
            CATEGORY PRODUCTS
        ========================= */}

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

        {/* =========================
            COLLECTION PRODUCTS
        ========================= */}

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

        {/* =========================
            PRODUCT DETAILS
        ========================= */}

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        {/* =========================
            OUR STORY
        ========================= */}

        <Route
          path="/our-story"
          element={<OurStory />}
        />

        {/* =========================
            CART
        ========================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* =========================
            CHECKOUT
        ========================= */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* =========================
            ORDER SUCCESS
        ========================= */}

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
  path="/admin/orders"
  element={<AdminDashboard />}
/>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);