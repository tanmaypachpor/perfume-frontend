import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const category = location.pathname
    .split("/")
    .filter(Boolean)[1];

  useEffect(() => {
    setLoading(true);
    setError("");

    let url =
      "http://localhost:8080/api/products";

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
          throw new Error(
            "Failed to fetch products"
          );
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

  const pageTitles: Record<string, string> = {
    perfumes: "Perfumes",
    attars: "Attars",
    "gift-sets": "Gift Sets",
    him: "For Him",
    her: "For Her",
    unisex: "Unisex",
    oud: "Oud Collection",
    bakhoor: "Dhakoon",
  };

  const pageDescriptions: Record<
    string,
    string
  > = {
    perfumes:
      "Discover elegant, timeless and refined fragrances from our perfume collection.",

    attars:
      "Discover traditional, rich and fragrant attars crafted with care.",

    "gift-sets":
      "Explore luxurious and thoughtful fragrance gift sets for every occasion.",

    him:
      "Discover bold, refined and powerful fragrances crafted for him.",

    her:
      "Discover elegant, floral and alluring fragrances crafted for her.",

    unisex:
      "Discover modern, unique and timeless fragrances for everyone.",

    oud:
      "Explore rich, warm and mysterious oud fragrances.",

    bakhoor:
      "Discover smoky, aromatic and luxurious dhakoon fragrances.",
  };

  const normalizedCategory =
    category?.toLowerCase();

  const pageTitle = normalizedCategory
    ? pageTitles[normalizedCategory] ||
      "All Fragrances"
    : "All Fragrances";

  const pageDescription = normalizedCategory
    ? pageDescriptions[normalizedCategory] ||
      "Explore our complete collection of extraordinary fragrances."
    : "Explore our complete collection of extraordinary fragrances.";

  const handleProductClick = (id: number) => {
    navigate(`/products/${id}`);
  };

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

  return (
    <div className="app">
      <Navbar />

      <main>
        <section
          className="section products-section"
          id="products"
        >
          <div className="section-header centered">
            <span className="section-label">
              {category
                ? "EXPLORE THE COLLECTION"
                : "THE COMPLETE COLLECTION"}
            </span>

            <h2>
              {category ? (
                pageTitle
              ) : (
                <>
                  All <em>Fragrances</em>
                </>
              )}
            </h2>

            <p>{pageDescription}</p>
          </div>

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
              <div className="product-grid">
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
                        handleProductClick(product.id)
                      }
                      style={{
                        cursor: "pointer",
                      }}
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
                          QUICK ADD
                          <span>+</span>
                        </button>
                      </div>

                      <div className="product-details">
                        <span>
                          {getProductType(product)}
                        </span>

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