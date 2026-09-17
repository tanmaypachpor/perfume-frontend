import { useEffect, useState } from "react";
import "./App.css";
import logo from "./Images/logo.webp";

interface Product {
  id: number;
  name: string;
  category: string;
  type?: string;
  price: number;
  description: string;
  imageUrl: string;
  tag: string;
}

/* =========================
   PRODUCT CARD
========================= */

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const productClasses = [
    "product-noir",
    "product-rose",
    "product-oud",
    "product-bloom",
  ];

  const className =
    productClasses[index % productClasses.length];

  const isBakhoor =
    product.type?.trim().toUpperCase() === "BAKHOOR" ||
    product.category?.trim().toUpperCase() === "BAKHOOR";

  return (
    <article className="product-card">

      <div className={`product-visual ${className}`}>

        {/* PRODUCT TAG */}
        {product.tag && (
          <span className="product-tag">
            {product.tag}
          </span>
        )}

        {/* WISHLIST */}
        <button
          className="wishlist-button"
          aria-label={`Add ${product.name} to wishlist`}
          type="button"
        >
          ♡
        </button>

        {/* =========================
            BAKHOOR VISUAL
        ========================= */}

        {isBakhoor ? (
          <div className="bakhoor-product">

            <div className="bakhoor-smoke smoke-one"></div>
            <div className="bakhoor-smoke smoke-two"></div>
            <div className="bakhoor-smoke smoke-three"></div>

            <div className="bakhoor-burner">

              <div className="burner-top">
                <span>✦</span>
              </div>

              <div className="burner-body">
                L
              </div>

              <div className="burner-base"></div>

            </div>

          </div>
        ) : (

          /* =========================
             PERFUME BOTTLE
          ========================= */

          <div className="product-bottle">

            <div className="mini-cap"></div>

            <div className="mini-neck"></div>

            <div className="mini-body">
              <span>L</span>
            </div>

          </div>
        )}

        {/* QUICK ADD */}
        <button
          className="quick-add"
          type="button"
        >
          QUICK ADD <span>+</span>
        </button>

      </div>

      {/* =========================
          PRODUCT DETAILS
      ========================= */}

      <div className="product-details">

        <span>
          {isBakhoor
            ? "BAKHOOR"
            : "EAU DE PARFUM"}
        </span>

        <h3>
          {product.name}
        </h3>

        <p>
          {product.category}
        </p>

        <strong>
          ₹
          {Number(product.price).toLocaleString(
            "en-IN"
          )}
        </strong>

      </div>

    </article>
  );
}

/* =========================
   NAVBAR
========================= */

function Navbar() {
  return (
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
          onClick={() => {
            window.location.href =
              "/products";
          }}
        >
          ⌕
        </button>

        <button
          type="button"
          aria-label="Wishlist"
          onClick={() => {
            alert(
              "Wishlist feature coming soon."
            );
          }}
        >
          ♡
        </button>

        <button
          type="button"
          aria-label="Shopping bag"
          onClick={() => {
            alert(
              "Shopping bag feature coming soon."
            );
          }}
        >
          ♧
        </button>

      </div>

    </header>
  );
}

/* =========================
   CATEGORY PAGE
========================= */

interface CategoryPageProps {
  category: string;
  title: string;
  description?: string;
}

function CategoryPage({
  category,
  title,
  description,
}: CategoryPageProps) {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================
     FETCH PRODUCTS
  ========================= */

  useEffect(() => {

    setLoading(true);
    setError("");

    fetch(
      "http://localhost:8080/api/products"
    )
      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        return response.json();

      })
      .then((data: Product[]) => {

        console.log(
          "All products:",
          data
        );

        /* =========================
           FILTER PRODUCTS
        ========================= */

        const selectedCategory =
          category
            .trim()
            .toUpperCase();

        const filteredProducts =
          data.filter((product) => {

            const productCategory =
              product.category
                ?.trim()
                .toUpperCase();

            const productType =
              product.type
                ?.trim()
                .toUpperCase();

            /*
             * Match category OR type.
             *
             * This is useful for Bakhoor
             * because existing products may
             * store BAKHOOR in either field.
             */

            return (
              productCategory ===
                selectedCategory ||
              productType ===
                selectedCategory
            );

          });

        console.log(
          `Products for ${category}:`,
          filteredProducts
        );

        setProducts(
          filteredProducts
        );

        setLoading(false);

      })
      .catch((fetchError) => {

        console.error(
          "Product fetch error:",
          fetchError
        );

        setError(
          "Unable to load products. Please try again."
        );

        setLoading(false);

      });

  }, [category]);

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar />

      <main>

        {/* =========================
            CATEGORY HERO
        ========================= */}

        <section className="category-page-hero">

          <div className="category-page-content">

            <span className="section-label">
              KEIAN COLLECTION
            </span>

            <h1>
              {title}
            </h1>

            <div className="category-page-line"></div>

            <p>
              {description ||
                `Discover our carefully curated ${title.toLowerCase()} collection, crafted with exceptional ingredients and timeless elegance.`}
            </p>

          </div>

        </section>

        {/* =========================
            PRODUCTS
        ========================= */}

        <section className="section products-section">

          <div className="section-header centered">

            <span className="section-label">
              EXPLORE THE COLLECTION
            </span>

            <h2>
              {title} <em>Collection</em>
            </h2>

            <p>
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}{" "}
              available
            </p>

          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "70px",
              }}
            >
              Loading{" "}
              {title.toLowerCase()}
              ...
            </div>
          )}

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div
              style={{
                textAlign: "center",
                padding: "70px",
                color: "#9b3d3d",
              }}
            >
              {error}
            </div>
          )}

          {/* =========================
              PRODUCTS
          ========================= */}

          {!loading &&
            !error &&
            products.length > 0 && (

              <div className="product-grid">

                {products.map(
                  (product, index) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />

                  )
                )}

              </div>
            )}

          {/* =========================
              NO PRODUCTS
          ========================= */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div
                style={{
                  textAlign: "center",
                  padding: "70px",
                  color: "#827c73",
                }}
              >

                <h3
                  style={{
                    fontFamily:
                      '"Cormorant Garamond", serif',
                    fontSize: "32px",
                    marginBottom: "12px",
                  }}
                >
                  No Products Found
                </h3>

                <p>
                  There are currently no
                  products available in the{" "}
                  {title} collection.
                </p>

              </div>
            )}

          {/* =========================
              BACK TO SHOP
          ========================= */}

          <div className="center-button">

            <a
              href="/products"
              className="outline-button"
            >
              VIEW ALL PRODUCTS
              <span>→</span>
            </a>

          </div>

        </section>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

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
              All Products
            </a>

            <a href="/him">
              For Him
            </a>

            <a href="/her">
              For Her
            </a>

            <a href="/unisex">
              Unisex
            </a>

            <a href="/oud">
              Oud
            </a>

            <a href="/bakhoor">
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

export default CategoryPage;