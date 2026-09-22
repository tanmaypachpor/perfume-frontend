import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./ProductDetails.css";
import { Footer, Navbar } from "./App";

interface Product {
  id: number;
  name: string;
  category: string;
  collection: string;
  type?: string;
  price: number;
  description: string;
  imageUrl: string;
  secondUrl?: string;
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

  const [activeImageIndex, setActiveImageIndex] =
    useState(0);

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setImageError(false);
    setActiveImageIndex(0);

    fetch(
      `http://localhost:8080/api/products/${id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found");
        }

        return response.json();
      })
      .then((data: Product) => {
        setProduct(data);
      })
      .catch((fetchError) => {
        console.error(
          "Product details error:",
          fetchError
        );

        setError("Unable to load product.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />

        <div className="product-details-loading">
          Loading product...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <div className="product-details-error">
          <p>{error || "Product not found."}</p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            BACK TO PRODUCTS
          </button>
        </div>
      </div>
    );
  }

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) {
      return "";
    }

    return imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:8080${imageUrl}`;
  };

  const productImages = [
    getImageUrl(product.imageUrl),
    getImageUrl(product.secondUrl),
  ].filter(Boolean);

  const activeImageUrl =
    productImages[activeImageIndex] || "";

  const hasMultipleImages =
    productImages.length > 1;

  const showPreviousImage = () => {
    setImageError(false);

    setActiveImageIndex((current) =>
      current === 0
        ? productImages.length - 1
        : current - 1
    );
  };

  const showNextImage = () => {
    setImageError(false);

    setActiveImageIndex((current) =>
      current === productImages.length - 1
        ? 0
        : current + 1
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  const addToCart = () => {
    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingProduct = existingCart.find(
      (
        item: Product & {
          quantity: number;
        }
      ) => item.id === product.id
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
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

    alert(`${product.name} added to cart.`);
  };

  const buyNow = () => {
    addToCart();
    navigate("/cart");
  };

  const productType =
    product.type?.trim()
      ? product.type.trim()
      : product.collection?.trim()
      ? product.collection.trim()
      : "EAU DE PARFUM";

  return (
    <div className="product-details-page">
      <Navbar />

      <main className="product-details-container">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/products")}
        >
          ← BACK TO COLLECTION
        </button>

        <div className="product-details-content">
          <div className="product-details-image-container">
            {activeImageUrl && !imageError ? (
              <>
                <img
                  key={activeImageUrl}
                  src={activeImageUrl}
                  alt={`${product.name} view ${
                    activeImageIndex + 1
                  }`}
                  className="details-product-image"
                  onError={() => {
                    setImageError(true);
                  }}
                />

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      className="image-carousel-arrow image-carousel-prev"
                      aria-label="Show previous product image"
                      onClick={showPreviousImage}
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      className="image-carousel-arrow image-carousel-next"
                      aria-label="Show next product image"
                      onClick={showNextImage}
                    >
                      →
                    </button>

                    <div className="image-carousel-dots">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`image-carousel-dot ${
                            index === activeImageIndex
                              ? "active"
                              : ""
                          }`}
                          aria-label={`Show image ${
                            index + 1
                          }`}
                          aria-current={
                            index === activeImageIndex
                              ? "true"
                              : undefined
                          }
                          onClick={() => {
                            setImageError(false);
                            setActiveImageIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="details-bottle">
                <div className="details-bottle-cap"></div>
                <div className="details-bottle-neck"></div>

                <div className="details-bottle-body">
                  <span>K</span>
                  <strong>KEIAN</strong>
                </div>
              </div>
            )}
          </div>

          <div className="product-details-info">
            {product.tag && (
              <span className="product-details-tag">
                {product.tag}
              </span>
            )}

            <span className="product-details-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <p className="product-details-price">
              ₹
              {Number(product.price).toLocaleString(
                "en-IN"
              )}
            </p>

            <div className="product-details-line"></div>

            <p className="product-details-description">
              {product.description}
            </p>

            <div className="product-meta">
              <div>
                <span>CATEGORY</span>
                <strong>{product.category}</strong>
              </div>

              <div>
                <span>COLLECTION</span>
                <strong>{product.collection}</strong>
              </div>

              <div>
                <span>TYPE</span>
                <strong>{productType}</strong>
              </div>
            </div>

            <div className="quantity-section">
              <span>QUANTITY</span>

              <div className="quantity-control">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={decreaseQuantity}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button
                className="add-to-cart-button"
                type="button"
                onClick={addToCart}
              >
                ADD TO CART
              </button>

              <button
                className="buy-now-button"
                type="button"
                onClick={buyNow}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>

        <section className="product-features">
          <div>
            <span>✦</span>
            <strong>LONG LASTING</strong>
            <p>
              Designed to stay with you throughout
              the day.
            </p>
          </div>

          <div>
            <span>✧</span>
            <strong>PREMIUM QUALITY</strong>
            <p>
              Crafted using carefully selected
              ingredients.
            </p>
          </div>

          <div>
            <span>◇</span>
            <strong>SECURE PACKAGING</strong>
            <p>
              Carefully packed for safe delivery.
            </p>
          </div>

          <div>
            <span>✦</span>
            <strong>KEIAN CRAFT</strong>
            <p>
              Created with attention to every detail.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;