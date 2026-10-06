import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "@/styles/storefront.css";
import { Footer, Navbar } from "@/shared/components/layout/SiteChrome";
import { supabase } from "@/shared/lib/supabaseClient";
import { CatalogProductCard } from "@/features/catalog/components/CatalogProductCard";

interface Product {
  id: number;
  name: string;
  category: string;
  collection: string;
  price: number;
  description: string;
  imageUrl: string;
  secondUrl?: string;
  tag: string;
}

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================================
     GET CURRENT CATEGORY FROM URL
     
     Examples:
     /products/him
     /products/her
     /products/unisex
     /products/perfumes
     /products/attars
     /products/oud
     /products/bakhoor
     /products/gift-sets
  ========================================================= */

  const category = location.pathname
    .split("/")
    .filter(Boolean)[1];

  /* =========================================================
     FETCH PRODUCTS FROM SUPABASE
  ========================================================= */

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * Start with all active products
         */
        let query = supabase
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

        /*
         * CATEGORY FILTERS
         */

        if (category === "him") {
          query = query.eq("category", "HIM");
        } else if (category === "her") {
          query = query.eq("category", "HER");
        } else if (category === "unisex") {
          query = query.eq("category", "UNISEX");
        } else if (category === "perfumes") {
          query = query.eq("collection", "PERFUME");
        } else if (category === "attars") {
          query = query.eq("collection", "ATTAR");
        } else if (category === "oud") {
          query = query.eq("collection", "OUD");
        } else if (category === "bakhoor") {
          query = query.eq("collection", "BAKHOOR");
        } else if (category === "gift-sets") {
          query = query.eq("collection", "GIFTING");
        }

        const {
          data,
          error: supabaseError,
        } = await query;

        if (supabaseError) {
          console.error(
            "Supabase product error:",
            supabaseError
          );

          throw supabaseError;
        }

        console.log(
          "Products from Supabase:",
          data
        );

        setProducts(
          (data || []) as Product[]
        );
      } catch (fetchError) {
        console.error(
          "Error fetching products:",
          fetchError
        );

        setError(
          "Unable to load products. Please try again."
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  /* =========================================================
     PRODUCT CARD CLASSES
  ========================================================= */

  const productClasses = [
    "product-noir",
    "product-rose",
    "product-oud",
    "product-bloom",
  ];

  /* =========================================================
     PRODUCT TYPE
  ========================================================= */

  const getProductType = (
    product: Product
  ) => {
    switch (
      product.collection?.toUpperCase()
    ) {
      case "BAKHOOR":
        return "BAKHOOR";

      case "OUD":
        return "OUD";

      case "ATTAR":
        return "ATTAR";

      case "GIFTING":
        return "GIFT SET";

      default:
        return "EAU DE PARFUM";
    }
  };

  /* =========================================================
     SCROLL TO PRODUCTS
  ========================================================= */

  const scrollToProducts = () => {
    document
      .getElementById("product-grid")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="app">

      <Navbar />

      <main>

        {/* =================================================
            PROMO BANNER
        ================================================= */}

        <section
          className="product-promo-banner"
          style={{
            width: "100%",
            marginTop: "90px",
            backgroundColor: "#C8B7AB",
            borderTop:
              "1px solid #D4AF37",
            borderBottom:
              "1px solid #D4AF37",
            padding: "56px 20px",
            textAlign: "center",
            fontFamily:
              "'Cinzel', 'Playfair Display', serif",
            boxShadow:
              "inset 0 0 30px rgba(0, 0, 0, 0.05)",
          }}
        >

          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >

            <span
              style={{
                fontSize: "11px",
                letterSpacing: "4px",
                color: "#6A5344",
                textTransform:
                  "uppercase",
                fontWeight: 600,
              }}
            >
              • Signature Collection •
            </span>

            <h2
              className="product-promo-title"
              style={{
                fontSize: "32px",
                letterSpacing: "2.5px",
                color: "#2C221E",
                margin: 0,
                fontWeight: 600,
                textShadow:
                  "0 1px 2px rgba(255,255,255,0.3)",
              }}
            >
              FLAT 25% OFF
            </h2>

            <p
              style={{
                fontSize: "20px",
                color: "#4A382F",
                margin: 0,
                fontFamily:
                  "Montserrat, sans-serif",
                fontWeight: 300,
                letterSpacing: "0.5px",
              }}
            >
              Curate your signature scent
              and explore our luxury range.
            </p>

            <div
              style={{
                marginTop: "12px",
              }}
            >

              <button
                type="button"
                className="product-promo-button"
                onClick={scrollToProducts}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "#D4AF37";

                  event.currentTarget.style.color =
                    "#1A1A1A";

                  event.currentTarget.style.borderColor =
                    "#D4AF37";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "#2C221E";

                  event.currentTarget.style.color =
                    "#F5F0EB";

                  event.currentTarget.style.borderColor =
                    "#2C221E";
                }}
                style={{
                  display: "inline-block",
                  backgroundColor: "#2C221E",
                  color: "#F5F0EB",
                  padding: "14px 34px",
                  fontSize: "12px",
                  letterSpacing: "2.5px",
                  textDecoration: "none",
                  textTransform:
                    "uppercase",
                  fontWeight: 600,
                  border:
                    "1px solid #2C221E",
                  cursor: "pointer",
                  transition:
                    "all 0.3s ease",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                SHOP THE COLLECTION
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            PRODUCTS SECTION
        ================================================= */}

        <section
          className="section products-section"
          id="products"
        >

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
              }}
            >
              Loading fragrances...
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "#9b3d3d",
              }}
            >
              {error}
            </div>
          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {!loading &&
            !error &&
            products.length > 0 && (

              <div
                className="product-grid"
                id="product-grid"
              >

                {products.map((product, index) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    className={
                      productClasses[index % productClasses.length]
                    }
                    productType={getProductType(product)}
                    onOpen={(productId) =>
                      navigate(`/products/${productId}`)
                    }
                  />
                ))}

              </div>
            )}

          {/* =================================================
              NO PRODUCTS
          ================================================= */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div
                style={{
                  textAlign: "center",
                  padding: "80px",
                  color: "#827c73",
                }}
              >
                No fragrances found in this
                collection.
              </div>

            )}

          {/* =================================================
              BACK TO HOME
          ================================================= */}

          <div className="center-button">

            <button
              type="button"
              className="outline-button"
              onClick={() =>
                navigate("/")
              }
            >
              ← BACK TO HOME
            </button>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default ProductPage;