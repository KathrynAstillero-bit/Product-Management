import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CircleUserRound,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import "./Navigation.css";

export default function Navigation({
  categories,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  cartCount,
  onCartOpen,
  inventoryValue,
  productCount,
  stockCount,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const inventoryDialogRef = useRef(null);
  useEffect(() => {
    const resizeNavigation = () => {
      if (window.innerWidth > 1000) setMenuOpen(false);
    };
    window.addEventListener("resize", resizeNavigation);
    return () => {
      window.removeEventListener("resize", resizeNavigation);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    headerRef.current?.querySelector(".main-nav a")?.focus();
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const openInventory = () => {
    setMenuOpen(false);
    inventoryDialogRef.current?.showModal();
  };

  return (
    <>
      <header className="topbar" ref={headerRef}>
        <a
          className="brand"
          href="#home"
          aria-label="pagKASarap home"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-mark">K</span>
          <span>
            pag<span className="brand-accent">KAS</span>arap
            <small>FOOD, FOUND</small>
          </span>
        </a>
        <nav
          id="main-navigation"
          className={`main-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Main navigation"
        >
          <a
            className="nav-link active"
            href="#menu"
            onClick={() => setMenuOpen(false)}
          >
            Explore menu
          </a>
          <a
            className="nav-link"
            href="#collections"
            onClick={() => setMenuOpen(false)}
          >
            Our kitchen
          </a>
          <button
            type="button"
            className="nav-link inventory-nav-trigger"
            aria-haspopup="dialog"
            aria-controls="inventory-summary-dialog"
            onClick={openInventory}
          >
            Overall stock value <ChevronDown size={14} aria-hidden="true" />
          </button>
          <a
            className="nav-link"
            href="#footer"
            onClick={() => setMenuOpen(false)}
          >
            About us
          </a>
        </nav>
        <div className="top-actions">
          <button
            className="icon-button profile-button"
            aria-label="Your profile"
          >
            <CircleUserRound size={19} />
          </button>
          <button
            className="cart-trigger"
            onClick={() => {
              setMenuOpen(false);
              onCartOpen();
            }}
          >
            <ShoppingBag size={17} />
            <span>My order</span>
            <b>{cartCount}</b>
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      <div className="catalog-tools">
        <div
          className="category-list"
          role="tablist"
          aria-label="Filter by cuisine"
        >
          {categories.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={category === item}
              className={`category-chip ${category === item ? "selected" : ""}`}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Find a dish..."
            aria-label="Search dishes"
          />
        </label>
      </div>
      <dialog
        ref={inventoryDialogRef}
        id="inventory-summary-dialog"
        className="inventory-summary-dialog"
        aria-labelledby="inventory-summary-title"
        aria-describedby="inventory-summary-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        onClose={() => {
          if (menuButtonRef.current?.getClientRects().length) {
            menuButtonRef.current.focus();
          }
        }}
      >
        <div
          className="inventory-summary"
          aria-label="Product inventory totals"
        >
          <button
            type="button"
            className="icon-button inventory-summary-close"
            aria-label="Close inventory summary"
            onClick={() => inventoryDialogRef.current?.close()}
          >
            <X size={18} />
          </button>
          <div>
            <h2 id="inventory-summary-title">Overall stock value</h2>
            <strong className="inventory-total" aria-live="polite">
              {inventoryValue}
            </strong>
          </div>
          <p>
            {productCount} products · {stockCount} portions in stock
          </p>
          <small id="inventory-summary-description">
            Sum of price × stock quantity for all products
          </small>
        </div>
      </dialog>
    </>
  );
}
