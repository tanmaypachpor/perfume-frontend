import { Link } from "react-router-dom";

interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  secondUrl?: string;
  tag: string;
}

interface CatalogProductCardProps {
  product: CatalogProduct;
  className: string;
  productType: string;
  onOpen: (productId: number) => void;
}

export function CatalogProductCard({
  product,
  className,
  productType,
  onOpen,
}: CatalogProductCardProps) {
  return (
    <article
      className="product-card"
      onClick={() => onOpen(product.id)}
      style={{ cursor: "pointer" }}
    >
      <div className={`product-visual ${className}`}>
        {product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}

        <button
          type="button"
          className="wishlist-button"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={(event) => event.stopPropagation()}
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
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              {product.secondUrl && (
                <img
                  src={product.secondUrl}
                  alt={`${product.name} alternate view`}
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

        <button
          type="button"
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
        <span>{productType}</span>
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
        <strong>
          ₹{Number(product.price).toLocaleString("en-IN")}
        </strong>
      </div>
    </article>
  );
}
