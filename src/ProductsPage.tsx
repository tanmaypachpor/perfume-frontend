import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Footer, Navbar } from "./App";

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

  const category = location.pathname
    .split("/")
    .filter(Boolean)[1];

  useEffect(() => {
    setLoading(true);
    setError("");

    let url = "http://localhost:8080/api/products";

    if (category === "him") {
      url =
        "http://localhost:8080/api/products/filter?category=HIM";
    } else if (category === "her") {
      url =
        "http://localhost:8080/api/products/filter?category=HER";
    } else if (category === "unisex") {
      url =
        "http://localhost:8080/api/products/filter?category=UNISEX";
    } else if (category === "perfumes") {
      url =
        "http://localhost:8080/api/products/filter?collection=PERFUME";
    } else if (category === "attars") {
      url =
        "http://localhost:8080/api/products/filter?collection=ATTAR";
    } else if (category === "oud") {
      url =
        "http://localhost:8080/api/products/filter?collection=OUD";
    } else if (category === "bakhoor") {
      url =
        "http://localhost:8080/api/products/filter?collection=BAKHOOR";
    } else if (category === "gift-sets") {
      url =
        "http://localhost:8080/api/products/filter?collection=GIFTING";
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
      })
      .catch((fetchError) => {
        console.error(
          "Error fetching products:",
          fetchError
        );

        setError(
          "Unable to load products. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category]);

  const productClasses = [
    "product-noir",
    "product-rose",
    "product-oud",
    "product-bloom",
  ];

  const getProductType = (product: Product) => {
    switch (product.collection?.toUpperCase()) {
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
        <section 
          className="product-promo-banner" 
          style={{
            width: "100%",
            marginTop: "80px",
            backgroundColor: "#C8B7AB",
            borderTop: "1px solid #D4AF37",
            borderBottom: "1px solid #D4AF37",
            padding: "56px 20px",
            textAlign: "center",
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.05)"
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            
            <span style={{ fontSize: "11px", letterSpacing: "4px", color: "#6A5344", textTransform: "uppercase", fontWeight: 600 }}>
              • Signature Collection •
            </span>

            <h2 className="product-promo-title" style={{ fontSize: "32px", letterSpacing: "2.5px", color: "#2C221E", margin: 0, fontWeight: 600, textShadow: "0 1px 2px rgba(255,255,255,0.3)" }}>
              FLAT 25% OFF
            </h2>

            <p style={{ fontSize: "20px", color: "#4A382F", margin: 0, fontFamily: "Montserrat, sans-serif", fontWeight: 300, letterSpacing: "0.5px" }}>
              Curate your signature scent and explore our luxury range.
            </p>

            <div style={{ marginTop: "12px" }}>
              <button
                type="button"
                className="product-promo-button"
                onClick={scrollToProducts}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4AF37";
                  e.currentTarget.style.color = "#1A1A1A";
                  e.currentTarget.style.borderColor = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2C221E";
                  e.currentTarget.style.color = "#F5F0EB";
                  e.currentTarget.style.borderColor = "#2C221E";
                }}
                style={{
                  display: "inline-block",
                  backgroundColor: "#2C221E",
                  color: "#F5F0EB",
                  padding: "14px 34px",
                  fontSize: "12px",
                  letterSpacing: "2.5px",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  border: "1px solid #2C221E",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                SHOP THE COLLECTION
              </button>
            </div>

          </div>
        </section>

        <section
          className="section products-section"
          id="products"
        >
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

          {!loading &&
            !error &&
            products.length > 0 && (
              <div
                className="product-grid"
                id="product-grid"
              >
                {products.map((product, index) => {
                  const className =
                    productClasses[
                      index % productClasses.length
                    ];

                  return (
                    <article
                      className="product-card"
                      key={product.id}
                      onClick={() =>
                        navigate(`/products/${product.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className={`product-visual ${className}`}
                      >
                        {product.tag && (
                          <span className="product-tag">
                            {product.tag}
                          </span>
                        )}

                        <button
                          type="button"
                          className="wishlist-button"
                          aria-label={`Add ${product.name} to wishlist`}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          ♡
                        </button>

                        <div className="product-image-wrapper">
                          {product.imageUrl ? (
                            <>
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="product-image first-image"
                                onError={(event) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />

                              {product.secondUrl && (
                                <img
                                  src={product.secondUrl}
                                  alt={`${product.name} alternate view`}
                                  className="product-image second-image"
                                  onError={(event) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              )}
                            </>
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

                        <button
                          type="button"
                          className="quick-add"
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          QUICK ADD <span>+</span>
                        </button>
                      </div>

                      <div className="product-details">
                        <span>{getProductType(product)}</span>

                        <h3>{product.name}</h3>

                        <p>{product.category}</p>

                        <strong>
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

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
                No fragrances found in this collection.
              </div>
            )}

          <div className="center-button">
            <button
              type="button"
              className="outline-button"
              onClick={() => navigate("/")}
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