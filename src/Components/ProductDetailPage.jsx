import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { imageFrames, measureFood } from "../foodImageFrame";
import "./ProductDetailPage.css";

const money = (amount) => Number(amount).toLocaleString("en-PH", { style: "currency", currency: "PHP" });

function DishImage({ src, name }) {
  const [loaded, setLoaded] = useState(null);
  const [failedSource, setFailedSource] = useState(null);
  const frame = imageFrames.get(src) || (loaded?.src === src && loaded.frame);

  if (!src || failedSource === src) {
    return (
      <div className="product-page-image-placeholder">
        <UtensilsCrossed size={56} aria-hidden="true" />
        <span>Photo coming soon</span>
      </div>
    );
  }

  return (
    <div
      className="product-page-image-frame"
      style={{
        visibility: frame ? "visible" : "hidden",
        "--rotation-fit": frame?.["--rotation-fit"] || 1,
      }}
    >
      <img
        src={src}
        alt={name}
        style={frame || undefined}
        onLoad={(event) => {
          const nextFrame =
            imageFrames.get(src) || measureFood(event.currentTarget);
          imageFrames.set(src, nextFrame);
          setLoaded({ src, frame: nextFrame });
        }}
        onError={() => setFailedSource(src)}
      />
    </div>
  );
}

export default function ProductDetailPage({
  product,
  image,
  quantityInCart = 0,
  onAddToCart,
  onBack,
}) {
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const availableToAdd = Math.max(0, product.quantity - quantityInCart);
  const soldOut = availableToAdd === 0;
  const orderQuantity = Math.min(
    requestedQuantity,
    Math.max(1, availableToAdd),
  );
  const lowStock = product.quantity > 0 && product.quantity < 5;
  const lowAvailability = availableToAdd > 0 && availableToAdd < 5;

  return (
    <section className="product-page" aria-labelledby="product-page-title">
      <button type="button" className="product-page-back" onClick={onBack}>
        <ArrowLeft size={17} aria-hidden="true" /> Back to menu
      </button>
      <div className="product-page-layout">
        <div className="product-page-art">
          <div className="product-page-image-stage">
            <DishImage src={image} name={product.name} />
          </div>
        </div>
        <div className="product-page-copy">
          <div className="product-page-heading-meta">
            <span className="product-page-category">{product.category}</span>
            <span
              className="product-page-rating"
              aria-label={`Rated ${product.rating} out of 5`}
            >
              <Star size={15} fill="currentColor" aria-hidden="true" />
              {product.rating} <small>/ 5</small>
            </span>
          </div>
          <h1 id="product-page-title">{product.name}</h1>
          <p className="product-page-description">{product.description}</p>
          <div className="product-page-specifications">
            <h2>Dish specifications</h2>
            <p>{product.specification}</p>
          </div>
          <dl className="product-page-facts">
            <div>
              <dt>Unit price</dt>
              <dd>{money(product.price)}</dd>
            </div>
            <div className={lowStock ? "product-page-low-stock" : undefined}>
              <dt>Stock quantity</dt>
              <dd>
                {product.quantity}{" "}
                <small>{product.quantity === 1 ? "portion" : "portions"}</small>
                {lowStock && (
                  <span className="product-page-stock-note">Low stock</span>
                )}
                {product.quantity === 0 && (
                  <span className="product-page-stock-note">Sold out</span>
                )}
              </dd>
            </div>
            <div className="product-page-stock-total">
              <dt>
                Stock subtotal{" "}
                <small>
                  {money(product.price)} × {product.quantity}
                </small>
              </dt>
              <dd>{money(product.price * product.quantity)}</dd>
            </div>
          </dl>
          <div className="product-page-order">
            <div className="product-page-order-heading">
              <h2>Your selection</h2>
              <strong>
                {money(
                  product.price * (availableToAdd > 0 ? orderQuantity : 0),
                )}
              </strong>
            </div>
            <div className="product-page-actions">
              <div
                className="product-page-quantity"
                role="group"
                aria-label="Quantity to add"
              >
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${product.name}`}
                  disabled={orderQuantity <= 1 || availableToAdd === 0}
                  onClick={() => setRequestedQuantity(orderQuantity - 1)}
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                <output aria-label="Selected quantity" aria-live="polite">
                  {availableToAdd > 0 ? orderQuantity : 0}
                </output>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${product.name}`}
                  disabled={orderQuantity >= availableToAdd}
                  onClick={() => setRequestedQuantity(orderQuantity + 1)}
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                className="product-page-add"
                disabled={availableToAdd === 0}
                onClick={() => onAddToCart(product, orderQuantity)}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                {soldOut
                  ? "Sold out"
                  : `Add ${orderQuantity} to Cart`}
              </button>
            </div>
            <p
              className={`product-page-availability${lowAvailability ? " is-low-stock" : ""}`}
              role="status"
            >
              {lowAvailability && <strong>Low stock · </strong>}
              {quantityInCart > 0 &&
                `${quantityInCart} already in your order · `}
              {soldOut
                ? "Sold out"
                : `${availableToAdd} ${availableToAdd === 1 ? "portion" : "portions"} available to add`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
