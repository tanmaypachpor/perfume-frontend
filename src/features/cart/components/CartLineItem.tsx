interface CartLineItemData {
  id: number;
  cartItemId: number;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  quantity: number;
  tag: string;
}

interface CartLineItemProps {
  item: CartLineItemData;
  onViewProduct: (productId: number) => void;
  onDecrease: (cartItemId: number) => void;
  onIncrease: (cartItemId: number) => void;
  onRemove: (cartItemId: number) => void;
  isUpdating: boolean;
}

const formatPrice = (value: number) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

export function CartLineItem({
  item,
  onViewProduct,
  onDecrease,
  onIncrease,
  onRemove,
  isUpdating,
}: CartLineItemProps) {
  return (
    <article className="cart-item" aria-busy={isUpdating}>
      <button
        type="button"
        className="cart-product-image"
        onClick={() => onViewProduct(item.id)}
        aria-label={`View ${item.name}`}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          width="160"
          height="160"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.opacity = "0";
          }}
        />
      </button>

      <div className="cart-item-info">
        <span className="cart-item-category">
          {item.category || "FRAGRANCE"}
        </span>

        <h2>{item.name}</h2>

        {item.description && (
          <p className="cart-item-description">{item.description}</p>
        )}

        {item.tag && <span className="cart-item-tag">{item.tag}</span>}

        <button
          type="button"
          className="mobile-remove-button"
          onClick={() => onRemove(item.cartItemId)}
          disabled={isUpdating}
        >
          Remove
        </button>
      </div>

      <div className="cart-item-price">
        <span>PRICE</span>
        <strong>{formatPrice(Number(item.price))}</strong>
      </div>

      <div className="cart-item-quantity">
        <span>QTY</span>
        <div className="cart-quantity-control">
          <button
            type="button"
            onClick={() => onDecrease(item.cartItemId)}
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={isUpdating}
          >
            −
          </button>
          <strong>{item.quantity}</strong>
          <button
            type="button"
            onClick={() => onIncrease(item.cartItemId)}
            aria-label={`Increase quantity of ${item.name}`}
            disabled={isUpdating}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        <span>TOTAL</span>
        <strong>{formatPrice(Number(item.price) * item.quantity)}</strong>
      </div>

      <button
        type="button"
        className="remove-cart-item"
        onClick={() => onRemove(item.cartItemId)}
        aria-label={`Remove ${item.name}`}
        disabled={isUpdating}
      >
        ×
      </button>
    </article>
  );
}
