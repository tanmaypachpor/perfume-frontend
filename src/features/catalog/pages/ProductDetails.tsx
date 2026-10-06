import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "@/features/catalog/pages/ProductDetails.css";
import { Footer, Navbar } from "@/shared/components/layout/SiteChrome";
import { supabase } from "@/shared/lib/supabaseClient";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { ProductDeliveryInfo } from "@/features/catalog/components/ProductDeliveryInfo";

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

  const [addingToCart, setAddingToCart] =
    useState(false);
  const addToCartInProgress = useRef(false);

  /*
   * FETCH PRODUCT FROM SUPABASE
   */
  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setImageError(false);
      setActiveImageIndex(0);

      try {
        const productId = Number(id);

        if (Number.isNaN(productId)) {
          throw new Error("Invalid product ID");
        }

        const { data, error: supabaseError } =
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
            .eq("id", productId)
            .eq("active", true)
            .single();

        if (supabaseError) {
          throw supabaseError;
        }

        if (!data) {
          throw new Error("Product not found");
        }

        setProduct(data as Product);
      } catch (fetchError) {
        console.error(
          "Supabase product details error:",
          fetchError
        );

        setProduct(null);
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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
            onClick={() =>
              navigate("/products")
            }
          >
            BACK TO PRODUCTS
          </button>
        </div>

        <Footer />
      </div>
    );
  }

  /*
   * SUPABASE STORAGE URLS ARE ALREADY COMPLETE.
   * KEEPING THIS FUNCTION ALSO MAKES THE PAGE
   * COMPATIBLE WITH RELATIVE IMAGE PATHS.
   */
  const getImageUrl = (
    imageUrl?: string
  ) => {
    if (!imageUrl) {
      return "";
    }

    return imageUrl.startsWith("http")
      ? imageUrl
      : imageUrl;
  };

  const productImages = [
    getImageUrl(product.imageUrl),
    getImageUrl(product.secondUrl),
  ].filter(Boolean);

  const activeImageUrl =
    productImages[activeImageIndex] || "";

  const hasMultipleImages =
    productImages.length > 1;

  /*
   * IMAGE CAROUSEL
   */
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

  /*
   * QUANTITY
   */
  const increaseQuantity = () => {
    setQuantity((current) =>
      current + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1
        ? current - 1
        : 1
    );
  };

  /*
   * ADD TO CART
   *
   * Cart is stored in Supabase.
   *
   * Every cart item belongs to the
   * currently logged-in Supabase user.
   */
  const addToCart = async (
    incrementExisting = true
  ): Promise<boolean> => {
    if (addToCartInProgress.current) {
      return false;
    }

    addToCartInProgress.current = true;
    setAddingToCart(true);

    try {
      /*
       * GET CURRENT LOGGED-IN USER
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "User error:",
          userError
        );

        navigate("/login");
        return false;
      }

      /*
       * USER MUST BE LOGGED IN
       */
      if (!user) {
        navigate("/login");
        return false;
      }

      /*
       * CHECK IF PRODUCT ALREADY EXISTS
       * IN THIS USER'S CART
       */
      const {
        data: existingItem,
        error: existingError,
      } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existingError) {
        console.error(
          "Cart lookup error:",
          existingError
        );

        return false;
      }

      /*
       * PRODUCT ALREADY EXISTS
       *
       * Example:
       * Existing quantity = 2
       * Selected quantity = 3
       * New quantity = 5
       */
      if (existingItem) {
        const nextQuantity = incrementExisting
          ? existingItem.quantity + quantity
          : Math.max(existingItem.quantity, quantity);

        const {
          error: updateError,
        } = await supabase
          .from("cart_items")
          .update({
            quantity: nextQuantity,
          })
          .eq("id", existingItem.id);

        if (updateError) {
          console.error(
            "Cart update error:",
            updateError
          );

          return false;
        }
      }

      /*
       * PRODUCT DOES NOT EXIST
       *
       * CREATE NEW CART ITEM
       */
      else {
        const {
          error: insertError,
        } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
          });

        if (insertError) {
          console.error(
            "Cart insert error:",
            insertError
          );

          return false;
        }
      }

      return true;
    } catch (cartError) {
      console.error(
        "Cart error:",
        cartError
      );

      return false;
    } finally {
      addToCartInProgress.current = false;
      setAddingToCart(false);
    }
  };

  /*
   * BUY NOW
   *
   * Add product to Supabase cart
   * and then open cart page.
   */
  const buyNow = async () => {
    const added = await addToCart(false);

    if (added) {
      navigate("/cart");
    }
  };

  /*
   * PRODUCT TYPE
   */
  const productType =
    product.type?.trim() ||
    product.concentration?.trim() ||
    product.collection?.trim() ||
    "Perfume";

  /*
   * RATING
   */
  const rating =
    typeof product.rating === "number"
      ? product.rating
      : 0;

  const reviewCount =
    typeof product.reviewCount ===
    "number"
      ? product.reviewCount
      : 0;

  /*
   * OPTIONAL SECTIONS
   */
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

          <ProductGallery
            productName={product.name}
            activeImageUrl={activeImageUrl}
            imageError={imageError}
            productImages={productImages}
            activeImageIndex={activeImageIndex}
            hasMultipleImages={hasMultipleImages}
            onImageError={() => setImageError(true)}
            onPrevious={showPreviousImage}
            onNext={showNextImage}
            onSelectImage={(index) => {
              setImageError(false);
              setActiveImageIndex(index);
            }}
          />

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
              ).toLocaleString(
                "en-IN"
              )}
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
                  disabled={addingToCart}
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
                  disabled={addingToCart}
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
                onClick={() => addToCart()}
                disabled={addingToCart}
              >
                {addingToCart
                  ? "ADDING..."
                  : "ADD TO CART"}
              </button>

              <button
                className="buy-now-button"
                type="button"
                onClick={buyNow}
                disabled={addingToCart}
              >
                {addingToCart
                  ? "PLEASE WAIT..."
                  : "BUY NOW"}
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

        <ProductDeliveryInfo />

      </main>

      <Footer />

    </div>
  );
}

export default ProductDetails;