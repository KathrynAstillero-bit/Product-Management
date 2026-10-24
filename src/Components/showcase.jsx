import { useEffect, useState } from "react";
import { imageFrames, measureFood } from "../foodImageFrame";
import "./showcase.css";

function HeroDishImage({ src }) {
  const [loaded, setLoaded] = useState(null);
  const frame = imageFrames.get(src) || (loaded?.src === src && loaded.frame);

  return (
    <img
      src={src}
      alt=""
      draggable="false"
      style={{ ...frame, visibility: frame ? "visible" : "hidden" }}
      onLoad={(event) => {
        const nextFrame = imageFrames.get(src) || measureFood(event.currentTarget);
        imageFrames.set(src, nextFrame);
        setLoaded({ src, frame: nextFrame });
      }}
    />
  );
}

export default function HeroDishShowcase({ products, imageFor }) {
  const [turn, setTurn] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const count = products.length;
  const activeIndex = count ? turn % count : 0;
  const active = products[activeIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (count < 2 || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) setTurn((current) => current + 1);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [count, reducedMotion]);

  if (!active) return null;

  return (
    <div className="hero-visual hero-dish-carousel" aria-label="Featured dishes">
      <div className="hero-dish-stage" aria-hidden="true">
        {products.map((product, index) => {
          const ahead = (index - activeIndex + count) % count;
          const behind = (activeIndex - index + count) % count;
          const position = ahead <= 3
            ? ahead
            : behind <= Math.min(turn, 3) ? -behind : 4;
          const featured = position === 0;
          const visible = Math.abs(position) <= 3;
          const image = imageFor(product);

          return (
            <div
              key={product.id}
              className={`hero-dish-item${featured ? " is-featured" : ""}${visible ? " is-visible" : ""}`}
              data-position={position}
              style={{
                "--queue-direction": Math.sign(position),
                "--queue-position": Math.max(0, Math.abs(position) - 1),
                zIndex: featured ? 10 : 5 - Math.abs(position),
              }}
            >
              <div className="hero-dish-photo">
                {image ? (
                  <HeroDishImage src={image} />
                ) : (
                  <span>{product.name.slice(0, 1)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-dish-caption">
        <span className="hero-dish-category">{active.category}</span>
        <strong>{active.name}</strong>
        <span className="hero-dish-price">₱{Number(active.price).toFixed(2)}</span>
      </div>
    </div>
  );
}
