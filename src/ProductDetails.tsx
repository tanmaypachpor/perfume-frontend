import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./ProductDetails.css";
import logo from "./Images/logo.webp";

interface Product {
  id: number;
  name: string;
  category: string;
  collection: string;
  type?: string;
  price: number;
  description: string;
  imageUrl: string;
  tag: string;
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [imageError, setImageError] =
    useState(false);

  /* =================================================
     FETCH PRODUCT
  ================================================= */

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setImageError(false);

    fetch(
      `http://localhost:8080/api/products/${id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Product not found"
          );
        }

        return response.json();
      })
      .then((data: Product) => {
        console.log(
          "Product details:",
          data
        );

        setProduct(data);
      })
      .catch((fetchError) => {
        console.error(
          "Product details error:",
          fetchError
        );

        setError(
          "Unable to load product."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  /* =================================================
     LOADING
  ================================================= */

  if (loading) {
    return (
      <div className="product-details-page">

        <header className="navbar">

          <a
            href="/"
            className="logo"
            aria-label="Keian home"
          >
            <img
              src={logo}
              alt="KEIAN"
            />
          </a>

          <nav
            className="nav-links"
            aria-label="Main navigation"
          >
            <a href="/">
              Home
            </a>

            <a href="/products">
              Shop
            </a>

            <a href="/#collections">
              Collections
            </a>

            <a href="/#about">
              Our Story
            </a>

            <a href="/bakhoor">
              Bakhoor
            </a>
          </nav>

          <div className="nav-actions">

            <button
              type="button"
              aria-label="Search"
              onClick={() =>
                navigate("/products")
              }
            >
              ⌕
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() =>
                alert(
                  "Wishlist feature coming soon."
                )
              }
            >
              ♡
            </button>

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={() =>
                navigate("/cart")
              }
            >
              ♧
            </button>

          </div>

        </header>

        <div className="product-details-loading">
          Loading product...
        </div>

      </div>
    );
  }

  /* =================================================
     ERROR
  ================================================= */

  if (error || !product) {
    return (
      <div className="product-details-page">

        <header className="navbar">

          <a
            href="/"
            className="logo"
            aria-label="Keian home"
          >
            <img
              src={logo}
              alt="KEIAN"
            />
          </a>

          <nav
            className="nav-links"
            aria-label="Main navigation"
          >
            <a href="/">
              Home
            </a>

            <a href="/products">
              Shop
            </a>

            <a href="/#collections">
              Collections
            </a>

            <a href="/#about">
              Our Story
            </a>

            <a href="/bakhoor">
              Bakhoor
            </a>
          </nav>

          <div className="nav-actions">

            <button
              type="button"
              aria-label="Search"
              onClick={() =>
                navigate("/products")
              }
            >
              ⌕
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() =>
                alert(
                  "Wishlist feature coming soon."
                )
              }
            >
              ♡
            </button>

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={() =>
                navigate("/cart")
              }
            >
              ♧
            </button>

          </div>

        </header>

        <div className="product-details-error">

          <p>
            {error ||
              "Product not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            BACK TO PRODUCTS
          </button>

        </div>

      </div>
    );
  }

  /* =================================================
     PRODUCT IMAGE URL
  ================================================= */

  const productImageUrl =
    product.imageUrl
      ? product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `http://localhost:8080${product.imageUrl}`
      : "";

  /* =================================================
     QUANTITY
  ================================================= */

  const increaseQuantity = () => {
    setQuantity(
      (current) => current + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity(
      (current) =>
        current > 1
          ? current - 1
          : 1
    );
  };

  /* =================================================
     ADD TO CART
  ================================================= */

  const addToCart = () => {
    const existingCart =
      JSON.parse(
        localStorage.getItem(
          "cart"
        ) || "[]"
      );

    const existingProduct =
      existingCart.find(
        (
          item: Product & {
            quantity: number;
          }
        ) =>
          item.id === product.id
      );

    if (existingProduct) {
      existingProduct.quantity +=
        quantity;
    } else {
      existingCart.push({
        ...product,
        quantity,
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    alert(
      `${product.name} added to cart.`
    );
  };

  /* =================================================
     BUY NOW
  ================================================= */

  const buyNow = () => {
    addToCart();
    navigate("/cart");
  };

  /* =================================================
     PRODUCT TYPE
  ================================================= */

  const productType =
    product.type?.trim()
      ? product.type.trim()
      : product.collection?.trim()
      ? product.collection.trim()
      : "EAU DE PARFUM";

  return (
    <div className="product-details-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        {/* KEIAN LOGO */}

        <a
          href="/"
          className="logo"
          aria-label="Keian home"
        >
          <img
            src={logo}
            alt="KEIAN"
          />
        </a>

        {/* NAVIGATION */}

        <nav
          className="nav-links"
          aria-label="Main navigation"
        >

          <a href="/">
            Home
          </a>

          <a href="/products">
            Shop
          </a>

          <a href="/#collections">
            Collections
          </a>

          <a href="/#about">
            Our Story
          </a>

          <a href="/bakhoor">
            Bakhoor
          </a>

        </nav>

        {/* NAV ACTIONS */}

        <div className="nav-actions">

          <button
            type="button"
            aria-label="Search"
            onClick={() =>
              navigate("/products")
            }
          >
            ⌕
          </button>

          <button
            type="button"
            aria-label="Wishlist"
            onClick={() =>
              alert(
                "Wishlist feature coming soon."
              )
            }
          >
            ♡
          </button>

          <button
            type="button"
            aria-label="Shopping bag"
            onClick={() =>
              navigate("/cart")
            }
          >
            ♧
          </button>

        </div>

      </header>


      {/* =================================================
          PRODUCT
      ================================================= */}

      <main className="product-details-container">

        {/* BACK BUTTON */}

        <button
          className="back-button"
          type="button"
          onClick={() =>
            navigate("/products")
          }
        >
          ← BACK TO COLLECTION
        </button>


        <div className="product-details-content">

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div className="product-details-image-container">

            {productImageUrl &&
            !imageError ? (

              <img
                src={productImageUrl}
                alt={product.name}
                className="details-product-image"
                onError={() => {
                  console.error(
                    "Product image failed to load:",
                    productImageUrl
                  );

                  setImageError(
                    true
                  );
                }}
              />

            ) : (

              <div className="details-bottle">

                <div className="details-bottle-cap"></div>

                <div className="details-bottle-neck"></div>

                <div className="details-bottle-body">

                  <span>
                    K
                  </span>

                  <strong>
                    KEIAN
                  </strong>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="product-details-info">

            {/* PRODUCT TAG */}

            {product.tag && (
              <span className="product-details-tag">
                {product.tag}
              </span>
            )}

            {/* CATEGORY */}

            <span className="product-details-category">
              {product.category}
            </span>

            {/* NAME */}

            <h1>
              {product.name}
            </h1>

            {/* PRICE */}

            <p className="product-details-price">
              ₹
              {Number(
                product.price
              ).toLocaleString(
                "en-IN"
              )}
            </p>

            <div className="product-details-line"></div>

            {/* DESCRIPTION */}

            <p className="product-details-description">
              {product.description}
            </p>


            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="product-meta">

              {/* CATEGORY */}

              <div>

                <span>
                  CATEGORY
                </span>

                <strong>
                  {product.category}
                </strong>

              </div>


              {/* COLLECTION */}

              <div>

                <span>
                  COLLECTION
                </span>

                <strong>
                  {product.collection}
                </strong>

              </div>


              {/* TYPE */}

              <div>

                <span>
                  TYPE
                </span>

                <strong>
                  {productType}
                </strong>

              </div>

            </div>


            {/* =================================================
                QUANTITY
            ================================================= */}

            <div className="quantity-section">

              <span>
                QUANTITY
              </span>

              <div className="quantity-control">

                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={
                    decreaseQuantity
                  }
                >
                  −
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={
                    increaseQuantity
                  }
                >
                  +
                </button>

              </div>

            </div>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="product-actions">

              <button
                className="add-to-cart-button"
                type="button"
                onClick={
                  addToCart
                }
              >
                ADD TO CART
              </button>

              <button
                className="buy-now-button"
                type="button"
                onClick={
                  buyNow
                }
              >
                BUY NOW
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            FEATURES
        ================================================= */}

        <section className="product-features">

          <div>

            <span>
              ✦
            </span>

            <strong>
              LONG LASTING
            </strong>

            <p>
              Designed to stay with you
              throughout the day.
            </p>

          </div>


          <div>

            <span>
              ✧
            </span>

            <strong>
              PREMIUM QUALITY
            </strong>

            <p>
              Crafted using carefully
              selected ingredients.
            </p>

          </div>


          <div>

            <span>
              ◇
            </span>

            <strong>
              SECURE PACKAGING
            </strong>

            <p>
              Carefully packed for
              safe delivery.
            </p>

          </div>


          <div>

            <span>
              ✦
            </span>

            <strong>
              KEIAN CRAFT
            </strong>

            <p>
              Created with attention
              to every detail.
            </p>

          </div>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="footer-top">

          {/* BRAND */}

          <div className="footer-brand">

            <div className="footer-logo">
              KEIAN
            </div>

            <p>
              The art of fragrance,
              <br />
              captured in a bottle.
            </p>

          </div>


          {/* SHOP */}

          <div className="footer-column">

            <h4>
              SHOP
            </h4>

            <a href="/products">
              All Fragrances
            </a>

            <a href="/products/him">
              For Him
            </a>

            <a href="/products/her">
              For Her
            </a>

            <a href="/products/unisex">
              Unisex
            </a>

            <a href="/products/oud">
              Oud
            </a>

            <a href="/products/bakhoor">
              Bakhoor
            </a>

          </div>


          {/* ABOUT */}

          <div className="footer-column">

            <h4>
              ABOUT
            </h4>

            <a href="/#about">
              Our Story
            </a>

            <a href="/#about">
              Our Philosophy
            </a>

            <a href="/#about">
              Contact
            </a>

          </div>


          {/* FOLLOW */}

          <div className="footer-column">

            <h4>
              FOLLOW
            </h4>

            <a href="#instagram">
              Instagram
            </a>

            <a href="#facebook">
              Facebook
            </a>

            <a href="#pinterest">
              Pinterest
            </a>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">

          <span>
            © 2026 KEIAN. ALL RIGHTS RESERVED.
          </span>

          <span>
            PRIVACY · TERMS · SHIPPING
          </span>

        </div>

      </footer>

    </div>
  );
}

export default ProductDetails;