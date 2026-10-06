interface CategoryProduct {
  id: number;
  name: string;
  category: string;
  type?: string;
  price: number;
  description: string;
  imageUrl: string;
  tag: string;
}

interface CategoryProductCardProps {
  product: CategoryProduct;
  index: number;
}

export function CategoryProductCard({
  product,
  index,
}: CategoryProductCardProps) {
  const productClasses = [
    "product-noir",
    "product-rose",
    "product-oud",
    "product-bloom",
  ];

  const className = productClasses[index % productClasses.length];

  const isBakhoor =
    product.type?.trim().toUpperCase() === "BAKHOOR" ||
    product.category?.trim().toUpperCase() === "BAKHOOR";

  return (
    <article className="product-card">
      <div className={`product-visual ${className}`}>
        {product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}

        <button
          className="wishlist-button"
          aria-label={`Add ${product.name} to wishlist`}
          type="button"
        >
          ♡
        </button>

        {isBakhoor ? (
          <div className="bakhoor-product">
            <div className="bakhoor-smoke smoke-one"></div>
            <div className="bakhoor-smoke smoke-two"></div>
            <div className="bakhoor-smoke smoke-three"></div>
            <div className="bakhoor-burner">
              <div className="burner-top">
                <span>✦</span>
              </div>
              <div className="burner-body">L</div>
              <div className="burner-base"></div>
            </div>
          </div>
        ) : (
          <div className="product-bottle">
            <div className="mini-cap"></div>
            <div className="mini-neck"></div>
            <div className="mini-body">
              <span>L</span>
            </div>
          </div>
        )}

        <button className="quick-add" type="button">
          QUICK ADD <span>+</span>
        </button>
      </div>

      <div className="product-details">
        <span>{isBakhoor ? "BAKHOOR" : "EAU DE PARFUM"}</span>
        <h3>{product.name}</h3>
        <p>{product.category}</p>
        <strong>
          ₹{Number(product.price).toLocaleString("en-IN")}
        </strong>
      </div>
    </article>
  );
}
