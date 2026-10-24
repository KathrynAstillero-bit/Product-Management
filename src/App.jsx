import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChefHat,
  ChevronDown,
  Clock3,
  Flame,
  Headphones,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { initialProducts } from "./mockData";
import Navigation from "./Components/Navigation";
import Product from "./Components/Product";
import AddNewProd from "./Components/AddNewProd";
import PModal from "./Components/PModal";
import HeroDishShowcase from "./Components/showcase";
import ProductDetailPage from "./Components/ProductDetailPage";
import "./App.css";

const photoFiles = import.meta.glob("./Food Items/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
const enhancedPhotos = import.meta.glob(
  "./Food Items/Enhanced/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);
const categories = [
  "All dishes",
  "Japanese",
  "Korean",
  "Thai",
  "Filipino",
  "Vietnamese",
  "Chinese",
  "Italian",
  "Mexican",
  "Indian",
];
const menuGroups = [
  {
    title: "Bowl & broth",
    icon: <Flame size={17} />,
    cuisines: ["Japanese", "Korean", "Vietnamese"],
  },
  {
    title: "From the wok",
    icon: <ChefHat size={17} />,
    cuisines: ["Thai", "Chinese", "Filipino"],
  },
  {
    title: "Oven & table",
    icon: <Clock3 size={17} />,
    cuisines: ["Italian", "Mexican", "Indian"],
  },
];
const photoAliases = {
  Bibimbap: "Bulgogi Bibimbap",
  "Kimchi Jjigae": "Vegan Kimchi Jjigae",
  "Sinigang na Baboy": "Sinigang",
  "Chicken Teriyaki Don": "Chicken teriyaki don",
  "Spaghetti Carbonara": "Spaghetti carbonara",
  "Xiao Long Bao": "Xiao long bao",
  "Pad Thai": "Pad thai",
};
const money = (amount) => Number(amount).toLocaleString("en-PH", { style: "currency", currency: "PHP" });

function productIdFromHash() {
  const match = window.location.hash.match(/^#\/products\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function imageFor(product) {
  const isBundledImage = [
    ...Object.values(enhancedPhotos),
    ...Object.values(photoFiles),
  ].includes(product.image);
  if (product.image && !isBundledImage) return product.image;
  const target = (photoAliases[product.name] || product.name).toLowerCase();
  const match = [
    ...Object.entries(enhancedPhotos),
    ...Object.entries(photoFiles),
  ].find(
    ([path]) =>
      path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "")
        .toLowerCase() === target,
  );
  return match?.[1] || product.image || "";
}

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("savor-products"));
      const saved = Array.isArray(cached) ? cached : initialProducts;
      // Apply the requested restock once, including existing saved dishes.
      if (localStorage.getItem("savor-stock-baseline") !== "15-v1") {
        const restocked = saved.map((product) => ({
          ...product,
          quantity: 15,
        }));
        localStorage.setItem("savor-products", JSON.stringify(restocked));
        localStorage.setItem("savor-stock-baseline", "15-v1");
        return restocked;
      }
      return saved;
    } catch {
      return initialProducts;
    }
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All dishes");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState("Popular picks");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [pageProductId, setPageProductId] = useState(productIdFromHash);

  useEffect(() => {
    const followHash = () => {
      const productId = productIdFromHash();
      setPageProductId(productId);
      requestAnimationFrame(() => {
        if (productId !== null) window.scrollTo(0, 0);
        else
          document
            .getElementById(window.location.hash.slice(1))
            ?.scrollIntoView();
      });
    };
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);

  const pageProduct = products.find((product) => product.id === pageProductId);
  useEffect(() => {
    document.title = pageProduct
      ? `${pageProduct.name} | pagKASarap`
      : "pagKASarap | Food, Found";
  }, [pageProduct]);

  const saveProducts = (next) => {
    try {
      localStorage.setItem("savor-products", JSON.stringify(next));
      setProducts(next);
      return true;
    } catch {
      return false;
    }
  };
  const filteredProducts = useMemo(() => {
    const selectedGroup = menuGroups.find((group) => group.title === category);
    let result = products.filter(
      (product) =>
        (category === "All dishes" ||
          (selectedGroup
            ? selectedGroup.cuisines.includes(product.category)
            : product.category === category)) &&
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    if (sort === "Price: low to high")
      result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "Top rated")
      result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, category, search, sort]);
  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const cartTotal = cartItems.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );
  const inventoryTotal = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );
  const stockCount = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  );

  const removeFromCart = (productId) => {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  const changeCart = (product, delta, amount = 1) => {
    setCart((current) => {
      const nextQuantity = (current[product.id] || 0) + delta * amount;
      if (nextQuantity < 1) {
        const next = { ...current };
        delete next[product.id];
        return next;
      }
      if (delta > 0 && nextQuantity > product.quantity) return current;
      return { ...current, [product.id]: nextQuantity };
    });
  };
  const openEditor = (product = null) => {
    setEditingProduct(
      product ? { ...product, image: imageFor(product) } : null,
    );
    setEditorOpen(true);
  };
  const saveProduct = (product) => {
    const next = editingProduct
      ? products.map((item) => (item.id === product.id ? product : item))
      : [
          ...products,
          {
            ...product,
            id: Math.max(0, ...products.map((item) => item.id)) + 1,
          },
        ];
    if (!saveProducts(next)) return false;
    if (editingProduct) {
      setCart((current) => {
        if ((current[product.id] || 0) <= product.quantity) return current;
        const nextCart = { ...current };
        if (product.quantity === 0) delete nextCart[product.id];
        else nextCart[product.id] = product.quantity;
        return nextCart;
      });
    }
    setEditorOpen(false);
    setEditingProduct(null);
    return true;
  };
  const removeProduct = () => {
    saveProducts(products.filter((product) => product.id !== deleteProduct.id));
    setCart((current) => {
      const next = { ...current };
      delete next[deleteProduct.id];
      return next;
    });
    setDeleteProduct(null);
  };
  const scrollToMenu = () => {
    if (pageProductId !== null) window.location.hash = "menu";
    requestAnimationFrame(() => {
      document
        .getElementById("menu")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    scrollToMenu();
  };
  const searchMenu = (nextSearch) => {
    setSearch(nextSearch);
    if (nextSearch.trim()) scrollToMenu();
  };
  const openProductDetails = (product) => {
    setCartOpen(false);
    window.location.assign(`#/products/${product.id}`);
  };

  return (
    <div className="app-shell">
      <Navigation
        categories={categories}
        category={category}
        onCategoryChange={selectCategory}
        search={search}
        onSearchChange={searchMenu}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        inventoryValue={inventoryTotal.toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        })}
        productCount={products.length}
        stockCount={stockCount}
      />
      <main id="home">
        {pageProductId !== null ? (
          pageProduct ? (
            <ProductDetailPage
              key={pageProduct.id}
              product={pageProduct}
              image={imageFor(pageProduct)}
              quantityInCart={cart[pageProduct.id] || 0}
              onAddToCart={(product, amount) => changeCart(product, 1, amount)}
              onBack={() => {
                window.location.hash = "menu";
              }}
            />
          ) : (
            <section className="product-page-missing">
              <h1>Dish not found</h1>
              <p>This dish is no longer on the menu.</p>
              <a className="hero-cta" href="#menu">
                Back to menu
              </a>
            </section>
          )
        ) : (
          <>
            <section className="hero-banner">
              <div className="hero-content">
                <div className="eyebrow">
                  <span className="eyebrow-line" /> A WORLD OF FLAVOUR{" "}
                  <span className="eyebrow-line" />
                </div>
                <h1>
                  Good food.
                  <br />
                  <em>Great stories.</em>
                </h1>
                <p>
                  From the streets of Seoul to the kitchens of Naples.
                  <br className="desktop-break" /> Find your next favorite, made
                  with care.
                </p>
                <a href="#menu" className="hero-cta">
                  Explore the menu <ArrowRight size={16} />
                </a>
              </div>
              <HeroDishShowcase products={products} imageFor={imageFor} />
            </section>
            <section className="menu-section" id="menu">
              <div className="section-heading">
                <div>
                  <div className="eyebrow section-eyebrow">
                    <span className="eyebrow-line" /> CURATED FOR YOU
                  </div>
                  <h2>
                    Find your <em>craving.</em>
                  </h2>
                </div>
                <div className="menu-meta">
                  <span>
                    <span className="live-dot" /> {filteredProducts.length}{" "}
                    dishes, freshly listed
                  </span>
                  <div className="sort-wrap">
                    <button
                      className="sort-button"
                      onClick={() => setSortOpen(!sortOpen)}
                    >
                      <SlidersHorizontal size={15} /> {sort}{" "}
                      <ChevronDown size={14} />
                    </button>
                    {sortOpen && (
                      <div className="sort-menu">
                        {[
                          "Popular picks",
                          "Price: low to high",
                          "Top rated",
                        ].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSort(option);
                              setSortOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="catalog-grid" id="catalog-grid" tabIndex={-1}>
                {filteredProducts.map((product) => (
                  <Product
                    key={product.id}
                    product={product}
                    image={imageFor(product)}
                    quantityInCart={cart[product.id] || 0}
                    onChangeCart={changeCart}
                    onEdit={() => openEditor(product)}
                    onDelete={() => setDeleteProduct(product)}
                    onOpenDetails={() => openProductDetails(product)}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="empty-state">
                    <Search size={24} />
                    <h3>No dishes found</h3>
                    <p>Try a different dish or cuisine.</p>
                  </div>
                )}
              </div>
            </section>
            <section
              className="menu-lists"
              id="collections"
              aria-label="Featured menu sections"
            >
              <div className="menu-list-heading">
                <div>
                  <span className="eyebrow section-eyebrow">
                    A LITTLE SOMETHING FOR EVERYONE
                  </span>
                  <h2>
                    On the <em>menu.</em>
                  </h2>
                </div>
                <a href="#menu">
                  View all dishes <ArrowRight size={15} />
                </a>
              </div>
              <div className="menu-list-grid">
                {menuGroups.map((group) => (
                  <button
                    key={group.title}
                    className={`menu-list-card ${category === group.title ? "selected" : ""}`}
                    aria-pressed={category === group.title}
                    onClick={() => {
                      setCategory(group.title);
                      document
                        .getElementById("menu")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="menu-list-icon">{group.icon}</span>
                    <span className="menu-list-copy">
                      <strong>{group.title}</strong>
                      <small>{group.cuisines.join(" · ")}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="site-footer" id="footer">
        <a
          className="brand footer-brand"
          href="#home"
          aria-label="pagKASarap home"
        >
          <span className="brand-mark">K</span>
          <span>
            pag<span className="brand-accent">KAS</span>arap
            <small>FOOD, FOUND</small>
          </span>
        </a>
        <span>Good things are meant to be shared.</span>
        <span>© 2026 pagKASarap</span>
      </footer>
      <button className="floating-add" onClick={() => openEditor()}>
        <Plus size={16} /> Add dish
      </button>
      {editorOpen && (
        <AddNewProd
          categories={categories.filter((item) => item !== "All dishes")}
          product={editingProduct}
          onSave={saveProduct}
          onClose={() => {
            setEditorOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
      {deleteProduct && (
        <PModal
          title="Remove this dish?"
          message={`${deleteProduct.name} will be removed from your menu and any active order.`}
          confirmLabel="Remove dish"
          onConfirm={removeProduct}
          onCancel={() => setDeleteProduct(null)}
        />
      )}
      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Your order"
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow section-eyebrow">MADE FOR YOU</span>
                <h2>
                  Your <em>order.</em>
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag size={30} />
                <h3>Your table is waiting.</h3>
                <p>Add a dish to get things started.</p>
                <button
                  className="gold-button"
                  onClick={() => setCartOpen(false)}
                >
                  Explore the menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-item-list">
                  {cartItems.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <button
                        type="button"
                        className="cart-item-photo"
                        aria-label={`View ${product.name} from cart`}
                        onClick={() => openProductDetails(product)}
                      >
                        {imageFor(product) && (
                          <img src={imageFor(product)} alt="" />
                        )}
                      </button>
                      <div className="cart-item-info">
                        <strong>{product.name}</strong>
                        <small>{product.category}</small>
                        <small>{money(product.price)} × {cart[product.id]}</small><span>Subtotal: {money(product.price * cart[product.id])}</span>
                      </div>
                      <div className="quantity-control">
                        <button
                          onClick={() => changeCart(product, -1)}
                          aria-label={`Remove one ${product.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{cart[product.id]}</span>
                        <button
                          disabled={cart[product.id] >= product.quantity}
                          onClick={() => changeCart(product, 1)}
                          aria-label={`Add one ${product.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-button"
                        aria-label={`Remove ${product.name} from cart`}
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Trash2 size={15} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(cartTotal)}</strong>
                  </div>
                  <div>
                    <span>Service</span>
                    <strong>Included</strong>
                  </div>
                  <div className="grand-total">
                    <span>Total</span>
                    <strong>{money(cartTotal)}</strong>
                  </div>
                  <button
                    className="gold-button checkout-button"
                    onClick={() => {
                      setCart({});
                      setCartOpen(false);
                    }}
                  >
                    Place your order <ArrowRight size={16} />
                  </button>
                  <small className="checkout-note">
                    <Headphones size={13} /> Questions? Our team is here to
                    help.
                  </small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
