import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

import logo from "./Images/logo.webp";
import perfumeBottle from "./Images/Perfume_Bottle_Mockup.png";
import giftImage from "./Images/gift.jpg";
import attarImage from "./Images/attar.jpg";
import perfumeImage from "./Images/perfume.jpg";
import dhakoonImage from "./Images/dakhoonimages.jpg";
import storyImage from "./Images/story.jpg";

import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface Product {
  id: number;
  name: string;
  category: string;
  collection?: string;
  price: number;
  description: string;
  imageUrl: string;
  tag: string;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [wishlist, setWishlist] = useState(false);

  const navigate = useNavigate();

  const productClasses = [
    "product-noir",
    "product-rose",
    "product-oud",
    "product-bloom",
  ];

  const isBakhoor =
    product.category?.toLowerCase() === "bakhoor";

  const className =
    productClasses[index % productClasses.length];

  const toggleWishlist = () => {
    setWishlist((current) => !current);
  };

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <article
      className="product-card"
      onClick={handleProductClick}
      style={{ cursor: "pointer" }}
    >
      <div
        className={`product-visual ${
          isBakhoor ? "" : className
        }`}
      >
        {/* PRODUCT TAG */}

        {product.tag && (
          <span className="product-tag">
            {product.tag}
          </span>
        )}

        {/* WISHLIST */}

        <button
          className="wishlist-button"
          aria-label={
            wishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlist}
          onClick={(event) => {
            event.stopPropagation();
            toggleWishlist();
          }}
        >
          {wishlist ? "♥" : "♡"}
        </button>

        {/* =================================================
            BAKHOOR PRODUCT
        ================================================= */}

        {isBakhoor ? (
          <div className="bakhoor-product">
            <div className="bakhoor-burner">
              <div className="bakhoor-smoke smoke-one"></div>
              <div className="bakhoor-smoke smoke-two"></div>
              <div className="bakhoor-smoke smoke-three"></div>

              <div className="burner-top">
                <span>✦</span>
              </div>

              <div className="burner-body">
                K
              </div>

              <div className="burner-base"></div>
            </div>
          </div>
        ) : (
          /* =================================================
             PERFUME PRODUCT IMAGE FROM DATABASE
          ================================================= */

          <div className="product-image-wrapper">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="product-bottle">
                <div className="mini-cap"></div>

                <div className="mini-neck"></div>

                <div className="mini-body">
                  <span>K</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUICK ADD */}

        <button
          className="quick-add"
          onClick={(event) => {
            event.stopPropagation();

            console.log(
              "Quick add:",
              product.name
            );
          }}
        >
          QUICK ADD

          <span>+</span>
        </button>
      </div>

      {/* PRODUCT DETAILS */}

      <div className="product-details">
        <span>
          {isBakhoor
            ? "PREMIUM BAKHOOR"
            : "EAU DE PARFUM"}
        </span>

        <h3>{product.name}</h3>

        <p>{product.category}</p>

        {product.description && (
          <p>{product.description}</p>
        )}

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

/* =========================================================
   NAVBAR
========================================================= */

export function Navbar() {
  return (
    <header className="navbar">

      {/* TOP ROW */}

      <div className="nav-top-row">

        <a
          href="/"
          className="logo"
          aria-label="Keian home"
        >
          <img
            src={logo}
            alt="Keian Logo"
          />

          <span className="logo-text">
            KEIAN
          </span>
        </a>

        <div className="nav-actions">

          <button
            aria-label="Search"
            onClick={() => {
              window.location.href =
                "/products";
            }}
          >
            ⌕
          </button>

          <button
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
      </div>

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
      </nav>

    </header>
  );
}

/* =========================================================
   API HELPER
========================================================= */

const API_URL =
  "http://localhost:8080/api/products";

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      "Failed to fetch products"
    );
  }

  const data = await response.json();

  return data;
}

/* =========================================================
   LOADING MESSAGE
========================================================= */

function LoadingMessage() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "70px 20px",
        color: "#827c73",
      }}
    >
      Loading fragrances...
    </div>
  );
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "70px 20px",
        color: "#9b3d3d",
      }}
    >
      {message}
    </div>
  );
}

/* =========================================================
   BEST SELLER CATEGORY TYPE
========================================================= */

type BestSellerCategory =
  | "HIM"
  | "HER"
  | "ATTAR"
  | "GIFTING";

/* =========================================================
   CHECK PRODUCT CATEGORY
========================================================= */

function matchesBestSellerCategory(
  product: Product,
  selectedCategory: BestSellerCategory
) {
  const category =
    product.category
      ?.trim()
      .toUpperCase();

  const collection =
    product.collection
      ?.trim()
      .toUpperCase();

  switch (selectedCategory) {
    case "HIM":
      return (
        category === "HIM" ||
        category === "MEN" ||
        category === "MAN" ||
        category === "FOR HIM"
      );

    case "HER":
      return (
        category === "HER" ||
        category === "WOMEN" ||
        category === "WOMAN" ||
        category === "FOR HER"
      );

    case "ATTAR":
      return (
        category === "ATTAR" ||
        category === "ATTARS" ||
        collection === "ATTAR" ||
        collection === "ATTARS"
      );

    case "GIFTING":
      return (
        category === "GIFTING" ||
        category === "GIFT" ||
        category === "GIFTS" ||
        category === "GIFT SET" ||
        category === "GIFT SETS" ||
        collection === "GIFTING" ||
        collection === "GIFT SET" ||
        collection === "GIFT SETS"
      );

    default:
      return false;
  }
}

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     BEST SELLER ACTIVE CATEGORY
  ===================================================== */

  const [activeCategory, setActiveCategory] =
    useState<BestSellerCategory>("HIM");

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        console.log(
          "Products from database:",
          data
        );

        setProducts(data);
      })
      .catch((error) => {
        console.error(
          "Error fetching products:",
          error
        );

        setError(
          "Unable to load products. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =====================================================
     FILTER BEST SELLER PRODUCTS
  ===================================================== */

  const filteredProducts =
    products.filter((product) =>
      matchesBestSellerCategory(
        product,
        activeCategory
      )
    );

  return (
    <div className="app">

      <Navbar />

      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="hero"
          id="home"
        >

          <div className="hero-background-circle"></div>

          <div className="hero-content">

            <div className="eyebrow">
              <span></span>

              THE ART OF FRAGRANCE

              <span></span>
            </div>

            <h1>
              A Scent
              <br />
              <em>That Defines</em>
              <br />
              You.
            </h1>

            <p className="hero-description">
              Discover extraordinary fragrances crafted
              with exquisite ingredients and timeless
              elegance.
            </p>

            <div className="hero-buttons">

              <a
                href="#shop"
                className="primary-button"
              >
                SHOP COLLECTION

                <span>→</span>
              </a>

              <a
                href="#about"
                className="secondary-button"
              >
                DISCOVER KEIAN
              </a>

            </div>

          </div>

          {/* HERO PRODUCT */}

          <div className="hero-product">

            <div className="hero-orbit orbit-one"></div>

            <div className="hero-orbit orbit-two"></div>

            <div className="hero-bottle">

              <div className="perfume-display-wrapper">

                <div className="bottle-container">

                  <img
                    src={perfumeBottle}
                    alt="Keian Luxury Perfume Bottle"
                  />

                </div>

              </div>

            </div>

            <div className="floating-note note-one">

              <span>01</span>

              <p>
                Woody
                <br />
                Amber
              </p>

            </div>

            <div className="floating-note note-two">

              <span>02</span>

              <p>
                Deep
                <br />
                Mystery
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            TRUST BAR
        ================================================= */}

        <section className="trust-bar">

          <div>
            <span>✦</span>

            <strong>
              LONG LASTING
            </strong>

            <small>
              Up to 12 hours
            </small>
          </div>

          <div>
            <span>✧</span>

            <strong>
              PREMIUM QUALITY
            </strong>

            <small>
              Finest ingredients
            </small>
          </div>

          <div>
            <span>◇</span>

            <strong>
              FREE SHIPPING
            </strong>

            <small>
              On orders above ₹1,999
            </small>
          </div>

          <div>
            <span>✦</span>

            <strong>
              CRAFTED WITH CARE
            </strong>

            <small>
              Made for you
            </small>
          </div>

        </section>

        {/* =================================================
            COLLECTIONS
        ================================================= */}

        <section
          className="section categories"
          id="collections"
        >

          <div className="section-header">

            <div>

              <span className="section-label">
                EXPLORE
              </span>

              <h2>
                Discover Our{" "}
                <em>Collections</em>
              </h2>

            </div>

            <p>
              Explore our finest fragrances,
              traditional attars, luxurious gift
              sets and aromatic dhakoon.
            </p>

          </div>

          <div className="category-grid">

            {/* PERFUMES */}

            <a
              href="/products/perfumes"
              className="category-card collection-card category-perfumes"
            >

              <img
                src={giftImage}
                alt="Perfumes"
                className="collection-image"
              />

              <div className="category-overlay">

                <span>
                  DISCOVER
                </span>

                <h3>
                  Perfumes
                </h3>

                <p>
                  Elegant · Timeless · Refined →
                </p>

              </div>

            </a>

            {/* ATTARS */}

            <a
              href="/products/attars"
              className="category-card collection-card category-attars"
            >

              <img
                src={attarImage}
                alt="Attars"
                className="collection-image"
              />

              <div className="category-overlay">

                <span>
                  DISCOVER
                </span>

                <h3>
                  Attars
                </h3>

                <p>
                  Traditional · Rich · Fragrant →
                </p>

              </div>

            </a>

            {/* GIFT SETS */}

            <a
              href="/products/gift-sets"
              className="category-card collection-card category-giftsets"
            >

              <img
                src={perfumeImage}
                alt="Gift Sets"
                className="collection-image"
              />

              <div className="category-overlay">

                <span>
                  DISCOVER
                </span>

                <h3>
                  Gift Sets
                </h3>

                <p>
                  Luxury · Thoughtful · Special →
                </p>

              </div>

            </a>

            {/* DHAKOON */}

            <a
              href="/products/bakhoor"
              className="category-card collection-card category-dhakoon"
            >

              <img
                src={dhakoonImage}
                alt="Dhakoon"
                className="collection-image"
              />

              <div className="category-overlay">

                <span>
                  DISCOVER
                </span>

                <h3>
                  Dhakoon
                </h3>

                <p>
                  Smoky · Aromatic · Luxurious →
                </p>

              </div>

            </a>

          </div>

        </section>

        {/* =================================================
            BEST SELLERS
        ================================================= */}

        <section
          className="section products-section"
          id="shop"
        >

          <div className="section-header centered">

            <span className="section-label">
              THE COLLECTION
            </span>

            <h2>
              Our <em>Bestsellers</em>
            </h2>

            <p>
              Fragrances loved by those who know
              what they want.
            </p>

          </div>

          {/* BEST SELLER TABS */}

          <div className="best-seller-tabs">

            <button
              type="button"
              className={`best-seller-tab ${
                activeCategory === "HIM"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory("HIM")
              }
            >
              HIM
            </button>

            <button
              type="button"
              className={`best-seller-tab ${
                activeCategory === "HER"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory("HER")
              }
            >
              HER
            </button>

            <button
              type="button"
              className={`best-seller-tab ${
                activeCategory === "ATTAR"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory("ATTAR")
              }
            >
              ATTAR
            </button>

            <button
              type="button"
              className={`best-seller-tab ${
                activeCategory === "GIFTING"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory("GIFTING")
              }
            >
              GIFTING
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <LoadingMessage />
          )}

          {/* ERROR */}

          {error && (
            <ErrorMessage
              message={error}
            />
          )}

          {/* PRODUCTS */}

          {!loading &&
            !error &&
            products.length > 0 && (
              <>

                {filteredProducts.length > 0 ? (
                  <>

                    <div className="product-grid">

                      {filteredProducts
                        .slice(0, 4)
                        .map(
                          (
                            product,
                            index
                          ) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              index={index}
                            />
                          )
                        )}

                    </div>

                    {/* VIEW ALL FRAGRANCES */}

                    <div className="view-all-fragrances">

                      <a href="/products">

                        <span>
                          View All Fragrances
                        </span>

                      </a>

                    </div>

                  </>
                ) : (

                  <div className="no-products-message">

                    No products available in{" "}

                    <strong>
                      {activeCategory}
                    </strong>
                    .

                  </div>

                )}

              </>
            )}

          {/* NO PRODUCTS FROM API */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="no-products-message">
                No fragrances available.
              </div>

            )}

        </section>

        {/* =================================================
            STORY
        ================================================= */}

        <section
          className="story"
          id="about"
        >

          <div className="story-image">

            <img
              src={storyImage}
              alt="Keian luxury perfume bottle"
            />

            <div className="story-overlay"></div>

          </div>

          <div className="story-content">

            <span className="section-label">
              OUR PHILOSOPHY
            </span>

            <h2>
              More Than
              <br />
              <em>A Fragrance.</em>
            </h2>

            <div className="gold-line"></div>

            <p>
              We believe a fragrance is more than a scent.
              It is a memory, an emotion, a feeling that
              stays long after you've left the room.
            </p>

            <p>
              Every Keian creation is carefully composed
              using exceptional ingredients to create
              something truly unforgettable.
            </p>

            <a
              href="/our-story"
              className="text-link"
            >
              OUR STORY

              <span>
                →
              </span>
            </a>

          </div>

        </section>

        {/* =================================================
            NEWSLETTER
        ================================================= */}

        <section className="newsletter">

          <span className="section-label">
            JOIN THE WORLD OF KEIAN
          </span>

          <h2>
            Your next signature
            <br />
            <em>is waiting.</em>
          </h2>

          <p>
            Subscribe for exclusive launches, fragrance
            stories, and special offers.
          </p>

          <form
            className="newsletter-form"
            onSubmit={(event) => {
              event.preventDefault();

              alert(
                "Thank you for subscribing to Keian."
              );
            }}
          >

            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              required
            />

            <button type="submit">

              SUBSCRIBE

              <span>
                →
              </span>

            </button>

          </form>

        </section>

      </main>

      <Footer />

    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        {/* BRAND */}

        <div className="footer-brand">

          <div className="footer-logo">

            <img
              src="src\Images\logo01.webp"
              alt="KEIAN"
            />

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

          <a href="/products/attars">
            Attars
          </a>

          <a href="/products/gift-sets">
            Gift Sets
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
            Dhakoon
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

          <a href="/#about">
            Journal
          </a>

        </div>

        {/* FOLLOW */}

        <div className="footer-column footer-social">

          <h4>
            FOLLOW
          </h4>

          <a
            href="#instagram"
            aria-label="Instagram"
          >
            <FaInstagram />
            <span>
              Instagram
            </span>
          </a>

          <a
            href="#facebook"
            aria-label="Facebook"
          >
            <FaFacebookF />
            <span>
              Facebook
            </span>
          </a>

          <a
            href="#pinterest"
            aria-label="Pinterest"
          >
            <FaPinterestP />
            <span>
              Pinterest
            </span>
          </a>

        </div>

        {/* CONTACT */}

        <div className="footer-column footer-contact">

          <h4>
            CONTACT
          </h4>

          <div className="contact-item">

            <FaMapMarkerAlt />

            <span>
              KEIAN Fragrances
              <br />
              Pune, Maharashtra
              <br />
              India
            </span>

          </div>

          <a
            href="mailto:info@keian.com"
            className="contact-item"
          >

            <FaEnvelope />

            <span>
              info@keian.com
            </span>

          </a>

          <a
            href="tel:+919999999999"
            className="contact-item"
          >

            <FaPhone />

            <span>
              +91 99999 99999
            </span>

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
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return <HomePage />;
}

export default App;