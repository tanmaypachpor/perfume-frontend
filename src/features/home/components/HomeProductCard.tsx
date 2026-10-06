import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface HomeProduct {
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

interface HomeProductCardProps {
  product: HomeProduct;
  index: number;
}

export function HomeProductCard({
  product,
  index,
}: HomeProductCardProps) {
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
  const className = productClasses[index % productClasses.length];

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className={`product-visual ${isBakhoor ? "" : className}`}>
        {product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}

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
            setWishlist((current) => !current);
          }}
        >
          {wishlist ? "♥" : "♡"}
        </button>

        {isBakhoor ? (
          <div className="bakhoor-product">
            <div className="bakhoor-burner">
              <div className="bakhoor-smoke smoke-one"></div>
              <div className="bakhoor-smoke smoke-two"></div>
              <div className="bakhoor-smoke smoke-three"></div>
              <div className="burner-top">
                <span>✦</span>
              </div>
              <div className="burner-body">K</div>
              <div className="burner-base"></div>
            </div>
          </div>
        ) : (
          <div className="product-image-wrapper">
            {product.imageUrl ? (
              <>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image first-image"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                {product.secondUrl && (
                  <img
                    src={product.secondUrl}
                    alt={`${product.name} alternate`}
                    className="product-image second-image"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
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
        )}

        <button
          className="quick-add"
          onClick={(event) => {
            event.stopPropagation();
            console.log("Quick add:", product.name);
          }}
        >
          QUICK ADD <span>+</span>
        </button>
      </div>

      <div className="product-details">
        <span>{isBakhoor ? "PREMIUM BAKHOOR" : "EAU DE PARFUM"}</span>
        <h3>
          <Link
            to={`/products/${product.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            {product.name}
          </Link>
        </h3>
        <p>{product.category}</p>
        {product.description && <p>{product.description}</p>}
        <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
      </div>
    </article>
  );
}
