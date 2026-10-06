import { useEffect, useState } from "react";
import "@/styles/storefront.css";

import giftImage from "@/assets/images/optimized/gifts.webp";
import attarImage from "@/assets/images/optimized/attar.webp";
import perfumeImage from "@/assets/images/optimized/perfume.webp";
import dhakoonImage from "@/assets/images/optimized/dakhoonimages.webp";
import heroBanner from "@/assets/images/optimized/Banner02.webp";

import { supabase } from "@/shared/lib/supabaseClient";
import {
  HomeCollections,
  HomeStory,
  NewsletterSection,
  TrustBar,
} from "@/features/home/components/HomeSections";
import { HomeProductCard } from "@/features/home/components/HomeProductCard";
import { Footer, Navbar } from "@/shared/components/layout/SiteChrome";

/* =========================================================
   PRODUCT INTERFACE
========================================================= */

interface Product {
  id: number;
  name: string;
  category: string;
  collection?: string;
  price: number;
  description: string;
  imageUrl: string;
  secondUrl?: string;
  tag: string;
}

/* =========================================================
   SUPABASE PRODUCT HELPER
========================================================= */

async function fetchProducts(): Promise<Product[]> {
  const { data, error } =
    await supabase
      .from("products")
      .select(
        `
        id,
        name,
        category,
        collection,
        price,
        description,
        "imageUrl",
        "secondUrl",
        tag
        `
      )
      .eq("active", true)
      .order("id", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Supabase product error:",
      error
    );

    throw new Error(
      "Failed to fetch products from Supabase"
    );
  }

  return (data || []) as Product[];
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

  const [activeCategory, setActiveCategory] =
    useState<BestSellerCategory>("HIM");

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        console.log(
          "Products from Supabase:",
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
     FILTER PRODUCTS
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
          style={{
            backgroundImage: `url(${heroBanner})`,
          }}
        >
          <div className="hero-content">

            <div className="eyebrow">
              <span></span>

              THE ART OF FRAGRANCE

              <span></span>
            </div>

            <h1>
              <span>
                A Scent
              </span>

              <em>
                That Defines
              </em>

              <span>
                You.
              </span>
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
                SHOP Now

                <span>
                  →
                </span>
              </a>

              <a
                href="#about"
                className="secondary-button"
              >
                DISCOVER KEIAN
              </a>

            </div>

          </div>
        </section>

        {/* =================================================
            TRUST BAR
        ================================================= */}

        <TrustBar />

        {/* =================================================
            COLLECTIONS
        ================================================= */}

        <HomeCollections
          perfumeImage={perfumeImage}
          attarImage={attarImage}
          giftImage={giftImage}
          bakhoorImage={dhakoonImage}
        />

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
              Our{" "}
              <em>
                Bestsellers
              </em>
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
                            <HomeProductCard
                              key={product.id}
                              product={product}
                              index={index}
                            />
                          )
                        )}

                    </div>

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
                    </strong>.

                  </div>
                )}
              </>
            )}

          {/* NO PRODUCTS */}

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

        <HomeStory />

        {/* =================================================
            NEWSLETTER
        ================================================= */}

        <NewsletterSection />

      </main>

      <Footer />

    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return <HomePage />;
}

export default App;
