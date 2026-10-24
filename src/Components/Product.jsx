import { useState } from "react";
import {
  Minus,
  MoreHorizontal,
  Plus,
  ShoppingCart,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import "./Product.css";
import { imageFrames, measureFood } from "../foodImageFrame";

const money = (amount) => Number(amount).toLocaleString("en-PH", { style: "currency", currency: "PHP" });

function ProductPhoto({ src, name }) {
  const [loaded, setLoaded] = useState(null);
  const frame = imageFrames.get(src) || (loaded?.src === src && loaded.frame);

  return (
    <div className="food-card-photo">
      <img
        src={src}
        alt={name}
        className="food-image"
        style={{ ...frame, visibility: frame ? "visible" : "hidden" }}
        onLoad={(event) => {
          const nextFrame =
            imageFrames.get(src) || measureFood(event.currentTarget);
          imageFrames.set(src, nextFrame);
          setLoaded({ src, frame: nextFrame });
        }}
      />
    </div>
  );
}

export default function Product({
  product,
  image,
  quantityInCart = 0,
  onChangeCart,
  onEdit,
  onDelete,
  onOpenDetails,
}) {
  const availableQuantity = Math.max(0, product.quantity - quantityInCart);
  const soldOut = availableQuantity === 0;
  const lowStock = availableQuantity > 0 && availableQuantity < 5;

  return (
    <article
      className="food-card"
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name} details`}
    >
      <div className="food-image-wrap">
        {image ? (
          <ProductPhoto src={image} name={product.name} />
        ) : (
          <div className="image-placeholder">
            <UtensilsCrossed size={28} />
            <span>Photo coming soon</span>
          </div>
        )}
      </div>
      <div className="food-card-top">
        <div className="food-card-flags">
          <span
            className="rating"
            aria-label={`Rated ${product.rating} out of 5`}
          >
            <Star size={12} fill="currentColor" /> {product.rating}
          </span>
          {soldOut ? (
            <span className="stock-badge sold-out-badge">Sold out</span>
          ) : lowStock && (
            <span className="stock-badge">
              Low stock · {availableQuantity} left
            </span>
          )}
        </div>
        <details
          className="product-menu"
          onClick={(event) => event.stopPropagation()}
        >
          <summary aria-label={`Manage ${product.name}`}>
            <MoreHorizontal size={17} />
          </summary>
          <div className="product-menu-options">
            <button onClick={onEdit}>Edit details</button>
            <button onClick={onDelete}>Remove dish</button>
          </div>
        </details>
      </div>
      <div className="food-card-content">
        <div className="food-title-row">
          <h3>{product.name}</h3>
          <strong className="food-price-pill">{money(product.price)}</strong>
        </div>
        <p className="food-description">{product.description}</p>
        <div className="food-card-facts">
          <span className="cuisine-label">{product.category}</span>
          <span className="food-stock-pill">
            {availableQuantity > 0
              ? `${availableQuantity} ${availableQuantity === 1 ? "portion" : "portions"} available`
              : "Sold out"}
          </span>
        </div>
        <div className="stock-subtotal">
          <span>Stock subtotal</span>
          <strong>{money(product.price * product.quantity)}</strong>
        </div>
        <div className="food-card-footer">
          {quantityInCart ? (
            <div className="quantity-control">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onChangeCart(product, -1);
                }}
                aria-label={`Remove one ${product.name}`}
              >
                <Minus size={14} />
              </button>
              <span aria-live="polite">{quantityInCart} in cart</span>
              <button
                disabled={quantityInCart >= product.quantity}
                onClick={(event) => {
                  event.stopPropagation();
                  onChangeCart(product, 1);
                }}
                aria-label={`Add one ${product.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              className="add-button"
              aria-label={
                product.quantity === 0
                  ? `${product.name} is sold out`
                  : `Add ${product.name} to cart`
              }
              disabled={product.quantity === 0}
              onClick={(event) => {
                event.stopPropagation();
                onChangeCart(product, 1);
              }}
            >
              {product.quantity === 0 ? (
                <span>Sold out</span>
              ) : (
                <>
                  <span className="add-button-icon" aria-hidden="true">
                    <ShoppingCart size={19} strokeWidth={2.3} />
                  </span>
                  <span className="add-button-label" aria-hidden="true">
                    Add to cart
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
