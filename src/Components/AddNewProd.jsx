import { useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import "./AddNewProd.css";

export default function AddNewProd({ categories, product, onSave, onClose }) {
  const [imagePreview, setImagePreview] = useState(product?.image || "");
  const [error, setError] = useState("");
  const [readingImage, setReadingImage] = useState(false);
  const [form, setForm] = useState(
    product || {
      name: "",
      category: "",
      image: "",
      price: "",
      quantity: "",
      description: "",
      specification: "",
      rating: "4.5",
    },
  );
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file to continue.");
      return;
    }
    setError("");
    setReadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      setForm((current) => ({ ...current, image }));
      setImagePreview(image);
      setReadingImage(false);
    };
    reader.onerror = () => {
      setError("The image could not be read. Please choose it again.");
      setReadingImage(false);
    };
    reader.readAsDataURL(file);
  };
  const submit = (event) => {
    event.preventDefault();
    if (readingImage) return;
    const requiredFields = [
      ["name", "Product name"],
      ["category", "Product category"],
      ["description", "Description"],
      ["specification", "Product specification"],
      ["rating", "Rating"],
      ["price", "Price"],
      ["quantity", "Quantity"],
    ];
    const missing = requiredFields.find(
      ([field]) => String(form[field]).trim() === "",
    );
    if (!form.image || missing) {
      setError(
        !form.image
          ? "Select a feature image and complete every field."
          : `${missing[1]} is required.`,
      );
      return;
    }
    if (
      !Number.isFinite(Number(form.rating)) ||
      Number(form.rating) < 1 ||
      Number(form.rating) > 5 ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0 ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0
    ) {
      setError("Check the rating, price, and quantity values.");
      return;
    }
    const saved = onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      specification: form.specification.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      rating: Number(form.rating),
    });
    if (saved === false) {
      setError(
        "This product could not be saved. Choose a smaller image or free some browser storage.",
      );
    }
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="product-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        <div className="editor-heading">
          <div>
            <span className="eyebrow section-eyebrow">MENU MANAGEMENT</span>
            <h2 id="editor-title">
              {product ? "Edit dish" : "Add New Product"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </div>
        <form onSubmit={submit} className="editor-form">
          <div className="editor-grid">
            <label className="editor-wide image-upload-field">
              Feature image
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={selectImage}
                required={!product}
              />
              {imagePreview && (
                <img
                  className="image-preview"
                  src={imagePreview}
                  alt="Selected dish preview"
                />
              )}
            </label>
            <label>
              Dish name
              <input
                name="name"
                value={form.name}
                onChange={update}
                required
                maxLength="60"
                placeholder="e.g. Miso ramen"
              />
            </label>
            <label>
              Cuisine
              <select
                name="category"
                value={form.category}
                onChange={update}
                required
              >
                <option value="" disabled>
                  Select cuisine
                </option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <div className="editor-number-field">
              <label htmlFor="product-price">Price (₱)</label>
              <div className="editor-unit-input">
                <input
                  id="product-price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  pattern="([0-9]+([.][0-9]{0,2})?|[.][0-9]{1,2})"
                  placeholder="e.g. 250.00"
                  title="Enter a price greater than 0 with up to 2 decimal places."
                  value={form.price}
                  onChange={update}
                  required
                />
                <span aria-hidden="true">₱</span>
              </div>
            </div>
            <div className="editor-number-field">
              <label htmlFor="product-stock">Portions in stock</label>
              <div className="editor-unit-input">
                <input
                  id="product-stock"
                  name="quantity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  placeholder="e.g. 15"
                  value={form.quantity}
                  onChange={update}
                  required
                />
                <span aria-hidden="true">portions</span>
              </div>
            </div>
            <div className="editor-rating-field editor-wide">
              <div className="editor-rating-heading">
                <label htmlFor="product-rating">Rating</label>
                <output htmlFor="product-rating" aria-hidden="true">
                  {Number(form.rating).toFixed(1)} <small>/ 5</small>
                </output>
              </div>
              <div className="editor-rating-picker">
                <div className="editor-rating-scale">
                  <div className="editor-rating-symbols" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, index) => {
                      const fill = Math.max(
                        0,
                        Math.min(1, Number(form.rating) - index),
                      );
                      return (
                        <span className="editor-rating-slot" key={index}>
                          <span className="editor-rating-dot" />
                          <span
                            className="editor-rating-star"
                            style={{
                              clipPath: `inset(0 ${100 - fill * 100}% 0 0)`,
                            }}
                          >
                            <Star
                              size={24}
                              fill="currentColor"
                              strokeWidth={1.5}
                            />
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  <input
                    id="product-rating"
                    className="editor-rating-slider"
                    name="rating"
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={update}
                    aria-valuetext={`${Number(form.rating).toFixed(1)} out of 5 stars`}
                    aria-describedby="product-rating-hint"
                  />
                </div>
              </div>
              <small id="product-rating-hint" className="editor-rating-hint">
                Slide or tap to rate
              </small>
            </div>
            <label className="editor-wide">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={update}
                rows="2"
                required
                maxLength="180"
                placeholder="Describe the dish"
              />
            </label>
            <label className="editor-wide">
              Specifications
              <textarea
                name="specification"
                value={form.specification}
                onChange={update}
                rows="2"
                required
                placeholder="Serving size, allergens, spice level..."
              />
            </label>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="editor-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-button"
              disabled={readingImage}
            >
              <ImagePlus size={16} />
              {product ? "Save changes" : "Add New Dish"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
