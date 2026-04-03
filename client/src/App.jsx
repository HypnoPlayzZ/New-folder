import { useState, useEffect, useRef } from "react";
import './App.css';
import { api } from './api';

// ─────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────
const MENU_DATA = [
  { id: 1, name: "Steamed Veg Momos", category: "Momos", halfPrice: 79, fullPrice: 139, description: "Delicate steamed dumplings stuffed with fresh vegetables and aromatic spices", rating: 4.8, prepTime: "15 min", tag: "Bestseller", available: true },
  { id: 2, name: "Paneer Momos", category: "Momos", halfPrice: 99, fullPrice: 169, description: "Soft momos filled with spiced cottage cheese and fresh herbs", rating: 4.9, prepTime: "18 min", tag: "Spicy", available: true },
  { id: 3, name: "Paneer Tikka Momos", category: "Momos", halfPrice: 109, fullPrice: 189, description: "Smoky paneer tikka stuffing wrapped in silky dough", rating: 4.7, prepTime: "20 min", tag: "Chef's Pick", available: true },
  { id: 4, name: "Fried Cheese Momos", category: "Momos", halfPrice: 119, fullPrice: 199, description: "Crispy fried momos with gooey cheese filling", rating: 4.6, prepTime: "22 min", tag: "Crispy", available: true },
  { id: 5, name: "Margherita Pizza", category: "Italian", halfPrice: 149, fullPrice: 249, description: "Classic tomato, fresh mozzarella, and fragrant basil on a crispy base", rating: 4.7, prepTime: "25 min", tag: "Classic", available: true },
  { id: 6, name: "Penne Arrabbiata", category: "Italian", halfPrice: 129, fullPrice: 219, description: "Spicy tomato sauce with garlic and Italian herbs over al dente penne", rating: 4.5, prepTime: "20 min", tag: "Spicy", available: true },
  { id: 7, name: "Garlic Bread Bruschetta", category: "Italian", halfPrice: 89, fullPrice: 149, description: "Toasted ciabatta with fresh tomato, garlic, and basil drizzle", rating: 4.4, prepTime: "12 min", tag: "Quick", available: true },
  { id: 8, name: "Veg Hakka Noodles", category: "Chowmein", halfPrice: 89, fullPrice: 149, description: "Stir-fried noodles with fresh veggies in soy-ginger sauce", rating: 4.6, prepTime: "15 min", tag: "Popular", available: true },
  { id: 9, name: "Paneer Chowmein", category: "Chowmein", halfPrice: 109, fullPrice: 179, description: "Wok-tossed noodles with golden paneer cubes and crispy vegetables", rating: 4.8, prepTime: "18 min", tag: "Bestseller", available: true },
  { id: 10, name: "Schezwan Noodles", category: "Chowmein", halfPrice: 99, fullPrice: 169, description: "Fiery Schezwan sauce noodles packed with bold flavors", rating: 4.7, prepTime: "15 min", tag: "Extra Spicy", available: true },
  { id: 11, name: "Smoky BBQ Veg Burger", category: "Burgers", halfPrice: null, fullPrice: 169, description: "Crispy veg patty with smoky BBQ sauce, jalapeños and crispy onions", rating: 4.8, prepTime: "20 min", tag: "Loaded", available: true },
  { id: 12, name: "Paneer Tikka Burger", category: "Burgers", halfPrice: null, fullPrice: 159, description: "Grilled paneer tikka patty with mint chutney and coleslaw", rating: 4.7, prepTime: "18 min", tag: "Crispy", available: true },
  { id: 13, name: "Masala Fries", category: "Sides", halfPrice: null, fullPrice: 99, description: "Golden fries tossed with Indian masala and chaat powder", rating: 4.5, prepTime: "10 min", tag: "Crunchy", available: true },
  { id: 14, name: "Mango Lassi", category: "Drinks", halfPrice: null, fullPrice: 89, description: "Thick, creamy mango yogurt drink with a hint of cardamom", rating: 4.9, prepTime: "5 min", tag: "Refreshing", available: true },
  { id: 15, name: "Cold Coffee", category: "Drinks", halfPrice: null, fullPrice: 99, description: "Creamy blended coffee with vanilla ice cream", rating: 4.6, prepTime: "5 min", tag: "Chilled", available: true },
];

const CATEGORIES = ["All", "Momos", "Italian", "Chowmein", "Burgers", "Sides", "Drinks"];
const COUPONS = { "GRABTHEDEAL": 0.20, "FIRST50": 0.15, "STEAM10": 0.10 };
const ORDER_STEPS = ["Order Received", "Preparing", "Out for Delivery", "Delivered"];

// Category SVG icons (no emojis)
const CategoryIcons = {
  Momos: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <ellipse cx="24" cy="30" rx="18" ry="10" fill="currentColor" opacity="0.15"/>
      <path d="M8 28 Q14 16 24 14 Q34 16 40 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M8 28 Q16 36 24 36 Q32 36 40 28" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M16 26 Q20 22 24 22 Q28 22 32 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M22 14 Q24 10 26 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Italian: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M8 36 L24 10 L40 36 Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" strokeLinejoin="round"/>
      <circle cx="20" cy="26" r="3" fill="currentColor" opacity="0.6"/>
      <circle cx="28" cy="30" r="2.5" fill="currentColor" opacity="0.5"/>
      <circle cx="24" cy="22" r="2" fill="currentColor" opacity="0.4"/>
      <path d="M8 36 Q24 40 40 36" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Chowmein: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="10" y="28" width="28" height="12" rx="4" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 28 Q18 18 20 22 Q22 26 24 20 Q26 14 28 18 Q30 22 32 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M13 28 Q15 16 17 20 Q19 24 21 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <line x1="20" y1="12" x2="20" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="12" x2="28" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Burgers: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M10 20 Q10 12 24 12 Q38 12 38 20 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <rect x="8" y="20" width="32" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="8" y="25" width="32" height="5" rx="1" fill="currentColor" opacity="0.5"/>
      <path d="M8 30 Q8 38 24 38 Q40 38 40 30 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 22 Q18 24 24 22 Q30 20 38 22" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
    </svg>
  ),
  Sides: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="14" y="18" width="20" height="22" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      <rect x="16" y="14" width="16" height="6" rx="2" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/>
      <rect x="18" y="22" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="22.5" y="22" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="27" y="22" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  Drinks: () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M16 14 L14 38 Q14 40 24 40 Q34 40 32 38 L30 14 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M30 14 L36 20 Q38 24 34 26 L30 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 22 Q20 26 28 22" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
      <line x1="22" y1="10" x2="22" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="8" x2="27" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const FoodIllustrations = {
  Momos: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <ellipse cx="40" cy="55" rx="28" ry="14" fill="#FF8C00" opacity="0.15"/>
      <path d="M14 48 Q20 28 40 24 Q60 28 66 48" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M14 48 Q26 62 40 62 Q54 62 66 48" stroke="#FF8C00" strokeWidth="3" fill="none"/>
      <path d="M25 44 Q32 36 40 36 Q48 36 55 44" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M38 24 Q40 18 42 22" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="40" cy="43" r="3" fill="#FF8C00" opacity="0.4"/>
    </svg>
  ),
  Italian: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <path d="M12 60 L40 16 L68 60 Z" stroke="#FF8C00" strokeWidth="2.5" fill="#FF8C00" fillOpacity="0.08" strokeLinejoin="round"/>
      <circle cx="34" cy="44" r="5" fill="#FF8C00" opacity="0.5"/>
      <circle cx="46" cy="50" r="4" fill="#FF8C00" opacity="0.4"/>
      <circle cx="40" cy="36" r="3" fill="#FF8C00" opacity="0.3"/>
      <circle cx="28" cy="54" r="3" fill="#FF8C00" opacity="0.3"/>
      <path d="M12 60 Q40 66 68 60" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Chowmein: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="16" y="46" width="48" height="20" rx="6" fill="#FF8C00" opacity="0.12" stroke="#FF8C00" strokeWidth="2.5"/>
      <path d="M26 46 Q30 26 34 34 Q38 42 40 30 Q42 18 46 26 Q50 34 54 46" stroke="#FF8C00" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M20 46 Q24 24 28 30 Q32 36 34 22" stroke="#FF8C00" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <line x1="34" y1="18" x2="34" y2="12" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="46" y1="18" x2="46" y2="12" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Burgers: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <path d="M16 34 Q16 20 40 20 Q64 20 64 34 Z" fill="#FF8C00" opacity="0.2" stroke="#FF8C00" strokeWidth="2.5"/>
      <rect x="12" y="34" width="56" height="9" rx="2" fill="#FF8C00" opacity="0.25"/>
      <rect x="12" y="43" width="56" height="9" rx="2" fill="#FF8C00" opacity="0.4"/>
      <path d="M12 52 Q12 64 40 64 Q68 64 68 52 Z" fill="#FF8C00" opacity="0.2" stroke="#FF8C00" strokeWidth="2.5"/>
      <path d="M16 37 Q30 41 40 37 Q50 33 64 37" stroke="#FF8C00" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round"/>
    </svg>
  ),
  Sides: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="24" y="28" width="32" height="36" rx="5" fill="#FF8C00" opacity="0.12" stroke="#FF8C00" strokeWidth="2.5"/>
      <rect x="26" y="20" width="28" height="10" rx="3" fill="#FF8C00" opacity="0.2" stroke="#FF8C00" strokeWidth="2.5"/>
      <rect x="30" y="34" width="5" height="24" rx="2.5" fill="#FF8C00" opacity="0.5"/>
      <rect x="37.5" y="34" width="5" height="24" rx="2.5" fill="#FF8C00" opacity="0.5"/>
      <rect x="45" y="34" width="5" height="24" rx="2.5" fill="#FF8C00" opacity="0.5"/>
    </svg>
  ),
  Drinks: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <path d="M28 22 L24 62 Q24 66 40 66 Q56 66 52 62 L48 22 Z" fill="#FF8C00" fillOpacity="0.1" stroke="#FF8C00" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M48 22 L58 32 Q62 40 56 44 L48 40" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M28 36 Q34 44 48 36" stroke="#FF8C00" strokeWidth="2.5" fill="#FF8C00" fillOpacity="0.2" strokeLinecap="round"/>
      <line x1="37" y1="16" x2="37" y2="10" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="43" y1="14" x2="44" y2="8" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Default: () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="40" cy="40" r="24" fill="#FF8C00" opacity="0.1" stroke="#FF8C00" strokeWidth="2"/>
      <path d="M28 36 Q34 28 40 30 Q46 28 52 36" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M28 44 Q34 52 40 50 Q46 52 52 44" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
};

function getFoodIllustration(category) {
  const C = FoodIllustrations[category] || FoodIllustrations.Default;
  return <C />;
}

function cn(...c) { return c.filter(Boolean).join(" "); }

// ─────────────────────────────────────────────
// THEME VARS
// ─────────────────────────────────────────────
const themes = {
  dark: {
    bg: "#060608", surface: "#0e0e12", card: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.07)", text: "#f2f2f5", muted: "#7a7a88", faint: "#404050",
    inputBg: "rgba(255,255,255,0.05)", navBg: "rgba(6,6,8,0.88)",
  },
  light: {
    bg: "#faf9f7", surface: "#ffffff", card: "rgba(0,0,0,0.028)",
    border: "rgba(0,0,0,0.08)", text: "#18181b", muted: "#5c5c6e", faint: "#b0b0bc",
    inputBg: "rgba(0,0,0,0.04)", navBg: "rgba(250,249,247,0.92)",
  }
};

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
function Navbar({ cartCount, setPage, page, setCartOpen, user, setUser, isDark, toggleTheme }) {
  const [mob, setMob] = useState(false);
  const t = isDark ? themes.dark : themes.light;

  return (
    <nav style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center gap-2.5 group">
          <div className="logo-mark w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8 4 4 8 4 14a8 8 0 0016 0C20 8 16 4 12 2z" fill="currentColor" opacity="0.3"/>
              <path d="M9 14c0-2 1.5-4 3-5 1.5 1 3 3 3 5a3 3 0 01-6 0z" fill="currentColor"/>
            </svg>
          </div>
          <div className="leading-none">
            <span style={{ color: t.text }} className="font-black text-lg tracking-tight">Steamy</span>
            <span className="text-orange-500 font-black text-lg tracking-tight">Bites</span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {[["home","Home"],["menu","Menu"],["orders","Tracking"]].map(([p,l]) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ color: page===p ? "#FF8C00" : t.muted, background: page===p ? "rgba(255,140,0,0.1)" : "transparent" }}
              className={`nav-item-pill ${page===p ? "active" : ""} px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:text-orange-500`}>{l}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            style={{ background: t.card, border: `1px solid ${t.border}`, color: t.muted }}
            className="theme-btn p-2.5 rounded-xl hover:text-orange-500 transition-all">
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {!user ? (
            <button onClick={() => setPage("auth")}
              className="hidden md:block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25">
              Sign In
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                {user.name[0].toUpperCase()}
              </div>
              <button onClick={() => setUser(null)} style={{ color: t.faint }} className="text-xs hover:text-orange-500 transition-colors">Logout</button>
            </div>
          )}

          <button onClick={() => setCartOpen(true)}
            className="cart-btn relative p-2.5 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 rounded-xl text-orange-500 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-count absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md shadow-orange-500/40">{cartCount}</span>}
          </button>

          <button onClick={() => setMob(!mob)} style={{ color: t.muted }} className="md:hidden p-2 rounded-xl hover:text-orange-500 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      {mob && (
        <div style={{ background: t.surface, borderTop: `1px solid ${t.border}` }} className="md:hidden px-4 py-3 space-y-1">
          {[["home","Home"],["menu","Menu"],["orders","Tracking"]].map(([p,l]) => (
            <button key={p} onClick={() => { setPage(p); setMob(false); }}
              style={{ color: page===p ? "#FF8C00" : t.muted, background: page===p ? "rgba(255,140,0,0.08)" : "transparent" }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold">{l}</button>
          ))}
          {!user
            ? <button onClick={() => { setPage("auth"); setMob(false); }} className="w-full text-left px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold">Sign In</button>
            : <button onClick={() => setUser(null)} style={{ color: t.muted }} className="w-full text-left px-4 py-2.5 text-sm">Logout ({user.name})</button>}
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────
// AUTH PAGE — Google Sign-In only
// ─────────────────────────────────────────────
function AuthPage({ setUser, setPage, isDark }) {
  const [error, setError] = useState("");
  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    const GOOGLE_CLIENT_ID = "414726937830-u8n7mhl0ujipnd6lr9ikku005nu72ec6.apps.googleusercontent.com";
    const buttonDiv = document.getElementById("google-signin-button");

    const initGoogleButton = () => {
      if (window.google?.accounts?.id && buttonDiv) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (googleResponse) => {
            try {
              const res = await api.post('/auth/google', { token: googleResponse.credential });
              const { token, userName } = res.data;
              localStorage.setItem('customer_token', token);
              const payload = JSON.parse(atob(googleResponse.credential.split(".")[1]));
              setUser({ name: userName || payload.name || payload.email, email: payload.email, picture: payload.picture });
              setPage("menu");
            } catch {
              setError("Google Sign-In failed. Please try again.");
            }
          },
        });
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: isDark ? "filled_black" : "outline",
          size: "large",
          width: 280,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogleButton();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDark, setUser, setPage]);

  return (
    <div style={{ background: t.bg, minHeight: "100vh" }} className="auth-page-bg flex items-center justify-center px-4 pt-20 pb-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="relative w-full max-w-sm">
        <div style={{ background: isDark ? "rgba(14,14,18,0.95)" : "white", border: `1px solid ${t.border}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          className="auth-card rounded-3xl overflow-hidden shadow-2xl">

          {/* Top banner */}
          <div className="auth-banner relative h-32 bg-gradient-to-br from-orange-500 to-orange-700 overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-8 text-white/30 text-6xl rotate-12"><FoodIllustrations.Momos /></div>
              <div className="absolute bottom-2 right-8 text-white/20 text-5xl -rotate-6"><FoodIllustrations.Italian /></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-1 shadow-xl">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8 4 4 8 4 14a8 8 0 0016 0C20 8 16 4 12 2z" fill="currentColor" opacity="0.4"/>
                  <path d="M9 14c0-2 1.5-4 3-5 1.5 1 3 3 3 5a3 3 0 01-6 0z" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-white/80 text-xs font-semibold tracking-widest uppercase">SteamyBites</p>
            </div>
          </div>

          <div className="p-7 flex flex-col items-center">
            <h2 style={{ color: t.text }} className="text-2xl font-black mb-1 text-center">Welcome</h2>
            <p style={{ color: t.muted }} className="text-sm mb-7 text-center">Sign in to continue your food journey</p>

            {error && (
              <div className="w-full mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20 text-center">{error}</div>
            )}

            <div id="google-signin-button" className="flex justify-center" />

            <p style={{ color: t.faint }} className="text-xs mt-6 text-center">
              By signing in, you agree to our{" "}
              <span className="text-orange-500">Terms &amp; Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────
function HeroSection({ setPage, isDark }) {
  const t = isDark ? themes.dark : themes.light;
  const [tick, setTick] = useState(0);
  const tags = ["Steamed Momos", "Italian", "Chowmein", "Burgers"];
  useEffect(() => { const i = setInterval(() => setTick(p => p + 1), 2200); return () => clearInterval(i); }, []);

  return (
    <section style={{ background: t.bg }} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        {isDark && <div className="dark-grid absolute inset-0 opacity-100" />}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div>
          <div className="live-badge inline-flex items-center gap-2 bg-green-500/12 border border-green-500/25 rounded-full px-4 py-1.5 mb-7">
            <span className="live-dot w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold" style={{ color: isDark ? "#4ade80" : "#16a34a" }}>Live order tracking</span>
          </div>

          <h1 style={{ color: t.text }} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-5 anim-fade-up-1">
            Crave it.<br />
            <span className="gradient-text-hero">Order it.</span><br />
            Love it.
          </h1>

          <p style={{ color: t.muted }} className="text-lg mb-8 max-w-md leading-relaxed">
            Fresh momos, sizzling pasta, crispy veg burgers — 100% vegetarian, crafted with care and at your door in 30 minutes.
          </p>

          {/* Animated tag strip */}
          <div className="flex flex-wrap gap-2 mb-9">
            {tags.map((tag, i) => (
              <span key={tag} style={{
                background: tick % tags.length === i ? "rgba(255,140,0,0.15)" : t.card,
                border: `1px solid ${tick % tags.length === i ? "rgba(255,140,0,0.4)" : t.border}`,
                color: tick % tags.length === i ? "#FF8C00" : t.faint,
                transform: tick % tags.length === i ? "scale(1.06)" : "scale(1)",
              }} className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-500 cursor-default">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 anim-fade-up-3">
            <button onClick={() => setPage("menu")}
              className="hero-cta px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30 text-base">
              Order Now →
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {["R","P","A"].map((l,i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ borderColor: t.bg }}>{l}</div>
                ))}
              </div>
              <div style={{ color: t.muted }} className="text-sm"><span style={{ color: t.text }} className="font-bold">4.8★</span> · 2k+ orders</div>
            </div>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-80 h-80">
            <div className="hero-ring absolute inset-0 rounded-full border border-orange-500/20" style={{ background: "radial-gradient(circle, rgba(255,140,0,0.07) 0%, transparent 70%)" }} />
            <div className="hero-ring-rev absolute inset-6 rounded-full border border-orange-400/10" />
            <div className="absolute inset-8 flex items-center justify-center">
              <FoodIllustrations.Momos />
            </div>
            {[
              { Icon: FoodIllustrations.Italian, label: "Italian", pos: { top: "-20px", right: "-20px" } },
              { Icon: FoodIllustrations.Chowmein, label: "Noodles", pos: { bottom: "0px", left: "-40px" } },
              { Icon: FoodIllustrations.Burgers, label: "Burgers", pos: { top: "50%", right: "-50px" } },
            ].map(({ Icon, label, pos }) => (
              <div key={label} style={{ ...pos, background: isDark ? "rgba(255,255,255,0.07)" : "white", border: `1px solid ${t.border}`, position: "absolute" }}
                className="hero-chip backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl">
                <div className="w-8 h-8 flex items-center justify-center"><Icon /></div>
                <span style={{ color: t.text }} className="text-sm font-semibold">{label}</span>
              </div>
            ))}

            <div style={{ background: isDark ? "#111" : "white", border: `1px solid ${t.border}` }}
              className="hero-stats absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 flex gap-5 whitespace-nowrap shadow-2xl">
              {[["30 min","Delivery"],["₹0","Over ₹250"],["4.8★","Rating"]].map(([v,l]) => (
                <div key={l} className="text-center">
                  <div style={{ color: t.text }} className="font-black text-sm">{v}</div>
                  <div style={{ color: t.faint }} className="text-xs">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOD CARD
// ─────────────────────────────────────────────
function FoodCard({ item, onAddToCart, isDark }) {
  const [size, setSize] = useState(item.halfPrice ? "half" : "full");
  const [added, setAdded] = useState(false);
  const t = isDark ? themes.dark : themes.light;
  const price = size === "half" ? item.halfPrice : item.fullPrice;

  const tagColorMap = {
    Bestseller: { bg: "rgba(255,140,0,0.15)", text: "#FF8C00", border: "rgba(255,140,0,0.3)" },
    "Chef's Pick": { bg: "rgba(99,102,241,0.15)", text: "#818cf8", border: "rgba(99,102,241,0.3)" },
    Spicy: { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
    "Extra Spicy": { bg: "rgba(220,38,38,0.15)", text: "#ef4444", border: "rgba(220,38,38,0.3)" },
    Popular: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
    Classic: { bg: "rgba(234,179,8,0.12)", text: "#facc15", border: "rgba(234,179,8,0.25)" },
    Quick: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
    Crispy: { bg: "rgba(255,140,0,0.12)", text: "#fb923c", border: "rgba(255,140,0,0.25)" },
    Loaded: { bg: "rgba(255,140,0,0.12)", text: "#fb923c", border: "rgba(255,140,0,0.25)" },
    Refreshing: { bg: "rgba(56,189,248,0.12)", text: "#38bdf8", border: "rgba(56,189,248,0.25)" },
    Chilled: { bg: "rgba(56,189,248,0.12)", text: "#38bdf8", border: "rgba(56,189,248,0.25)" },
    Crunchy: { bg: "rgba(255,140,0,0.12)", text: "#fb923c", border: "rgba(255,140,0,0.25)" },
  };
  const tagStyle = tagColorMap[item.tag] || tagColorMap.Bestseller;

  function handleAdd() {
    setAdded(true);
    onAddToCart({ ...item, selectedSize: size, selectedPrice: price });
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}` }}
      className="food-card rounded-2xl overflow-hidden group">
      {/* Illustration area */}
      <div style={{ background: isDark ? "rgba(255,140,0,0.04)" : "rgba(255,140,0,0.04)", borderBottom: `1px solid ${t.border}` }}
        className="card-art h-36 flex items-center justify-center relative">
        <div className="card-icon">
          {getFoodIllustration(item.category)}
        </div>
        {item.tag && (
          <span style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}` }}
            className="food-tag absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold">
            {item.tag}
          </span>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span style={{ color: t.muted }} className="font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 style={{ color: t.text }} className="font-bold text-base leading-tight mb-1">{item.name}</h3>
        <p style={{ color: t.faint }} className="text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {item.rating}
          </span>
          <span style={{ color: t.faint }} className="flex items-center gap-1 text-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {item.prepTime}
          </span>
        </div>

        {item.halfPrice && (
          <div style={{ background: t.inputBg, border: `1px solid ${t.border}` }} className="flex rounded-xl p-1 mb-3">
            {["half","full"].map(s => (
              <button key={s} onClick={() => setSize(s)}
                style={{ background: size===s ? "#FF8C00" : "transparent", color: size===s ? "white" : t.faint }}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all">
                {s === "half" ? `Half ₹${item.halfPrice}` : `Full ₹${item.fullPrice}`}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-orange-500 font-black text-xl">₹{price}</span>
          {item.available && (
            <button onClick={handleAdd} disabled={added}
              style={{ background: added ? "rgba(34,197,94,0.15)" : "#FF8C00", color: added ? "#4ade80" : "white", border: added ? "1px solid rgba(34,197,94,0.3)" : "none" }}
              className="add-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all">
              {added ? (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6L9 17l-5-5"/></svg> Added</>
              ) : (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg> Add</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MENU PAGE
// ─────────────────────────────────────────────
function MenuPage({ setCart, isDark }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const t = isDark ? themes.dark : themes.light;

  const filtered = MENU_DATA.filter(i => (cat === "All" || i.category === cat) && (i.name.toLowerCase().includes(q.toLowerCase()) || i.category.toLowerCase().includes(q.toLowerCase())));

  function addToCart(item) {
    setCart(prev => {
      const key = `${item.id}-${item.selectedSize}`;
      const ex = prev.find(c => `${c.id}-${c.selectedSize}` === key);
      if (ex) return prev.map(c => `${c.id}-${c.selectedSize}` === key ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  return (
    <div style={{ background: t.bg }} className="page-wrap pt-20 min-h-screen">
      <div style={{ background: isDark ? "linear-gradient(to bottom, #0d0d10, transparent)" : "linear-gradient(to bottom, #eee9de, transparent)" }} className="menu-hero py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 style={{ color: t.text }} className="text-4xl font-black mb-1 anim-fade-up">Our Menu</h2>
          <p style={{ color: t.muted }} className="mb-6 text-sm anim-fade-up-1">Fresh, made-to-order. Every single time.</p>
          <div className="relative max-w-md mb-6 anim-fade-up-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: t.faint }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search dishes..."
              style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
              className="search-bar w-full pl-11 pr-4 py-3 rounded-2xl text-sm placeholder-zinc-500 outline-none transition-all"/>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 anim-fade-up-3">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ background: cat===c ? "#FF8C00" : t.card, border: `1px solid ${cat===c ? "#FF8C00" : t.border}`, color: cat===c ? "white" : t.muted }}
                className={`cat-pill ${cat===c ? "active" : ""} px-4 py-2 rounded-xl text-sm font-bold`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="empty-state text-center py-20" style={{ color: t.faint }}>
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 opacity-40"><circle cx="20" cy="20" r="14"/><path d="m34 34 8 8"/></svg>
            <p>No items found</p>
          </div>
        ) : (
          <div className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
            {filtered.map(item => <FoodCard key={item.id} item={item} onAddToCart={addToCart} isDark={isDark} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CART MODAL — Premium redesign
// ─────────────────────────────────────────────
function CartModal({ cart, setCart, open, setOpen, setPage, isDark, user }) {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponErr, setCouponErr] = useState("");
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const t = isDark ? themes.dark : themes.light;

  const sub = cart.reduce((s, i) => s + i.selectedPrice * i.qty, 0);
  const delivery = sub >= 250 ? 0 : 40;
  const disc = appliedCoupon ? Math.round(sub * COUPONS[appliedCoupon]) : 0;
  const total = sub + delivery - disc;

  function updQty(key, d) {
    setCart(prev => prev.map(c => `${c.id}-${c.selectedSize}` === key ? { ...c, qty: Math.max(0, c.qty + d) } : c).filter(c => c.qty > 0));
  }

  function applyCpn() {
    if (COUPONS[coupon.toUpperCase()]) { setAppliedCoupon(coupon.toUpperCase()); setCouponErr(""); }
    else { setCouponErr("Invalid coupon code"); setAppliedCoupon(null); }
  }

  async function placeOrder() {
    if (!address.trim()) { alert("Please enter a delivery address"); return; }
    setProcessing(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({
          itemName: i.name,
          quantity: i.qty,
          variant: i.selectedSize === 'half' ? 'half' : 'full',
          priceAtOrder: i.selectedPrice,
        })),
        totalPrice: sub,
        finalPrice: total,
        customerName: user?.name || 'Customer',
        address,
        paymentMethod: 'COD',
      });
      setProcessing(false);
      setDone(true);
      setTimeout(() => {
        setDone(false); setCart([]); setOpen(false); setAppliedCoupon(null); setCoupon(""); setAddress(""); setPage("orders");
      }, 1800);
    } catch (err) {
      setProcessing(false);
      alert(err.response?.data?.message || 'Failed to place order. Please sign in and try again.');
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="cart-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onClick={() => setOpen(false)}>
        <div style={{ background: isDark ? "#0e0e12" : "#ffffff", border: `1px solid ${t.border}`, maxHeight: "92vh" }}
          className="cart-panel w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ borderBottom: `1px solid ${t.border}` }} className="px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
                </svg>
              </div>
              <div>
                <h3 style={{ color: t.text }} className="font-black text-lg">Your Cart</h3>
                <p style={{ color: t.faint }} className="text-xs">{cart.reduce((s,i) => s+i.qty, 0)} items · Est. 30 min</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: t.faint, background: t.card, border: `1px solid ${t.border}` }} className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-orange-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {done ? (
            <div className="order-success flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <div className="success-ring w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-10 h-10"><path className="success-check" d="M20 6L9 17l-5-5"/></svg>
              </div>
              <div className="text-center">
                <h3 style={{ color: t.text }} className="font-black text-xl mb-1">Order Placed!</h3>
                <p style={{ color: t.muted }} className="text-sm">Redirecting to tracking...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16" style={{ color: t.faint }}>
                      <circle cx="18" cy="42" r="3"/><circle cx="38" cy="42" r="3"/>
                      <path d="M2 2h8l5.37 26.78A4 4 0 0019.35 32h20.3a4 4 0 003.97-3.22L46 12H12"/>
                    </svg>
                    <p style={{ color: t.faint }} className="text-sm">Your cart is empty</p>
                    <button onClick={() => setOpen(false)} className="text-orange-500 text-sm font-bold hover:text-orange-400 transition-colors">Browse Menu →</button>
                  </div>
                ) : (
                  cart.map(item => {
                    const key = `${item.id}-${item.selectedSize}`;
                    return (
                      <div key={key} style={{ background: t.card, border: `1px solid ${t.border}` }} className="cart-item-row flex items-center gap-3 rounded-2xl p-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,140,0,0.08)" }}>
                          {getFoodIllustration(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ color: t.text }} className="text-sm font-bold truncate">{item.name}</p>
                          <p style={{ color: t.faint }} className="text-xs capitalize">{item.selectedSize} · ₹{item.selectedPrice}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => updQty(key, -1)} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.muted }} className="qty-btn w-7 h-7 rounded-lg flex items-center justify-center hover:text-orange-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M5 12h14"/></svg>
                          </button>
                          <span style={{ color: t.text }} className="w-5 text-center text-sm font-black">{item.qty}</span>
                          <button onClick={() => updQty(key, 1)} className="qty-btn w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-500 flex items-center justify-center hover:bg-orange-500/25">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14"/></svg>
                          </button>
                        </div>
                        <span className="text-orange-500 font-black text-sm flex-shrink-0">₹{item.selectedPrice * item.qty}</span>
                      </div>
                    );
                  })
                )}

                {cart.length > 0 && (
                  <div style={{ background: "rgba(255,140,0,0.05)", border: "1px solid rgba(255,140,0,0.18)" }} className="rounded-xl p-3 text-xs" style2={{ color: t.muted }}>
                    <p style={{ color: t.muted }}>Codes: <span className="text-orange-500 font-mono font-bold">GRABTHEDEAL</span> · <span className="text-orange-500 font-mono font-bold">FIRST50</span> · <span className="text-orange-500 font-mono font-bold">STEAM10</span></p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: `1px solid ${t.border}` }} className="px-5 py-4 space-y-3 flex-shrink-0">
                  {/* Coupon */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.faint }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      </div>
                      <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code"
                        style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm placeholder-zinc-500 outline-none focus:border-orange-500/50 transition-all"/>
                    </div>
                    <button onClick={applyCpn} className="px-4 py-2.5 bg-orange-500/15 text-orange-500 border border-orange-500/25 rounded-xl text-sm font-bold hover:bg-orange-500/25 transition-all">Apply</button>
                  </div>
                  {couponErr && <p className="text-red-400 text-xs">{couponErr}</p>}
                  {appliedCoupon && <p className="text-green-500 text-xs font-semibold">✓ {appliedCoupon} — {(COUPONS[appliedCoupon]*100).toFixed(0)}% off applied!</p>}

                  {/* Address */}
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address..."
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm placeholder-zinc-500 outline-none focus:border-orange-500/50 transition-all"/>

                  {/* Bill summary */}
                  <div style={{ background: t.card, border: `1px solid ${t.border}` }} className="rounded-2xl p-4 space-y-2">
                    {[["Subtotal", `₹${sub}`, false],["Delivery", delivery===0?"FREE":`₹${delivery}`, delivery===0],disc>0?["Discount",`-₹${disc}`,true]:null].filter(Boolean).map(([l,v,g]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span style={{ color: t.muted }}>{l}</span>
                        <span style={{ color: g ? "#4ade80" : t.text }} className="font-semibold">{v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${t.border}` }} className="flex justify-between pt-2">
                      <span style={{ color: t.text }} className="font-black">Total</span>
                      <span className="text-orange-500 font-black text-lg">₹{total}</span>
                    </div>
                  </div>
                  {sub < 250 && <p style={{ color: t.faint }} className="text-xs">Add ₹{250-sub} more for free delivery</p>}

                  <button onClick={placeOrder} disabled={processing}
                    className="order-btn w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/25 disabled:opacity-60 text-sm tracking-wide">
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>
                        Processing...
                      </span>
                    ) : `Confirm Order · ₹${total}`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// ORDERS / TRACKING
// ─────────────────────────────────────────────
const STATUS_TO_STEP = {
  'Received': 0, 'Pending Payment': 0,
  'Preparing': 1, 'Ready': 1,
  'Out for Delivery': 2,
  'Delivered': 3, 'Rejected': 3,
};

function OrdersPage({ isDark }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = isDark ? themes.dark : themes.light;
  const activeOrder = orders[0] || null;
  const pastOrders = orders.slice(1);
  const step = activeOrder ? (STATUS_TO_STEP[activeOrder.status] ?? 0) : 0;

  // Fetch orders from server
  const fetchOrders = async () => {
    try {
      const res = await api.get('/my-orders');
      setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // SSE for real-time status on the active order
  useEffect(() => {
    if (!activeOrder?._id) return;
    const token = localStorage.getItem('customer_token');
    if (!token) return;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://steamybitesbackend.onrender.com/api';
    const es = new EventSource(`${baseURL}/orders/${activeOrder._id}/status-stream?token=${token}`);
    es.onmessage = (e) => {
      try {
        const { status } = JSON.parse(e.data);
        setOrders(prev => prev.map((o, i) => i === 0 ? { ...o, status } : o));
      } catch {}
    };
    return () => es.close();
  }, [activeOrder?._id]);

  const activeItemNames = activeOrder?.items?.map(i => i.itemName || i.menuItemId?.name || 'Item').join(' · ') || '';
  const isRejected = activeOrder?.status === 'Rejected';

  return (
    <div style={{ background: t.bg }} className="page-wrap pt-20 min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <h2 style={{ color: t.text }} className="text-4xl font-black mb-1 anim-fade-up">Track Order</h2>
      <p style={{ color: t.muted }} className="text-sm mb-8 anim-fade-up-1">Live status of your active order</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="w-8 h-8 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>
        </div>
      ) : !activeOrder ? (
        <div style={{ background: t.card, border: `1px solid ${t.border}` }} className="rounded-3xl p-12 flex flex-col items-center justify-center gap-4 mb-8">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 opacity-30" style={{ color: t.faint }}>
            <circle cx="18" cy="42" r="3"/><circle cx="38" cy="42" r="3"/>
            <path d="M2 2h8l5.37 26.78A4 4 0 0019.35 32h20.3a4 4 0 003.97-3.22L46 12H12"/>
          </svg>
          <p style={{ color: t.faint }} className="text-sm font-semibold">No orders yet</p>
          <p style={{ color: t.faint }} className="text-xs">Place an order to track it here</p>
        </div>
      ) : (
        <div style={{ background: t.card, border: `1px solid ${isRejected ? "rgba(239,68,68,0.3)" : "rgba(255,140,0,0.2)"}` }} className="tracking-card rounded-3xl p-6 mb-6 anim-fade-up-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isRejected
                  ? <span className="text-red-400 text-xs font-black uppercase tracking-widest">Rejected</span>
                  : <><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /><span className="text-orange-500 text-xs font-black uppercase tracking-widest">Live</span></>
                }
              </div>
              <h3 style={{ color: t.text }} className="font-black text-xl">Order #{activeOrder._id?.slice(-6).toUpperCase()}</h3>
              <p style={{ color: t.muted }} className="text-xs mt-0.5">{activeItemNames}</p>
              {activeOrder.address && <p style={{ color: t.faint }} className="text-xs mt-0.5 truncate max-w-xs">{activeOrder.address}</p>}
            </div>
            <div className="text-right">
              <p className="text-orange-500 font-black text-2xl">₹{activeOrder.finalPrice ?? activeOrder.totalPrice}</p>
              <p style={{ color: t.muted }} className="text-xs">{activeOrder.status}</p>
            </div>
          </div>

          {/* Stepper */}
          {!isRejected && (
            <div className="relative py-2">
              <div style={{ background: t.border, position: "absolute", top: "50%", left: "20px", right: "20px", height: "2px", transform: "translateY(-50%)", zIndex: 0 }} />
              <div className="stepper-bar" style={{ background: "linear-gradient(to right, #FF8C00, #fb923c)", position: "absolute", top: "50%", left: "20px", height: "2px", transform: "translateY(-50%)", width: `${(step / 3) * 100}%`, zIndex: 0, maxWidth: "calc(100% - 40px)" }} />
              <div className="relative flex justify-between z-10">
                {ORDER_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2 w-16 sm:w-20">
                    <div style={{ background: i <= step ? "#FF8C00" : (isDark ? "#1a1a22" : "#e5e7eb"), border: `2px solid ${i <= step ? "#FF8C00" : t.border}`, color: i <= step ? "white" : t.faint, boxShadow: i <= step ? "0 0 20px rgba(255,140,0,0.45)" : "none" }}
                      className={`step-dot ${i < step ? "done" : ""} ${i === step ? "current" : ""} w-9 h-9 rounded-full flex items-center justify-center text-xs font-black`}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span style={{ color: i <= step ? t.text : t.faint }} className="text-center text-xs font-semibold leading-tight">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step >= 2 && step < 3 && (
            <div style={{ background: t.inputBg, border: `1px solid ${t.border}` }} className="mt-6 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" className="w-6 h-6"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-3l-2 5h6l-2 5M5.5 17.5L9 10h5"/></svg>
              </div>
              <div>
                <p style={{ color: t.text }} className="font-bold text-sm">Delivery Partner</p>
                <p style={{ color: t.muted }} className="text-xs">Your order is on the way</p>
              </div>
              <div className="ml-auto text-orange-500 text-xs font-bold">On the way</div>
            </div>
          )}
        </div>
      )}

      {pastOrders.length > 0 && (
        <>
          <h3 style={{ color: t.text }} className="font-black text-xl mb-4">Past Orders</h3>
          {pastOrders.map(o => {
            const names = o.items?.map(i => i.itemName || i.menuItemId?.name || 'Item').join(' · ') || '';
            const date = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            return (
              <div key={o._id} style={{ background: t.card, border: `1px solid ${t.border}` }} className="past-order-card rounded-2xl p-4 flex items-center gap-4 mb-3">
                <div style={{ background: "rgba(255,140,0,0.08)", border: `1px solid rgba(255,140,0,0.15)` }} className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FoodIllustrations.Momos />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: t.text }} className="font-bold text-sm">#{o._id?.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${o.status === 'Rejected' ? 'bg-red-500/12 text-red-400 border-red-500/20' : 'bg-green-500/12 text-green-500 border-green-500/20'}`}>{o.status}</span>
                  </div>
                  <p style={{ color: t.faint }} className="text-xs">{names}</p>
                  <p style={{ color: t.faint }} className="text-xs">{date}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-black">₹{o.finalPrice ?? o.totalPrice}</p>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
function HomePage({ setPage, setCart, isDark }) {
  const t = isDark ? themes.dark : themes.light;
  const featured = MENU_DATA.filter(i => ["Bestseller","Chef's Pick"].includes(i.tag)).slice(0,4);

  function addToCart(item) {
    setCart(prev => {
      const key = `${item.id}-${item.selectedSize}`;
      const ex = prev.find(c => `${c.id}-${c.selectedSize}` === key);
      if (ex) return prev.map(c => `${c.id}-${c.selectedSize}` === key ? { ...c, qty: c.qty+1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  const cats = [
    ["Momos", CategoryIcons.Momos],
    ["Italian", CategoryIcons.Italian],
    ["Chowmein", CategoryIcons.Chowmein],
    ["Burgers", CategoryIcons.Burgers],
    ["Sides", CategoryIcons.Sides],
    ["Drinks", CategoryIcons.Drinks],
  ];

  return (
    <div style={{ background: t.bg }}>
      <HeroSection setPage={setPage} isDark={isDark} />

      {/* Categories Bento */}
      <section className="max-w-7xl mx-auto px-4 py-16 section-enter">
        <h2 style={{ color: t.text }} className="text-3xl font-black mb-1">Browse Categories</h2>
        <p style={{ color: t.muted }} className="text-sm mb-8">Everything you crave.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {cats.map(([name, IconComp]) => (
            <button key={name} onClick={() => setPage("menu")}
              style={{ background: t.card, border: `1px solid ${t.border}`, color: "#FF8C00" }}
              className="cat-card rounded-2xl p-5 flex flex-col items-center gap-2.5">
              <div className="cat-card-icon"><IconComp /></div>
              <span style={{ color: t.muted }} className="text-sm font-bold transition-colors group-hover:text-orange-500">{name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 pb-16 section-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ color: t.text }} className="text-3xl font-black">Featured Picks</h2>
            <p style={{ color: t.muted }} className="text-sm mt-1">Most loved dishes this week</p>
          </div>
          <button onClick={() => setPage("menu")} className="btn-lift text-orange-500 hover:text-orange-400 text-sm font-bold transition-colors">View All →</button>
        </div>
        <div className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(item => <FoodCard key={item.id} item={item} onAddToCart={addToCart} isDark={isDark} />)}
        </div>
      </section>

      {/* Why us */}
      <section style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.025)", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }} className="why-us-bg py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 style={{ color: t.text }} className="text-3xl font-black text-center mb-10">Why Steamy Bites?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:"30-Min Delivery", desc:"Hot food, always on time.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
              { label:"Farm Fresh", desc:"Quality-checked every morning.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" className="w-6 h-6"><path d="M12 22V12M12 12C12 7 7 4 2 4c0 6 4 9 10 8M12 12c0-5 5-8 10-8 0 6-4 9-10 8"/></svg> },
              { label:"Best Prices", desc:"Great food at fair prices.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" className="w-6 h-6"><path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4 4 0 000-8"/></svg> },
              { label:"Live Tracking", desc:"Know where your order is.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" className="w-6 h-6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
            ].map(({ label, desc, icon }) => (
              <div key={label} style={{ background: t.card, border: `1px solid ${t.border}` }} className="feature-card rounded-2xl p-5 text-center">
                <div className="feature-icon w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">{icon}</div>
                <h4 style={{ color: t.text }} className="font-black mb-1">{label}</h4>
                <p style={{ color: t.faint }} className="text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center" style={{ background: t.bg }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth="2"><path d="M12 2C8 4 4 8 4 14a8 8 0 0016 0C20 8 16 4 12 2z" fill="white" opacity="0.4"/><path d="M9 14c0-2 1.5-4 3-5 1.5 1 3 3 3 5a3 3 0 01-6 0z" fill="white"/></svg>
          </div>
          <span style={{ color: t.text }} className="font-black">Steamy<span className="text-orange-500">Bites</span></span>
        </div>
        <p style={{ color: t.faint }} className="text-xs">© 2025 SteamyBites · Crafted with care</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? themes.dark : themes.light;
  const cartCount = cart.reduce((s,i) => s+i.qty, 0);

  return (
    <div data-theme={isDark ? "dark" : "light"} style={{ background: t.bg, minHeight: "100vh", fontFamily: "'Poppins', 'SF Pro Display', system-ui, sans-serif" }}>
      <style>{`
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes bounce{0%,100%{transform:translateY(-25%)}from,to{transform:none;animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(-15%);animation-timing-function:cubic-bezier(0,0,0.2,1)}}
        .animate-spin{animation:spin 1s linear infinite}
        .animate-pulse{animation:pulse 2s ease-in-out infinite}
        .animate-bounce{animation:bounce 1s infinite}
      `}</style>

      <Navbar cartCount={cartCount} setPage={setPage} page={page} setCartOpen={setCartOpen} user={user} setUser={setUser} isDark={isDark} toggleTheme={() => setIsDark(d => !d)} />

      {page === "home" && <HomePage setPage={setPage} setCart={setCart} isDark={isDark} />}
      {page === "menu" && <MenuPage setCart={setCart} isDark={isDark} />}
      {page === "orders" && <OrdersPage isDark={isDark} />}
      {page === "auth" && <AuthPage setUser={setUser} setPage={setPage} isDark={isDark} />}

      <CartModal cart={cart} setCart={setCart} open={cartOpen} setOpen={setCartOpen} setPage={setPage} isDark={isDark} user={user} />
    </div>
  );
}

