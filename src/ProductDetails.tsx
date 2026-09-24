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

  rating?: number;
  reviewCount?: number;
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  fragranceFamily?: string;
  concentration?: string;
  volume?: string;
  gender?: string;
  occasion?: string;
  longevity?: string;
}

interface CartProduct extends Product {
  quantity: number;
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

    fetch(`http://localhost:8080/api/products/${id}`)
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
          <p>
            {error || "Product not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            BACK TO PRODUCTS
          </button>
        </div>

        <Footer />
      </div>
    );
  }

  const getImageUrl = (
    imageUrl?: string
  ) => {
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
    try {
      const existingCart: CartProduct[] =
        JSON.parse(
          localStorage.getItem("cart") || "[]"
        );

      const existingProduct =
        existingCart.find(
          (item) => item.id === product.id
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

      alert(
        `${product.name} added to cart.`
      );
    } catch (cartError) {
      console.error(
        "Cart error:",
        cartError
      );
    }
  };

  const buyNow = () => {
    addToCart();
    navigate("/cart");
  };

  const productType =
    product.type?.trim() ||
    product.concentration?.trim() ||
    product.collection?.trim() ||
    "Perfume";

  const rating =
    typeof product.rating === "number"
      ? product.rating
      : 0;

  const reviewCount =
    typeof product.reviewCount === "number"
      ? product.reviewCount
      : 0;

  const hasFragranceNotes =
    Boolean(
      product.topNotes ||
      product.heartNotes ||
      product.baseNotes
    );

  const hasProductDetails =
    Boolean(
      product.concentration ||
      product.volume ||
      product.fragranceFamily ||
      product.gender ||
      product.occasion ||
      product.longevity
    );

  return (
    <div className="product-details-page">

      <Navbar />

      <main className="product-details-container">

        <button
          className="back-button"
          type="button"
          onClick={() =>
            navigate("/products")
          }
        >
          ← BACK TO COLLECTION
        </button>

        <section className="product-details-content">

          {/* PRODUCT IMAGE */}

          <div className="product-details-image-container">

            {activeImageUrl &&
            !imageError ? (
              <>
                <img
                  key={activeImageUrl}
                  src={activeImageUrl}
                  alt={product.name}
                  className="details-product-image"
                  onError={() =>
                    setImageError(true)
                  }
                />

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      className="image-carousel-arrow image-carousel-prev"
                      aria-label="Previous image"
                      onClick={
                        showPreviousImage
                      }
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      className="image-carousel-arrow image-carousel-next"
                      aria-label="Next image"
                      onClick={
                        showNextImage
                      }
                    >
                      →
                    </button>

                    <div className="image-carousel-dots">

                      {productImages.map(
                        (_, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`image-carousel-dot ${
                              index ===
                              activeImageIndex
                                ? "active"
                                : ""
                            }`}
                            aria-label={`View image ${
                              index + 1
                            }`}
                            onClick={() => {
                              setImageError(
                                false
                              );

                              setActiveImageIndex(
                                index
                              );
                            }}
                          />
                        )
                      )}

                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="details-bottle">

                <div className="details-bottle-cap" />

                <div className="details-bottle-neck" />

                <div className="details-bottle-body">
                  <span>K</span>
                  <strong>KEIAN</strong>
                </div>

              </div>
            )}

          </div>

          {/* PRODUCT INFORMATION */}

          <div className="product-details-info">

            <div className="product-details-topline">

              {product.category && (
                <span className="product-details-category">
                  {product.category}
                </span>
              )}

              {product.tag && (
                <span className="product-details-tag">
                  {product.tag}
                </span>
              )}

            </div>

            <h1>
              {product.name}
            </h1>

            <p className="product-details-type">
              {productType}
            </p>

            {/* RATING */}

            <div className="product-rating">

              {rating > 0 ? (
                <>
                  <span className="rating-stars">

                    {"★".repeat(
                      Math.min(
                        5,
                        Math.round(rating)
                      )
                    )}

                    <span className="empty-stars">

                      {"★".repeat(
                        Math.max(
                          0,
                          5 -
                            Math.round(
                              rating
                            )
                        )
                      )}

                    </span>

                  </span>

                  <span className="rating-text">

                    {rating.toFixed(1)}

                    {reviewCount > 0 &&
                      ` · ${reviewCount} ${
                        reviewCount === 1
                          ? "Review"
                          : "Reviews"
                      }`}

                  </span>
                </>
              ) : (
                <span className="rating-text">
                  No reviews yet
                </span>
              )}

            </div>

            {/* PRICE */}

            <p className="product-details-price">
              ₹
              {Number(
                product.price
              ).toLocaleString("en-IN")}
            </p>

            <div className="product-details-line" />

            {/* DESCRIPTION */}

            <div className="product-description-block">

              <span className="small-label">
                ABOUT THE FRAGRANCE
              </span>

              <p className="product-details-description">
                {product.description}
              </p>

            </div>

            {/* PRODUCT META */}

            <div className="product-meta">

              {product.category && (
                <div>
                  <span>
                    CATEGORY
                  </span>

                  <strong>
                    {product.category}
                  </strong>
                </div>
              )}

              {product.collection && (
                <div>
                  <span>
                    COLLECTION
                  </span>

                  <strong>
                    {product.collection}
                  </strong>
                </div>
              )}

              {productType && (
                <div>
                  <span>
                    TYPE
                  </span>

                  <strong>
                    {productType}
                  </strong>
                </div>
              )}

            </div>

            {/* AVAILABILITY */}

            <div className="product-availability">

              <div className="availability-item">

                <span className="availability-icon">
                  ✓
                </span>

                <div>

                  <strong>
                    IN STOCK
                  </strong>

                  <small>
                    Available for dispatch
                  </small>

                </div>

              </div>

              <div className="availability-item">

                <span className="availability-icon">
                  ◇
                </span>

                <div>

                  <strong>
                    SECURE CHECKOUT
                  </strong>

                  <small>
                    Safe payment process
                  </small>

                </div>

              </div>

            </div>

            {/* QUANTITY */}

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

            {/* ACTION BUTTONS */}

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

            <div className="product-shipping-note">
              Free shipping on orders above ₹1,999
            </div>

          </div>

        </section>

        {/* FRAGRANCE NOTES */}

        {hasFragranceNotes && (
          <section className="fragrance-notes-section">

            <div className="premium-section-heading">

              <span>
                FRAGRANCE
              </span>

              <h2>
                The Notes
              </h2>

            </div>

            <div className="fragrance-notes-grid">

              {product.topNotes && (
                <div className="fragrance-note-card">

                  <span className="note-number">
                    01
                  </span>

                  <span className="note-label">
                    TOP NOTES
                  </span>

                  <p>
                    {product.topNotes}
                  </p>

                </div>
              )}

              {product.heartNotes && (
                <div className="fragrance-note-card">

                  <span className="note-number">
                    02
                  </span>

                  <span className="note-label">
                    HEART NOTES
                  </span>

                  <p>
                    {product.heartNotes}
                  </p>

                </div>
              )}

              {product.baseNotes && (
                <div className="fragrance-note-card">

                  <span className="note-number">
                    03
                  </span>

                  <span className="note-label">
                    BASE NOTES
                  </span>

                  <p>
                    {product.baseNotes}
                  </p>

                </div>
              )}

            </div>

          </section>
        )}

        {/* PRODUCT DETAILS */}

        {hasProductDetails && (
          <section className="perfume-details-section">

            <div className="premium-section-heading">

              <span>
                PRODUCT INFORMATION
              </span>

              <h2>
                Details
              </h2>

            </div>

            <div className="perfume-details-grid">

              {product.concentration && (
                <div>
                  <span>
                    CONCENTRATION
                  </span>

                  <strong>
                    {product.concentration}
                  </strong>
                </div>
              )}

              {product.volume && (
                <div>
                  <span>
                    VOLUME
                  </span>

                  <strong>
                    {product.volume}
                  </strong>
                </div>
              )}

              {product.fragranceFamily && (
                <div>
                  <span>
                    FRAGRANCE FAMILY
                  </span>

                  <strong>
                    {product.fragranceFamily}
                  </strong>
                </div>
              )}

              {product.gender && (
                <div>
                  <span>
                    GENDER
                  </span>

                  <strong>
                    {product.gender}
                  </strong>
                </div>
              )}

              {product.occasion && (
                <div>
                  <span>
                    OCCASION
                  </span>

                  <strong>
                    {product.occasion}
                  </strong>
                </div>
              )}

              {product.longevity && (
                <div>
                  <span>
                    LONGEVITY
                  </span>

                  <strong>
                    {product.longevity}
                  </strong>
                </div>
              )}

            </div>

          </section>
        )}

        {/* DELIVERY */}

        <section className="delivery-section">

          <div className="premium-section-heading">

            <span>
              DELIVERY
            </span>

            <h2>
              Before You Order
            </h2>

          </div>

          <div className="delivery-grid">

            <div className="delivery-card">

              <span>
                ✓
              </span>

              <h3>
                Secure Packaging
              </h3>

              <p>
                Each order is packed carefully
                before dispatch.
              </p>

            </div>

            <div className="delivery-card">

              <span>
                →
              </span>

              <h3>
                Order Dispatch
              </h3>

              <p>
                Your order is prepared and
                dispatched after confirmation.
              </p>

            </div>

            <div className="delivery-card">

              <span>
                ◇
              </span>

              <h3>
                Secure Checkout
              </h3>

              <p>
                Complete your purchase through
                our secure checkout process.
              </p>

            </div>

          </div>

        </section>

        {/* KEIAN BRAND NOTE */}

        <section className="product-brand-note">

          <div>

            <span>
              KEIAN
            </span>

            <p>
              Fragrance made for everyday
              moments and occasions worth
              remembering.
            </p>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default ProductDetails;